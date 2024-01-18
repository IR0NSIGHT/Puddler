import {
  getNeighbourPointsDiagonal,
  point,
  squaredDistance,
  withZ,
  zPoint,
} from "../point";
import { makeSet, SeenSetReadOnly } from "../SeenSet";

export type layerPoint = zPoint & { parent: zPoint };
export type layer = layerPoint[];
export type RiverPath = point[];
export const collectLayers = (
  river: RiverPath,
  iterations: number,
): layer[] => {
  const ignoreAsNeighbour = makeSet();
  const layers: layer[] = [];
  const firstLayer: layer = river.map((p) => ({
    ...withZ(p),
    parent: withZ(p),
  }));
  firstLayer.forEach(ignoreAsNeighbour.add);
  layers.push(firstLayer);

  let origins: layer = firstLayer;
  const parents: zPoint[] = river.map(withZ);
  for (let i = 0; i < iterations; i++) {
    const layer = collectOneLayer(origins, parents, ignoreAsNeighbour);
    layer.forEach(ignoreAsNeighbour.add);
    layers.push(layer);
    origins = layer; //set new start points
    layer.forEach((p) => {
      if (p.parent === undefined)
        throw new Error(
          "p.parent is undefined for " + JSON.stringify(p.parent),
        );
    });
  }

  return layers;
};

export const collectOneLayer = (
  origins: layerPoint[],
  parents: zPoint[],
  invalidNeighbours: SeenSetReadOnly,
): layer => {
  const originsSet = makeSet();
  const nsSet = makeSet();
  origins.forEach(originsSet.add);
  const neighbours: layerPoint[] = [];
  origins.forEach((p) => {
    const ns = getNeighbourPointsDiagonal(p)
      .filter(nsSet.hasNot)
      .filter(originsSet.hasNot)
      .filter(invalidNeighbours.hasNot)
      .map((n) => ({ ...withZ(n), parent: findParent(n, parents) }));
    neighbours.push(...ns);
    ns.forEach(nsSet.add);
  });
  return neighbours;
};

/**
 * choose the layerpoint that is closes to to p as the parent, return parent
 * @param p
 * @param list
 * @independent
 */
const findParent = (p: point, list: zPoint[]): zPoint => {
  const idx = findClosestIndex(p, list);
  if (idx == -1)
    throw new Error(
      "no parent found found point " +
        JSON.stringify(p) +
        " in list " +
        JSON.stringify(list),
    );
  return list[idx];
};

/**
 * get index of closest point.
 * if not point is closer than initial distance, return -1
 * if two points are equally close, return the one with a lower z value
 * if two points are equally close and have the same z value, return the one with the lowest index
 * @param origin
 * @param list
 * @independent
 */
export const findClosestIndex = (origin: point, list: zPoint[]): number => {
  const candidates = list.map((candidate, i) => ({
    point: candidate,
    idx: i,
    distance: squaredDistance(candidate, origin),
  }));
  let chosen: { point: zPoint; idx: number; distance: number } | undefined =
    undefined;
  candidates.forEach((candidate) => {
    if (chosen === undefined) {
      chosen = candidate;
    }
    if (
      candidate.distance == chosen.distance &&
      candidate.point.z < chosen.point.z
    ) {
      chosen = candidate;
    }
    if (candidate.distance < chosen.distance) {
      chosen = candidate;
    }
  });

  return chosen!.idx;
};
