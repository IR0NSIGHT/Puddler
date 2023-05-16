import { getZ } from "./terrain";

export const pointsEqual = (a: point, b: point) => {
  return a.x == b.x && a.y == b.y;
};

export type parentedPoint = { point: point; parent: parentedPoint | undefined };

export function addPoints(a: point, b: point): point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export type point = { x: number; y: number };

export function getNeighbourPoints(pos: point): point[] {
  switch ((pos.x + pos.y) % 4) {
    case 0:
      return [
        addPoints({ x: -1, y: 0 }, pos),
        addPoints({ x: 1, y: 0 }, pos),
        addPoints({ x: 0, y: -1 }, pos),
        addPoints({ x: 0, y: 1 }, pos),
      ];
    case 1:
      return [
        addPoints({ x: 1, y: 0 }, pos),
        addPoints({ x: 0, y: -1 }, pos),
        addPoints({ x: 0, y: 1 }, pos),
        addPoints({ x: -1, y: 0 }, pos),
      ];
    case 2:
      return [
        addPoints({ x: 0, y: -1 }, pos),
        addPoints({ x: 0, y: 1 }, pos),
        addPoints({ x: -1, y: 0 }, pos),
        addPoints({ x: 1, y: 0 }, pos),
      ];
    case 3:
      return [
        addPoints({ x: 0, y: 1 }, pos),
        addPoints({ x: -1, y: 0 }, pos),
        addPoints({ x: 1, y: 0 }, pos),
        addPoints({ x: 0, y: -1 }, pos),
      ];
    default:
      throw new Error("impossible");
  }
}

export const parentedToList = (
  endPoint: parentedPoint,
  list: parentedPoint[]
): parentedPoint[] => {
  list.push(endPoint);
  if (endPoint.parent === undefined) return list;
  return parentedToList(endPoint.parent, list); //its recursion B)
};

export const pointLowerThan = (pos: point, z: number) => {
  return getZ(pos, true) < z;
};
