import { makeSet } from "./SeenSet";
import { timer } from "./Timer";
import { applyRiverToTerrain } from "./applyRiver";
import { log } from "./log";
import { mapDimensions, point } from "./point";
import { capRiverWithPond, collectPuddleLayers } from "./puddle";
import { capRiverStart, pathRiverFrom } from "./river";
import { floodToLevel, getZ, isWater } from "./terrain";

const main = () => {
  const { maxSurface, minDepth, minRiverLength } = params;

  log("max surface = " + maxSurface);
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
    capRiverWithPond(riverPath, maxSurface, minDepth);
    return riverPath;
  });

  rivers = rivers
    .map((a) => capRiverStart(a, 10))
    .filter((r) => r.length > minRiverLength);

  rivers.forEach(applyRiverToTerrain);

  let totalLength = 0;
  rivers.forEach((r) => (totalLength += r.length));
  //collect puddles
  log(
    "script too =" +
      t.stop() / 1000 +
      " seconds for " +
      rivers.length +
      " rivers.\nGenerated " +
      totalLength +
      " meters of river."
  );
};

main();
