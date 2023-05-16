import { point } from "./point";

export type queue = {
  push: (p: point) => void;
  pop: () => point;
  isEmpty: () => boolean;
  toArray: () => point[];
};

export const makeQueue = (): queue => {
  const q: point[] = [];
  return {
    push: (p: point) => q.push(p),
    pop: () => q.shift() as point,
    isEmpty: () => q.length == 0,
    toArray: () => q,
  };
};
