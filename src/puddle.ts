import { queue, makeQueue } from "./PointQueue";
import { makeSet, SeenSet } from "./SeenSet";
import { pointToTileCoords } from "./Tile";
import {
  getNeighbourPoints,
  parentedToList,
  point,
  pointLowerThan,
} from "./point";
import { getZ, markPos } from "./terrain";

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

  //iterators
  let nextLevelOpen = [start];
  let totalSurface = 0;

  const seenSet = makeSet();
  const surfaceLayers: point[][] = [];

  for (let level = getZ(start, true); level <= maxLevel; level++) {
    if (nextLevelOpen.length == 0) break;
    const remainingSurfaceBlocks = maxSurface - totalSurface;

    //collect surface BLOCKS
    const { surface, border } = collectSurfaceAndBorder(
      nextLevelOpen,
      seenSet,
      level,
      maxSurface, //equally distributed by level, stop earlier
      (p: point) => false,
      (p: point) => getZ(p, true)
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

export const collectSurfaceAndBorder = (
  openArr: point[],
  seenSet: SeenSet,
  level: number,
  maxSurface: number,
  failEarly: (p: point) => boolean,
  getZ: (p: point) => number
): { surface: point[]; border: point[] } => {
  //use next level open that was collected before
  const surface: queue = makeQueue();

  const border: queue = makeQueue();
  const isAtOrBelowSurfaceLevel = (p: point) => getZ(p) <= level;

  //prepare open queue
  const open = makeQueue();
  openArr.forEach(open.push);
  openArr.forEach(seenSet.add);

  let i = 0;
  while (!open.isEmpty()) {
    i++;

    const currentPoint = open.pop();

    if (i > maxSurface || failEarly(currentPoint)) {
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
