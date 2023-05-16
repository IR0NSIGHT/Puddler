import { point } from "./point";

export const pointToTileCoords = (p: point): point => ({
  x: Math.floor(p.x / 128),
  y: Math.floor(p.y / 128),
});
