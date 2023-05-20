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

  // for (let x = dims.start.x; x < dims.end.x; x += 50) {
  //   for (let y = dims.start.y; y < dims.end.y; y += 50) {
  //     startPoints.push({ x: x, y: y });
  //   }
  // }

  ////debug pathing

  startPoints.push({ x: 346, y: -3 });
  startPoints.push({ x: 296, y: 41 });

  let t = timer();
  t.start();
  let allRiverPoints = makeSet();

  let rivers = startPoints.map((start) => {
    const riverPath = pathRiverFrom(start, allRiverPoints);
    if (riverPath.length > 0) {
      const riverEnd = riverPath[riverPath.length - 1];
      if (!isWater(riverEnd)) {
        log(
          "puddlify river, lenght = " +
            riverPath.length +
            "end at " +
            JSON.stringify(riverEnd) +
            " z=" +
            getZ(riverEnd, true)
        );
        const myTimer = timer();
        myTimer.start();
        const layers = collectPuddleLayers(riverEnd, 6, 5000);
        const bottomZ = getZ(riverEnd, true);
        log("collection took " + myTimer.stop() + " millis");
        log("flood puddle");
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
