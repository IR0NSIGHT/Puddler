import { point } from "./point";
import { markPos } from "./terrain";

export const applyRiverToTerrain = (river: point[]): void => {
    river.forEach(a => markPos(a, 37))
};
