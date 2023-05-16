import { SeenSet, makeSet } from "./SeenSet";
import { log } from "./log";
import {
  point,
  parentedPoint,
  getNeighbourPoints,
  parentedToList,
} from "./point";
import { getZ, isWater } from "./terrain";

/**
 * start a new river path at this position
 * @param pos
 */
export const pathRiverFrom = (pos: point, rivers: SeenSet): point[] => {
  log("path downhill from:" + JSON.stringify(pos));
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
  floor: boolean,
  blacklist?: parentedPoint[]
): parentedPoint[] {
  log("find closest drop from " + JSON.stringify(pos) + " floor: " + floor);
  var seenSet: SeenSet = makeSet();
  if (blacklist !== undefined) blacklist.forEach((a) => seenSet.add(a.point));

  var queue: parentedPoint[] = [{ point: pos, parent: undefined }];
  let next: parentedPoint;
  var safetyIterator = 0;
  seenSet.add(pos);
  while (queue.length != 0 && safetyIterator < 10000) {
    next = queue.shift() as parentedPoint;

    //abort condition
    if (getZ(next.point, floor) < posZ) {
      const path = parentedToList(next, []).reverse();
      return path; //TODO return path to next
    }

    var neighbours = getNeighbourPoints(next.point);
    neighbours.forEach(function (n) {
      if (getZ(n, floor) <= posZ && !seenSet.has(n)) {
        //unknown point
        seenSet.add(n);
        queue.push({ point: n, parent: next }); //add to queue
      }
    });
    safetyIterator++;
  }
  if (!floor) {
    //try again with rounded numbers
    log("try again with flooring");
    return findClosestDrop(pos, Math.floor(posZ), true);
  }
  log("failed to find lower drop, return original " + JSON.stringify(pos));
  return [];
}

export const capRiverStart = (river: point[], slice: number) => {
  return river.slice(slice);
};
