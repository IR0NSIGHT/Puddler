import { makeSet } from "./SeenSet";
import {
  timeJavaHashset,
  timeJavaHashsetTupled,
  timePointSet,
} from "./TimeDebug";
import { timer } from "./Timer";
import { applyRiverToTerrain } from "./applyRiver";
import { log } from "./log";
import { point } from "./point";
import { collectPuddle, collectPuddleLayers } from "./puddle";
import { capRiverStart, pathRiverFrom } from "./river";
import { floodToLevel, getZ, isWater } from "./terrain";

const startPoints: point[] = [];
//for (let x = 0; x < 10; x++) {
//  for (let y = 0; y < 10; y++) {
//    startPoints.push({ x: x * 100, y: y * 100 });
//  }
//}
//

////debug pathing
startPoints.push({ x: 627, y: 1418 });
startPoints.push({ x: 637, y: 1499 });
startPoints.push({ x: 799, y: 400 });
startPoints.push({ x: 904, y: 286 });

const t = timer();
t.start();
const allRiverPoints = makeSet();
const rivers = startPoints.map((start) => {
  const riverPath = pathRiverFrom(start, allRiverPoints);
  if (riverPath.length > 0) {
    const riverEnd = riverPath[riverPath.length - 1];
    if (!isWater(riverEnd)) {
      log(
        "puddlify river end at " +
          JSON.stringify(riverEnd) +
          " z=" +
          getZ(riverEnd, true)
      );
      const layers = collectPuddleLayers(riverEnd, 6, 5000);
      const bottomZ = getZ(riverEnd, true);
      layers.forEach((l: point[], idx: number) => {
        floodToLevel(l, bottomZ + layers.length - 1);
      });
    }
  }
  return riverPath;
});

rivers
  .map((a) => capRiverStart(a, 10))
  .filter((r) => r.length > 50)
  .forEach(applyRiverToTerrain);
//collect puddles
log("t=" + t.stop());
//timeJavaHashset();
//timeJavaHashsetTupled();
//timePointSet();

//t=50716
