import { makeSet } from "./SeenSet";
import { timer } from "./Timer";
import { applyRiverToTerrain } from "./applyRiver";
import { log } from "./log";
import { mapDimensions, point } from "./point";
import { collectPuddleLayers } from "./puddle";
import { capRiverStart, pathRiverFrom } from "./river";
import { floodToLevel, getZ, isWater } from "./terrain";

const main = () => {
  let startPoints: point[] = [];
  const dims = mapDimensions();
  log("map dimension: " + JSON.stringify(dims));

  for (let x = dims.start.x; x < dims.end.x; x += 50) {
    for (let y = dims.start.y; y < dims.end.y; y += 50) {
      startPoints.push({ x: x, y: y });
    }
  }

  ////debug pathing

  // startPoints.push({ x: 346, y: -3 });
  // startPoints.push({ x: 296, y: 41 });
  //
  // startPoints.push({ x: 97, y: -108 });
  // startPoints.push({ x: 46, y: -109 });
  // startPoints.push({ x: 47, y: -158 });
  // startPoints.push({ x: 141, y: -154 });

  //startPoints.push({ x: 1203, y: 798 });
  //startPoints.push({ x: 1248, y: 797 });
  //startPoints.push({ x: 1297, y: 798 });

  //
  let t = timer();
  t.start();
  let allRiverPoints = makeSet();

  let rivers = startPoints.map((start) => {
    const riverPath = pathRiverFrom(start, allRiverPoints);
    if (riverPath.length > 0) {
      const riverEnd = riverPath[riverPath.length - 1];
      if (!isWater(riverEnd)) {
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
};

main();
