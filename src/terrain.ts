import { point } from "./point";

export function getZ(pos: point, floor?: boolean): number {
  const z = dimension.getHeightAt(pos.x, pos.y);
  return floor ? Math.round(z) : z;
}

export function getTerrainById(terrainId: number) {
  //@ts-ignore
  var terrain = org.pepsoft.worldpainter.Terrain.VALUES[terrainId];
  return terrain;
}

export function markPos(pos: point, id: number) {
  dimension.setTerrainAt(pos.x, pos.y, getTerrainById(id));
}

/**
 * is terrainheight lower than the waterheight at this position?
 * @param pos
 * @returns
 */
export function isWater(pos: point) {
  var terrainZ = getZ(pos);

  return terrainZ < dimension.getWaterLevelAt(pos.x, pos.y);
}

export const floodToLevel = (points: point[], level: number) => {
  points.forEach((a) => dimension.setWaterLevelAt(a.x, a.y, level));
};
