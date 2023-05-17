import { makeSet } from "./SeenSet";
import { timer } from "./Timer";
import { applyRiverToTerrain } from "./applyRiver";
import { log } from "./log";
import { point } from "./point";
import { collectPuddleLayers } from "./puddle";
import { capRiverStart, pathRiverFrom } from "./river";
import { floodToLevel, getZ, isWater } from "./terrain";

const main = () => {
  let startPoints: point[] = [];
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {
      startPoints.push({ x: x * 100, y: y * 100 });
    }
  }

  ////debug pathing
  startPoints.push({ x: 627, y: 1418 });
  startPoints.push({ x: 637, y: 1499 });
  startPoints.push({ x: 799, y: 400 });
  startPoints.push({ x: 904, y: 286 });

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
          floodToLevel(l, bottomZ + layers.length - 2);
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

  //@ts-ignore
  log("previous script testvar value: " + JSON.stringify(myTestVar));
  let myTestVar;
  myTestVar = "Hello World";
  log("set testvar value");
};

main();
