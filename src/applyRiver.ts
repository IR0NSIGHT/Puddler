import { point } from "./point";
import { minFilter } from "./river";
import { isWater, markPos, setWaterLevel, setZ } from "./terrain";

export const applyRiverToTerrain = (river: point[]): void => {
  river
    .filter((a) => !isWater(a))
    .map(minFilter)
    .forEach((a) => {
      setZ(a.point, a.z - 1);
      setWaterLevel(a.point, a.z);
      //markPos(a.point, 37);
    });
};
