import { SeenSet, makeSet } from "./SeenSet";
import { log } from "./log";
import {
  point,
  parentedPoint,
  getNeighbourPoints,
  parentedToList,
} from "./point";
import { getZ, isWater, markPos } from "./terrain";

/**
 * start a new river path at this position
 * @param pos
 */
export const pathRiverFrom = (pos: point, rivers: SeenSet): point[] => {
  const path: parentedPoint[] = [{ point: pos, parent: undefined, distance: 0 }];
  let i = 0;
  let current = pos;
  let waterReached = false;
  while (i < 1000) {
    i++;
    const pathToDrop = findClosestDrop(current, getZ(current));
    if (pathToDrop.length == 0)
      //abort if closestDrop coulndt find anything
      break;
    for (let point of pathToDrop) {
      if (isWater(point.point) || rivers.has(point.point)) {
        if (rivers.has(point.point)) waterReached = true;
        break;
      }
      path.push(point);
      // rivers.add(point.point);
    }
    if (waterReached) break;
    //end of path is droppoint
    current = pathToDrop[pathToDrop.length - 1].point;
  }
  log(
    "river stopped at " +
      JSON.stringify(path[path.length - 1].point) +
      " water reached: " +
      waterReached
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

/**
 * find the point closest to pos thats at least one block lower
 * @param pos
 * @param posZ
 * @returns path to this point from pos where pos is the first entry, drop the last
 */
export function findClosestDrop(
  pos: point,
  posZ: number,
): parentedPoint[] {
  const seenSet: SeenSet = makeSet();

  const queue: parentedPoint[] = [{ point: pos, parent: undefined, distance: 0 }];
  let next: parentedPoint;
  let safetyIterator = 0;
  seenSet.add(pos);
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
        insertInSortedQueue(queue, { point: n, parent: next, distance: squaredDistanceBetweenPoints(n, pos) });
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
