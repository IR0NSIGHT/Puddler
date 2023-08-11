import {makeQueue, queue} from "./PointQueue";
import {makeSet, SeenSet} from "./SeenSet";
import {getNeighbourPoints, point,} from "./point";
import {floodToLevel, getZ} from "./terrain";
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


  const {layers, seenSet, totalSurface} = collectPuddleLayers([riverEnd], 15, maxSurface);
  if (layers.length < minDepth) {
    return false;
  }

  const targetWaterLevel = getZ(riverEnd, true) + layers.length;
  if (target.flood)
    layers.forEach((l: point[]) => floodToLevel(l, targetWaterLevel))

  if (target.annotationColor !== undefined)
    layers.forEach((layer: point[], index) => annotateAll(layer, target.annotationColor!))

  const outerLayer = layers[layers.length - 2];

  //annotateAll(outerLayer, 10)
  log("generated puddle at " + JSON.stringify(riverEnd) + " with " + layers.length + " layers ")

  /*
  const escapeSet = makeSet()
  layers[layers.length - 2].forEach(escapeSet.add) //add the second outer layer to the escape set, so it wont search inwards
  //try and find an escape route
  //collect surface BLOCKS
  if (outerLayer.length != 0) {

    const puddleLevel = getZ(outerLayer[0], true);

    const {surface, border, earlyPoint, exceeded} = collectSurfaceAndBorder(
        outerLayer,
        seenSet,
        maxSurface, //equally distributed by level, stop earlier
        (p: point) => getZ(p, true) < puddleLevel,
        (p: point) => getZ(p, true) == puddleLevel
    );
    if (earlyPoint !== undefined) {
      annotateAll(surface, 11)
      markPos(earlyPoint, 4)
    }


  }   */

  return true;
}

/**
 * collect the connected layers in the puddle, grouped by level
 * @param start
 * @param maxLayers
 * @param maxSurface
 * @param seenSet
 */
export const collectPuddleLayers = (
    start: point[],
    maxLayers: number,
    maxSurface: number,
    seenSet: SeenSet = makeSet(),
): { layers: point[][]; seenSet: SeenSet, totalSurface: number } => {
  let level = getZ(start[0], true);

  //iterators
  let open = start;
  let totalSurface = 0;

  const surfaceLayers: point[][] = [];
  log("collect puddle layers for start " + JSON.stringify(start) + " max layers: " + maxLayers + " max surface: " + maxSurface);
  for (let i = 0; i < maxLayers; level++, i++) {
    if (open.length == 0) {
      log("no more open blocks, stop collecting layers");
      break;
    }

    //collect surface BLOCKS
    const {surface, border, earlyPoint, exceeded} = collectSurfaceAndBorder(
        open,  //starting points for surface collection
        seenSet,
        maxSurface, //equally distributed by level, stop earlier
        (p: point) => false,
        (p: point) => getZ(p, true) <= level
    )!;

    //stop if total surface would be exceeded
    if (exceeded || totalSurface + surface.length > maxSurface) {
      log(`total surface exceeded at additional ${surface.length} + existing ${totalSurface}, stop collecting layers`);
      annotateAll(surface, 14)
      surfaceLayers.forEach((layer) => annotateAll(layer, 13))
      break;
    }

    //FIXME assert surface is never empty: if unprocessedBorder is not empty(should be impossible) and surface is empty, then the surface collection failed
    surfaceLayers.push(surface);
    totalSurface += surface.length;

    //prepare next run
    open = border;
  }
  return {layers: surfaceLayers, seenSet: seenSet, totalSurface: totalSurface};
};

/**
 * collect points that are valid surface blocks into the surface list.
 * collect direct neighbours of surface that are not valid surface blocks into the border list.
 * runs until its finds no more connected surface blocks or maxSurface is exceeded
 * @param openArr starting points in queue. not guaranteed to go into surface.
 * @param seenSet only unseen points will be processed, or added to border or surface lists.
 * @param level surface level
 * @param maxSurface return undefine if maxSurface is exceeded
 * @param returnEarly stop if this returns true for a point, return what was collected
 * @param isValidSurface boolean function to split blocks into surface and border
 */
export const collectSurfaceAndBorder = (
    openArr: point[],
    seenSet: SeenSet,
    maxSurface: number,
    returnEarly: (p: point) => boolean,
    isValidSurface: (p: point) => boolean,
): { surface: point[]; border: point[], earlyPoint: point | undefined, exceeded: boolean } => {
  //use next level open that was collected before
  const surface: queue = makeQueue();

  const border: queue = makeQueue();

  //prepare open queue
  const open = makeQueue();
  openArr.forEach(open.push);
  openArr.forEach(seenSet.add);

  let i = 0;
  let exceeded = false;
  let earlyPoint: point | undefined = undefined;
  while (!open.isEmpty()) {
    i++;

    const currentPoint = open.pop();

    if (i > maxSurface) {
      exceeded = true;
      break;
    }

    if (returnEarly(currentPoint)) {
      earlyPoint = currentPoint;
      break;
    }


    if (isValidSurface(currentPoint)) surface.push(currentPoint);
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
    border: border.toArray(),
    earlyPoint: earlyPoint,
    exceeded: exceeded
  };
};
