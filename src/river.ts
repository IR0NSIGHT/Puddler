import { log } from "./log";
import {
  point,
  parentedPoint,
  getNeighbourPoints,
  parentedToList,
} from "./point";
import { collectPuddle } from "./puddle";
import { floodToLevel, getZ, isWater, markPos } from "./terrain";

/**
 * start a new river path at this position
 * @param pos
 */
export const pathRiverFrom = (pos: point): point[] => {
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
    log("path to drop: " + JSON.stringify(pathToDrop.map((a) => a.point)));
    pathToDrop.forEach((a) => path.push(a));
    //end of path is droppoint
    current = pathToDrop[pathToDrop.length - 1].point;

    if (isWater(current)) {
      //TODO abort if meets existing river
      waterReached = true;
      break;
    }

    log(JSON.stringify(current) + " z=" + getZ(current));
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
  var seenSet: string[] = [];
  if (blacklist !== undefined) blacklist.forEach((a) => markSeen(a.point));
  const markSeen = (pos: point) => {
    seenSet.push(JSON.stringify(pos));
  };
  const isSeen = (pos: point) => {
    return seenSet.indexOf(JSON.stringify(pos)) !== -1;
  };
  var queue: parentedPoint[] = [{ point: pos, parent: undefined }];
  let next: parentedPoint;
  var safetyIterator = 0;
  markSeen(pos);
  while (queue.length != 0 && safetyIterator < 10000) {
    next = queue.shift() as parentedPoint;

    //abort condition
    if (getZ(next.point, floor) < posZ) {
      log("listify endpoint:" + JSON.stringify(next));
      const path = parentedToList(next, []).reverse();
      path.forEach((p) =>
        log(
          "point=" +
            JSON.stringify(p.point) +
            " parent=" +
            JSON.stringify(p.parent?.point)
        )
      );
      return path; //TODO return path to next
    }

    var neighbours = getNeighbourPoints(next.point);
    neighbours.forEach(function (n) {
      if (getZ(n, floor) <= posZ && !isSeen(n)) {
        //unknown point
        markSeen(n);
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
