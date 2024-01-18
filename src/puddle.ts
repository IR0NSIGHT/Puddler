import { makeQueue, queue } from "./PointQueue";
import { makeSet, SeenSetReadOnly } from "./SeenSet";
import { getNeighbourPoints, point } from "./point";
import { floodToLevel, getZ } from "./terrain";
import { log } from "./log";

export type PuddleExportTarget = {
  flood: boolean;
  annotationColor: number | undefined;
};

export type Puddle = {
  pondSurface: point[];
  waterLevel: number;
  depth: number;
  escapePoint: point | undefined;
};

export const annotateAll = (points: point[], annotationColor: number) => {
  points.forEach((p: point) => {
    dimension.setLayerValueAt(
      org.pepsoft.worldpainter.layers.Annotations.INSTANCE,
      p.x,
      p.y,
      annotationColor,
    );
  });
};

export const applyPuddleToMap = (
  puddleSurface: point[],
  waterLevel: number,
  target: PuddleExportTarget,
) => {
  if (target.flood) floodToLevel(puddleSurface, waterLevel);

  if (target.annotationColor !== undefined)
    annotateAll(puddleSurface, target.annotationColor!);
};

/**
 *
 * @param startPos starting positions for search. index zero will be considered bottom height of pond. should all be same height
 * @param maxSurface
 * @param ignoreAsEscape ignore these points trying to escape. will still be part of surface.
 * @returns true if river is finishing in pond or existing waterbody
 */
export const findPondOutflow = (
  startPos: point[],
  maxSurface: number,
  ignoreAsEscape: SeenSetReadOnly,
): Puddle => {
  const { layers, escapePoint } = collectPuddleLayers(
    startPos,
    maxSurface,
    ignoreAsEscape,
  );

  const surfacePoints: point[] = [];
  layers.forEach((layer) => surfacePoints.push(...layer));

  return {
    pondSurface: surfacePoints,
    waterLevel: getZ(startPos[0], true) + layers.length,
    depth: layers.length,
    escapePoint: escapePoint,
  };
};

/**
 * collect the connected layers in the puddle, grouped by level
 * @param start
 * @param maxLayers
 * @param maxSurface
 * @param ignoreSet will not be mutated. ignore these points when collecting layers. are considered "invalid neighbours"
 */
export const collectPuddleLayers = (
  start: point[],
  maxSurface: number,
  ignoreSet: SeenSetReadOnly,
): {
  layers: point[][];
  totalSurface: number;
  escapePoint: point | undefined;
} => {
  if (start.length == 0)
    throw new Error("collectPuddleLayers: start array is empty");

  let level = getZ(start[0], true);
  const internalSeenSet = makeSet();
  //iterators
  let open = start;
  let totalSurface = 0;

  const surfaceLayers: point[][] = [];
  let escapePoint = undefined;
  for (let i = 0; i < 256; level++, i++) {
    if (open.length == 0) {
      break;
    }

    //collect surface BLOCKS
    const { surface, border, earlyPoint, exceeded } = collectSurfaceAndBorder(
      open, //starting points for surface collection
      internalSeenSet,
      maxSurface, //equally distributed by level, stop earlier
      (p: point) => ignoreSet.hasNot(p) && getZ(p, true) < level,
      (p: point) => getZ(p, true) <= level,
    )!;

    if (earlyPoint !== undefined) {
      escapePoint = earlyPoint;
      break;
    }

    //stop if total surface would be exceeded
    if (exceeded || totalSurface + surface.length > maxSurface) {
      log(
        `total surface exceeded at additional ${surface.length} + existing ${totalSurface}, stop collecting layers`,
      );
      // annotateAll(surface, 10)
      //markPos(surface[0],10)
      //  surfaceLayers.forEach((layer) => annotateAll(layer, 13))

      break;
    }

    surfaceLayers.push(surface);
    surface.forEach(internalSeenSet.add);
    totalSurface += surface.length;

    //prepare next run
    open = border;
  }
  return {
    layers: surfaceLayers,
    totalSurface: totalSurface,
    escapePoint: escapePoint,
  };
};

export type PondGenerationParams = {
  maxSurface: number;
};
/**
 * collect points that are valid surface blocks into the surface list.
 * collect direct neighbours of surface that are not valid surface blocks into the border list.
 * runs until its finds no more connected surface blocks or maxSurface is exceeded
 * @param openArr starting points in queue. not guaranteed to go into surface.
 * @param ignoreSet ignore these points when testing returnEarly. readonly.
 * @param maxSurface return undefine if maxSurface is exceeded
 * @param returnEarly stop if this returns true for a point, return what was collected
 * @param isValidSurface boolean function to split blocks into surface and border
 */
export const collectSurfaceAndBorder = (
  openArr: point[],
  ignoreSet: SeenSetReadOnly,
  maxSurface: number,
  returnEarly: (p: point) => boolean,
  isValidSurface: (p: point) => boolean,
): {
  surface: point[];
  border: point[];
  earlyPoint: point | undefined;
  exceeded: boolean;
} => {
  const seenSet = makeSet();
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
    const newNeighbors = ns.filter(seenSet.hasNot).filter(ignoreSet.hasNot);
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
    exceeded: exceeded,
  };
};
