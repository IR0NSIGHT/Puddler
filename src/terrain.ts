import {point} from "./point";
import {annotateAll} from "./puddle";

export function getZ(pos: point, round: boolean = true): number {
  const z = dimension.getHeightAt(pos.x, pos.y);
  return round ? Math.round(z) : z;
}

export const setWaterLevel = (p: point, z: number): void => {
  dimension.setWaterLevelAt(p.x, p.y, Math.round(z));
};

export function setZ(pos: point, z: number): void {
  dimension.setHeightAt(pos.x, pos.y, z);
}

export function getTerrainById(terrainId: number) {
  return org.pepsoft.worldpainter.Terrain.VALUES[terrainId];
}

export function markPos(pos: point, id: number) {
  const points = [];
  for (let i = -4; i <= 4; i++) {
    points.push({ x: pos.x + i, y: pos.y - i });
    points.push({ x: pos.x + i, y: pos.y + i });
  }
  annotateAll(points, id);
}

/**
 * is terrainheight lower than the waterheight at this position?
 * @param pos
 * @returns
 */
export function isWater(pos: point) {
  return getZ(pos, true) < dimension.getWaterLevelAt(pos.x, pos.y);
}

export const floodToLevel = (points: point[], level: number) => {
  points.forEach((a) => dimension.setWaterLevelAt(a.x, a.y, level));
};
