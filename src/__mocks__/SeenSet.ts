import { point, point as Point } from "../point";

export type SeenSet = {
  add: (p: Point) => void;
  has: (p: Point) => boolean;
  hasNot: (p: Point) => boolean;
};

export type SeenSetReadOnly = Omit<SeenSet, "add">;

export const makeSetFrom = (points: point[]): SeenSet => {
  const set = makeSet();
  points.forEach(set.add);
  return set;
};

export const makeSet = (): SeenSet => {
  const set = new Set();
  return {
    add: (point) => set.add(JSON.stringify([point.x, point.y])),
    has: (point) => set.has(JSON.stringify([point.x, point.y])),
    hasNot: (point) => !set.has(JSON.stringify([point.x, point.y])),
  };
};
