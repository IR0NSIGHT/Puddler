import { point, point as Point } from "./point";

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
  //@ts-ignore
  const seenSet: any = new java.util.HashSet<string>();

  const stringifyPoint = (pos: Point): string => {
    return JSON.stringify([pos.x, pos.y]);
  };
  const markSeen = (pos: Point) => {
    seenSet.add(stringifyPoint(pos));
  };
  const isSeen = (pos: Point) => {
    return seenSet.contains(stringifyPoint(pos));
  };
  return {
    add: markSeen,
    has: isSeen,
    hasNot: (a: Point) => !isSeen(a),
  };
};
