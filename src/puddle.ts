import { queue, makeQueue } from "./PointQueue";
import { makeSet, SeenSet } from "./SeenSet";
import { log } from "./log";
import {
  getNeighbourPoints,
  parentedToList,
  point,
  pointLowerThan,
} from "./point";
import { getZ } from "./terrain";

/**
 * collect the connected layers in the puddle, grouped by level
 * @param start
 * @param maxLayers
 * @param maxSurface
 */
export const collectPuddleLayers = (
  start: point,
  maxLayers: number,
  maxSurface: number
): point[][] => {
  let level = getZ(start, true);
  const maxLevel = level + maxLayers;
  log(
    "collect puddle layers from " +
      JSON.stringify(start) +
      "from z=" +
      level +
      " to " +
      maxLevel
  );

  //iterators
  let nextLevelOpen = [start];
  let totalSurface = 0;

  const seenSet = makeSet();
  const surfaceLayers: point[][] = [];

  for (let level = getZ(start, true); level <= maxLevel; level++) {
    if (nextLevelOpen.length == 0) break;

    const { surface, border: border } = collectSurfaceAndBorder(
      nextLevelOpen,
      seenSet,
      level,
      (p: point) => false
    );
    log(
      "collected layer: size=" + surface.length + " borderSize=" + border.length
    );
    //stop if total surface would be exceeded
    if (totalSurface + surface.length > maxSurface) break;

    //add surface to list of layers
    surfaceLayers.push(surface);
    totalSurface += surface.length;

    //prepare next run
    nextLevelOpen = border;
  }
  return surfaceLayers;
};

const collectSurfaceAndBorder = (
  openArr: point[],
  seenSet: SeenSet,
  level: number,
  failIf: (p: point) => boolean
): { surface: point[]; border: point[] } => {
  log("collect closed layer+border at level" + level);
  //use next level open that was collected before
  const surface: queue = makeQueue();

  const border: queue = makeQueue();
  const isAtOrBelowSurfaceLevel = (p: point) => getZ(p, true) <= level;

  //prepare open queue
  const open = makeQueue();
  openArr.filter(isAtOrBelowSurfaceLevel).forEach(open.push);
  openArr.filter((a) => !isAtOrBelowSurfaceLevel(a)).forEach(border.push);
  openArr.forEach(seenSet.add);

  while (!open.isEmpty()) {
    const currentPoint = open.pop();

    if (failIf(currentPoint)) {
      log("fail early for: " + JSON.stringify(currentPoint));
      return { surface: [], border: [] };
    }

    if (isAtOrBelowSurfaceLevel(currentPoint)) surface.push(currentPoint);
    else {
      border.push(currentPoint);
      continue;
    }

    const ns = getNeighbourPoints(currentPoint);
    const newNeighbors = ns.filter(seenSet.hasNot);
    //mark as seen
    newNeighbors.forEach((a) => {
      seenSet.add(a);
      open.push(a);
    });
  }

  return {
    surface: surface.toArray(),
    border: border.toArray(), //todo: maybe return the blocks below surface too and let wrapper decide how to handle?
  };
};

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
