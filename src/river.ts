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
      if (isWater(point.point)) {
        waterReached = true;
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
  const seenArr: point[] = [];

  var queue: parentedPoint[] = [{ point: pos, parent: undefined }];
  let next: parentedPoint;
  var safetyIterator = 0;
  seenSet.add(pos);
  seenArr.push(pos);
  log(
    "find closest drop from " +
      JSON.stringify(pos) +
      " z = " +
      posZ +
      " floor: " +
      floor
  );
  while (queue.length != 0 && safetyIterator < 10000) {
    next = queue.shift() as parentedPoint;

    //abort condition
    if (getZ(next.point, floor) < posZ) {
      const path = parentedToList(next, []).reverse();
      return path; //TODO return path to next
    }

    var neighbours = getNeighbourPoints(next.point);
    neighbours.forEach(function (n) {
      const lower = getZ(n, floor) <= posZ;
      const unseen = !seenSet.has(n);
      if (lower && unseen) {
        //unknown point
        seenSet.add(n);
        seenArr.push(n);
        queue.push({ point: n, parent: next }); //add to queue
      } else {
        log(
          "neighbour rejected: " +
            JSON.stringify(withZ(n)) +
            " lower: " +
            lower +
            " unseen: " +
            unseen
        );
      }
    });
    safetyIterator++;
  }
  if (!floor) {
    //try again with rounded numbers
    log("try again with flooring");
    return findClosestDrop(pos, Math.round(posZ), true);
  }
  //mark tested:
  seenArr.forEach((p) => markPos(p, 38));

  log("failed to find lower drop, return original " + JSON.stringify(pos));
  log("seen arr: " + JSON.stringify(seenArr.map(withZ)));
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
  const nextLower = river[i == river.length - 1 ? river.length - 1 : i + 1];
  const neiZs = getNeighbourPoints(p)
    .filter((a) => !pointsEqual(a, nextLower))
    .map((a) => getZ(a, true));
  const minNeighbourNonRiver = Math.min.apply(Math, neiZs);
  return {
    point: p,
    z: minNeighbourNonRiver,
  };
};
