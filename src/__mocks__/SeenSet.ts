import { point as Point } from "../point";

export type SeenSet = {
    add: (p: Point) => void;
    has: (p: Point) => boolean;
    hasNot: (p: Point) => boolean;
};

export type SeenSetReadOnly = Omit<SeenSet,"add">


export const makeSet = (): SeenSet => {
    const set = new Set();
    return {
        add: (point) => set.add(JSON.stringify(point)),
        has: (point) => set.has(JSON.stringify(point)),
        hasNot: (point) => !set.has(JSON.stringify(point))
    }
};
