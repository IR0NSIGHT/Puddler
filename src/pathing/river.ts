import {makeSet, SeenSet} from "../SeenSet";
import {log} from "../log";
import {addPoints, getNeighbourPoints, parentedPoint, parentedToList, point,} from "../point";
import {getZ, isWater} from "../terrain";
import {applyPuddleToMap, findPondOutflow} from "../puddle";

const testIfDownhill = (path: point[]) => {
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
  while (safetyIt < 1000) {
    safetyIt++;
    if (getZ(current, true) < 62) //base water level reached
        break;

    let pathToDrop = findClosestDrop([current], getZ(current));

    if (pathToDrop.length == 0) {
      //abort if closestDrop coulndt find anything
      const pond = findPondOutflow([current], 10000)
      if (pond.escapePoint !== undefined) {
        applyPuddleToMap(pond.pondSurface, pond.waterLevel, {annotationColor: undefined, flood: true});
        pathToDrop = pond.pondSurface.map(p => ({point: p, parent: path[path.length - 1], distance: -1}))
        //FIXME pond filling can happen backwards, trying to fill already filled ponds.
        // currently there is no record keeping of which blocks to ignore for pond-escape point search!
        const escapeFromPond: parentedPoint = {point: pond.escapePoint!, parent: path[path.length - 1], distance: -1}
        pathToDrop.push(escapeFromPond);
      } else {
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
 * @param startingPoints
 * @param posZ
 * @returns path to this point from pos where pos is the first entry, drop the last
 */
export function findClosestDrop(
  startingPoints: point[],
  posZ: number,
): parentedPoint[] {
  const seenSet: SeenSet = makeSet();

  const queue: parentedPoint[] = [];
  startingPoints.forEach((p) => {
    queue.push({ point: p, parent: undefined, distance: 0 })
    seenSet.add(p);
  });
  let next: parentedPoint;
  let safetyIterator = 0;
  let searchCenter: point = averagePoint(startingPoints)


  while (queue.length != 0 && safetyIterator < 10000) {
    next = queue.shift() as parentedPoint;

    //abort condition
    if (getZ(next.point, true) < Math.round(posZ)) {
      const path = parentedToList(next, []).reverse();
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

     //   markPos(next.point, 3)
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

/**
 * will get the z of the lowest neighbour of the riverpoint (which is the point after the point in the river)
 * @param river point array that flows from high to low
 * @returns river with z values
 */
export const minFilter = (
  p: point,
  i: number,
  river: point[]
): { point: point; z: number } => {
  const neiZs = getNeighbourPoints(p).map((a) => getZ(a, true));
  const minNeighbourNonRiver = Math.min.apply(Math, neiZs);
  return {
    point: p,
    z: minNeighbourNonRiver,
  };
};
