import {point} from "./point";
import {annotateAll} from "./puddle";

export function getZ(pos: point, floor?: boolean): number {
  const z = dimension.getHeightAt(pos.x, pos.y);
  return floor ? Math.round(z) : z;
}

export const setWaterLevel = (p: point, z: number): void => {
  dimension.setWaterLevelAt(p.x, p.y, Math.round(z));
};

export function setZ(pos: point, z: number): void {
  dimension.setHeightAt(pos.x, pos.y, z);
}

export function getTerrainById(terrainId: number) {
  //@ts-ignore
  var terrain = org.pepsoft.worldpainter.Terrain.VALUES[terrainId];
  return terrain;
}

export function markPos(pos: point, id: number) {
  const points = []
  for (var i = -4; i <= 4; i++) {
    points.push({x :pos.x + i, y: pos.y - i});
    points.push({x :pos.x + i, y: pos.y + i});
  }
  annotateAll(points, id);
}

/**
 * is terrainheight lower than the waterheight at this position?
 * @param pos
 * @returns
 */
export function isWater(pos: point) {
  var terrainZ = getZ(pos, true);

  return terrainZ < dimension.getWaterLevelAt(pos.x, pos.y);
}

export const floodToLevel = (points: point[], level: number) => {
  points.forEach((a) => dimension.setWaterLevelAt(a.x, a.y, level));
};
