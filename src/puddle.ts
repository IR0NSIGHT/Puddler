import { log } from "./log";
import { getNeighbourPoints, parentedToList, point } from "./point";
import { getZ } from "./terrain";

/**
 * fill terrain with water at this position
 * dont do if puddle exceeds maxsurface at mindepth
 * @param pos
 */
export const collectPuddle = (
  pos: point,
  maxPuddleSurface: number,
  minPuddleDepth: number
): point[] => {
  //get point
  const bottomLevel = getZ(pos, true);
  log(
    "collect puddle from " +
      JSON.stringify(pos) +
      " at bottomLevel=" +
      bottomLevel
  );

  //get connected surface points at same level
  const surface = collectSurfaceAt(
    pos,
    bottomLevel + minPuddleDepth,
    maxPuddleSurface,
    (p: point) => pointLowerThan(p, bottomLevel)
  );
  if (surface == undefined) return [];
  if (!Array.isArray(surface)) {
    log(
      "puddle found escape: " +
        JSON.stringify(surface) +
        " at z=" +
        getZ(surface)
    );
    return [];
  }
  //surface is closed surface at or above level
  return surface;
};

const pointLowerThan = (pos: point, z: number) => {
  return getZ(pos, true) < z;
};

type queue = {
  push: (p: point) => void;
  pop: () => point;
  isEmpty: () => boolean;
};

const makeQueue = () => {
  const q: point[] = [];
  return {
    push: (p: point) => q.push(p),
    pop: () => q.shift() as point,
    isEmpty: () => q.length == 0,
  };
};

const makeSet = () => {
  var seenSet: string[] = [];
  const stringifyPoint = (pos: point): string => {
    return JSON.stringify([pos.x, pos.y]);
  };
  const markSeen = (pos: point) => {
    seenSet.push(stringifyPoint(pos));
  };
  const isSeen = (pos: point) => {
    return seenSet.indexOf(stringifyPoint(pos)) !== -1;
  };
  return {
    add: markSeen,
    has: isSeen,
  };
};

/**
 *
 * @param pos
 * @param maxZ
 * @param maxSize
 * @param abortCondition
 * @returns array of surface points if success, single abort point that triggered onAbort condition
 */
const collectSurfaceAt = (
  pos: point,
  maxZ: number,
  maxSize: number,
  abortCondition: (p: point) => boolean
): point[] | undefined | point => {
  const openPoints: queue = makeQueue();
  const knownPoints = makeSet();
  const closedPoints: point[] = [];

  openPoints.push(pos);
  knownPoints.add(pos);

  let currentPoint: point;

  while (!openPoints.isEmpty()) {
    currentPoint = openPoints.pop();
    closedPoints.push(currentPoint);
    if (abortCondition(currentPoint)) return currentPoint;
    if (closedPoints.length >= maxSize) return undefined;
    getNeighbourPoints(currentPoint)
      .filter((n) => !knownPoints.has(n))
      .filter((n) => pointLowerThan(n, maxZ + 1))
      .forEach((n) => {
        knownPoints.add(n);
        openPoints.push(n);
      });
  }
  return closedPoints;
};
