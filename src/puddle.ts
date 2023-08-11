import {makeQueue, queue} from "./PointQueue";
import {makeSet, SeenSet} from "./SeenSet";
import {getNeighbourPoints, point,} from "./point";
import {floodToLevel, getZ, isWater} from "./terrain";
import {log} from "./log";

export type PuddleExportTarget = {
  flood: boolean,
  annotationColor: number | undefined
}


export const annotateAll = (points: point[], annotationColor: number) => {
  points.forEach((p: point) => {
    dimension.setLayerValueAt(org.pepsoft.worldpainter.layers.Annotations.INSTANCE, p.x, p.y, annotationColor);
  })
}
/**
 *
 * @param river
 * @param maxSurface
 * @param minDepth
 * @param target
 * @returns true if river is finishing in pond or existing waterbody
 */
export const capRiverWithPond = (river: point[], maxSurface: number, minDepth: number, target: PuddleExportTarget): boolean => {
  if (river.length == 0) {
    return false;
  }

  const riverEnd = river[river.length - 1];
  //if (isWater(riverEnd)) {
  //  return true;
  //}


  const {layers, seenSet, totalSurface} = collectPuddleLayers(riverEnd, 15, maxSurface);
  if (layers.length < minDepth) {
    return false;
  }

  const targetWaterLevel = getZ(riverEnd, true) + layers.length - 1;
  if (target.flood)
    layers.forEach((l: point[]) => floodToLevel(l, targetWaterLevel))

  if (target.annotationColor !== undefined)
    layers.forEach((layer: point[], index ) => annotateAll(layer, target.annotationColor!))

  const outerLayer = layers[layers.length - 1];

  annotateAll(outerLayer, 10)
  log("generated puddle at " + JSON.stringify(riverEnd) + " with " + layers.length + " layers ")
  return true;
}

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
): { layers: point[][]; seenSet: SeenSet, totalSurface: number } => {
  let level = getZ(start, true);

  //iterators
  let nextLevelOpen = [start];
  let totalSurface = 0;

  const seenSet = makeSet();
  const surfaceLayers: point[][] = [];
  log("collect puddle layers for start " + JSON.stringify(start) + " max layers: " + maxLayers + " max surface: " + maxSurface);
  for (let i = 0; i < maxLayers; level++, i++) {
    if (nextLevelOpen.length == 0) break;

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
  return {layers: surfaceLayers, seenSet: seenSet, totalSurface: totalSurface};
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
