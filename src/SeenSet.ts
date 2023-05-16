import { point as Point } from "./point";

export type SeenSet = {
    add: (p: Point) => void;
    has: (p: Point) => boolean;
    hasNot: (p: Point) => boolean;
  };
  
export  const makeSet = (): SeenSet => {
    var seenSet: string[] = [];
    const stringifyPoint = (pos: Point): string => {
      return JSON.stringify([pos.x, pos.y]);
    };
    const markSeen = (pos: Point) => {
      seenSet.push(stringifyPoint(pos));
    };
    const isSeen = (pos: Point) => {
      return seenSet.indexOf(stringifyPoint(pos)) !== -1;
    };
    return {
      add: markSeen,
      has: isSeen,
      hasNot: (a: Point) => !isSeen(a),
    };
  };