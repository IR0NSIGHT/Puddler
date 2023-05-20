import { SeenSet, makeSet } from "./SeenSet";
import { log } from "./log";
import {
  point,
  parentedPoint,
  getNeighbourPoints,
  parentedToList,
  pointInsideMap,
  pointsEqual,
  withZ,
} from "./point";
import { getZ, isWater, markPos } from "./terrain";

/**
 * start a new river path at this position
 * @param pos
 */
export const pathRiverFrom = (pos: point, rivers: SeenSet): point[] => {
  var path: parentedPoint[] = [{ point: pos, parent: undefined }];
  var i = 0;
  var current = pos;
  let waterReached = false;
  while (i < 1000) {
    i++;
    const pathToDrop = findClosestDrop(current, getZ(current), false);
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

/**
 * find the point closest to pos thats at least one block lower
 * @param pos
 * @param posZ
 * @returns path to this point from pos where pos is the first entry, drop the last
 */
function findClosestDrop(
  pos: point,
  posZ: number,
  floor: boolean
): parentedPoint[] {
  var seenSet: SeenSet = makeSet();

  var queue: parentedPoint[] = [{ point: pos, parent: undefined }];
  let next: parentedPoint;
  var safetyIterator = 0;
  seenSet.add(pos);
  while (queue.length != 0 && safetyIterator < 10000) {
    next = queue.shift() as parentedPoint;

    //abort condition
    if (getZ(next.point, floor) < posZ) {
      const path = parentedToList(next, []).reverse();
      return path;
    }

    var neighbours = getNeighbourPoints(next.point);
    neighbours.forEach(function (n) {
      const lower = getZ(n, floor) <= posZ;
      const unseen = !seenSet.has(n);
      if (lower && unseen) {
        //unknown point
        seenSet.add(n);
        queue.push({ point: n, parent: next });
      } else {
      }
    });
    safetyIterator++;
  }
  if (!floor) {
    //try again with rounded numbers
    return findClosestDrop(pos, Math.round(posZ), true);
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
