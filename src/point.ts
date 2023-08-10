import { getZ } from "./terrain";

export const pointsEqual = (a: point, b: point) => {
  return a.x == b.x && a.y == b.y;
};

export type parentedPoint = { point: point; parent: parentedPoint | undefined , distance: number};

export function addPoints(a: point, b: point): point {
  return { x: a.x + b.x, y: a.y + b.y };
}

export type point = { x: number; y: number };

export function getNeighbourPoints(pos: point): point[] {
  const neighs = () => {
    switch (Math.abs(pos.x + pos.y) % 4) {
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
  };
  return neighs().filter(pointInsideMap);
}

export const withZ = (p: point): point & { z: number } => ({
  x: p.x,
  y: p.y,
  z: getZ(p, true),
});

export const mapDimensions = (): { start: point; end: point } => {
  return {
    start: { x: 128 * dimension.getLowestX(), y: 128 * dimension.getLowestY() },
    end: {
      x: 128 * (dimension.getHighestX() + 1) - 1,
      y: 128 * (dimension.getHighestY() + 1) - 1,
    },
  };
};

export const pointInsideMap = (a: point) => {
  const dims = mapDimensions();
  return (
    a.x >= dims.start.x &&
    a.y >= dims.start.y &&
    a.x <= dims.end.x &&
    a.y <= dims.end.y
  );
};

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
