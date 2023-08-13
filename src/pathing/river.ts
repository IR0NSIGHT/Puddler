import {makeSet, SeenSet} from "../SeenSet";
import {addPoints, getNeighbourPoints, parentedPoint, parentedToList, point,} from "../point";
import {getZ, isWater, markPos} from "../terrain";
import {findPondOutflow, PondGenerationParams} from "../puddle";
import {log} from "../log";

export const testIfDownhill = (path: point[]) => {
  for (let i = 0; i < path.length - 1; i++) {
    const current = getZ(path[i], true);
    const next = getZ(path[i + 1], true)
    if (next > current)
      return false;
  }
  return true;
}
export const annotationColor = {
  PURPLE: 10,
  ORANGE: 2,
  YELLOW: 5,
  RED: 14
};

/**
 * start a new river path at this position
 * @param pos
 * @param rivers
 * @param pondParams
 */
export const pathRiverFrom = (pos: point, rivers: SeenSet, pondParams: PondGenerationParams): {river: point[], ponds: {pondSurface: point[], waterLevel: number, depth: number, escapePoint: point | undefined}[] } => {
  const path: parentedPoint[] = [{point: pos, parent: undefined, distance: -1}];
  let safetyIt = 0;
  let current = pos;
  let riverMerged = false;
  const thisRiverSet = makeSet();
  const puddleDebugSet = makeSet();
  const ponds = [];

  while (safetyIt < 1000) {
    safetyIt++;
    if (getZ(current, true) < 62) //base water level reached
        break;

    let pathToDrop = findClosestDrop(current, getZ(current));

    if (pathToDrop == undefined) {
      //abort if closestDrop coulndt find anything
      const pond = findPondOutflow([current], pondParams.maxSurface, puddleDebugSet)
      //applyPuddleToMap(pond.pondSurface, pond.waterLevel, {annotationColor: undefined, flood: true});

      if (pond.escapePoint !== undefined) {
        ponds.push(pond);
        pond.pondSurface.forEach(puddleDebugSet.add);

        const escapePoint: parentedPoint = {point: pond.escapePoint!, parent: path[path.length - 1], distance: -1}

        const thisPond = makeSet();
        pond.pondSurface.forEach(thisPond.add);
        //connect pond to escape
        const pathEscapeToPond = findClosestDrop(
            escapePoint.point,
            pond.waterLevel,
            (p) => thisPond.has(p), //we found a connection to the pond surface!
        )
        if (pathEscapeToPond == undefined) {
        //  markPos(current, annotationColor.RED)
        //  markPos(escapePoint.point, annotationColor.YELLOW)
          log("couldnt find path to escape point: " + JSON.stringify(escapePoint.point))
          break;
        }
        pathToDrop = pathEscapeToPond.reverse();
        pathToDrop.shift(); //remove connectionpoint on pond surface
        pathToDrop.push(escapePoint);
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
  path.forEach((p) => rivers.add(p.point));
  return { river: path.map((a) => a.point), ponds: ponds};
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
 * @param isDrop
 * @param isValidNeighbour
 * @returns path to this point with drop being the last
 */
export function findClosestDrop(
    startingPoint: point,
    posZ: number,
    isDrop: (p: point) => boolean = (p) => getZ(next.point, true) < Math.round(posZ),
    isValidNeighbour: (p: point) => boolean = (p) => getZ(p, false) <= posZ
): parentedPoint[]|undefined {
  const seenSet: SeenSet = makeSet();

  const queue: parentedPoint[] = [];
  queue.push({ point: startingPoint, parent: undefined, distance: 0 })
  seenSet.add(startingPoint);
  let next: parentedPoint;
  let safetyIterator = 0;
  let searchCenter: point = startingPoint

  while (queue.length != 0 && safetyIterator < 50000) {
    next = queue.shift() as parentedPoint;

    if (isDrop(next.point)) {
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
        return aZ - bZ;
      });
    }

    neighbours.filter(isValidNeighbour).forEach((n) => {
      seenSet.add(n);
      insertInSortedQueue(queue, {point: n, parent: next, distance: squaredDistanceBetweenPoints(n, searchCenter)});
    });
    safetyIterator++;
  }
  return undefined;
}

export const capRiverStart = (river: point[], slice: number) => {
  return river.slice(slice);
};
