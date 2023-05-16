import { applyRiverToTerrain } from "./applyRiver";
import { log } from "./log";
import { point } from "./point";
import { collectPuddle, collectPuddleLayers } from "./puddle";
import { pathRiverFrom } from "./river";
import {
  floodToLevel,
  getTerrainById,
  getZ,
  isWater,
  markPos,
} from "./terrain";

const startPoints: point[] = [];
//for (let x = 0; x < 10; x++) {
// for (let y = 0; y < 10; y++) {
//   startPoints.push({ x: x * 100, y: y * 100 });
// }
//}

//debug pathing
startPoints.push({ x: 627, y: 1418 });
startPoints.push({ x: 637, y: 1499 });
const rivers = startPoints.map(pathRiverFrom);
rivers.forEach(applyRiverToTerrain);
//collect puddles

const puddles = rivers
  .filter((r) => r.length > 0)
  .map((r) => r[r.length - 1])
  .filter((p) => !isWater(p))
  .map((p) => {
    const riverEnd = p;
    log("puddlify river end at " + p + " z=" + getZ(p, true));
    const puddleDepth = 6;
    const layers = collectPuddleLayers(p, 6, 10000);
    const bottomZ = getZ(riverEnd, true);
    log("collected layers: " + JSON.stringify(layers));
    layers.forEach((l: point[], idx: number) => {
      //floodToLevel(l, bottomZ + puddleDepth)
      l.forEach((p) => markPos(p, idx + 10));
    });
  });
