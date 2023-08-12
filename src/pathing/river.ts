import {makeSet, SeenSet} from "../SeenSet";
import {log} from "../log";
import {addPoints, getNeighbourPoints, parentedPoint, parentedToList, point,} from "../point";
import {getZ, isWater, markPos} from "../terrain";
import {annotateAll, applyPuddleToMap, findPondOutflow} from "../puddle";

export const testIfDownhill = (path: point[]) => {
  for (let i = 0; i < path.length - 1; i++) {
    const current = getZ(path[i], true);
    const next = getZ(path[i + 1], true)
    if (next > current)
      return false;
  }
  return true;
}


/**
 * start a new river path at this position
 * @param pos
 * @param rivers
 */
export const pathRiverFrom = (pos: point, rivers: SeenSet): point[] => {
  const path: parentedPoint[] = [{point: pos, parent: undefined, distance: -1}];
  let safetyIt = 0;
  let current = pos;
  let riverMerged = false;
  const thisRiverSet = makeSet();
  const puddleDebugSet = makeSet();

  while (safetyIt < 1000) {
    safetyIt++;
    if (getZ(current, true) < 62) //base water level reached
        break;

    let pathToDrop = findClosestDrop(current, getZ(current));

    if (pathToDrop.length == 0) {
      //abort if closestDrop coulndt find anything
      const pond = findPondOutflow([current], 1000000, puddleDebugSet)
      applyPuddleToMap(pond.pondSurface, pond.waterLevel, {annotationColor: undefined, flood: true});

      if (pond.escapePoint !== undefined) {

        //debug
        const illegal = pond.pondSurface.filter( puddleDebugSet.has);
        annotateAll(illegal, 14);
        if (illegal.length > 0)
          break;
        pond.pondSurface.forEach(puddleDebugSet.add);
        annotateAll(pond.pondSurface, 12)
        //debug end


        pathToDrop = pond.pondSurface.map(p => ({point: p, parent: path[path.length - 1], distance: -1}))
        //FIXME pond filling can happen backwards, trying to fill already filled ponds.
        // currently there is no record keeping of which blocks to ignore for pond-escape point search!
        const escapeFromPond: parentedPoint = {point: pond.escapePoint!, parent: path[path.length - 1], distance: -1}
        pathToDrop.push(escapeFromPond);
      } else {
        markPos(current, 14)
        break;
      }
    }



    //add found path to riverpoint list, until water/river is reached
    for (let point of pathToDrop) {
      if (rivers.has(point.point)) {
        riverMerged = true;
        break;
      }

      if (isWater(point.point)) {
        break;
      }
      path.push(point);
      thisRiverSet.add(point.point);
      // rivers.add(point.point);
    }
    if (riverMerged) break;
    //end of path is droppoint
    current = pathToDrop[pathToDrop.length - 1].point;
  }
  log(
      "river stopped at " +
      JSON.stringify(path[path.length - 1].point) +
      " river merged: " +
      riverMerged
  );
  path.forEach((p) => rivers.add(p.point));
  return path.map((a) => a.point);
};


export const squaredDistanceBetweenPoints = (a: point, b: point) => {
    const diff = {x: a.x-b.x, y: a.y-b.y};
    return diff.x*diff.x + diff.y*diff.y;
}

export const insertInSortedQueue = (sortedQueue: parentedPoint[], point: parentedPoint): void => {
    let i = 0;
    for (let iteratorPoint of sortedQueue) {
          if (iteratorPoint.distance > point.distance) break;
          i++;
    }
    sortedQueue.splice(i, 0, point);
}


export const averagePoint = (points: point[]): point => {
    const sum = points.reduce((a, b) => addPoints(a, b), {x: 0, y: 0});
    return {x: sum.x / points.length, y: sum.y / points.length};
}

/**
 * find the point closest to pos thats at least one block lower
 * @param startingPoint
 * @param posZ
 * @returns path to this point with drop being the last
 */
export function findClosestDrop(
  startingPoint: point,
  posZ: number,
): parentedPoint[] {
  const seenSet: SeenSet = makeSet();

  const queue: parentedPoint[] = [];
  queue.push({ point: startingPoint, parent: undefined, distance: 0 })
  seenSet.add(startingPoint);
  let next: parentedPoint;
  let safetyIterator = 0;
  let searchCenter: point = startingPoint

  while (queue.length != 0 && safetyIterator < 10000) {
    next = queue.shift() as parentedPoint;

    //abort condition
    if (getZ(next.point, true) < Math.round(posZ)) {
      const path = parentedToList(next, []).reverse();
      //path starts with startingPoint, which is not wanted
      path.shift();
      return path;
    }

    let neighbours = getNeighbourPoints(next.point).filter(seenSet.hasNot);
    const trueLowerNeighbours = neighbours.filter(n => getZ(n, true) < Math.round(posZ));
    if (trueLowerNeighbours.length == 0) {
        //no lower neighbour, river is in flat area => sort by tinyest height difference
        neighbours = neighbours.sort((a, b) => {
            const aZ = getZ(a, false);
            const bZ = getZ(b, false);
            return aZ-bZ;
        });
    }

    neighbours.forEach(function (n) {
      const lower = getZ(n, false) <= posZ;
      if (lower) {
        //unknown point
        seenSet.add(n);
        insertInSortedQueue(queue, { point: n, parent: next, distance: squaredDistanceBetweenPoints(n, searchCenter) });
      } else {
      }
    });
    safetyIterator++;
  }
  return [];
}

export const capRiverStart = (river: point[], slice: number) => {
  return river.slice(slice);
};


export const getZWrapper = (pos: point, floor: boolean): number => {
  return getZ(pos, floor);
}
