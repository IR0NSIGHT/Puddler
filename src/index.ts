import { makeSet } from "./SeenSet";
import { pointToTileCoords } from "./Tile";
import { timer } from "./Timer";
import { applyRiverToTerrain } from "./applyRiver";
import { log } from "./log";
import { point } from "./point";
import {
  collectPuddleLayers,
  collectSurfaceAndBorder,
} from "./puddle";
import { capRiverStart, pathRiverFrom } from "./river";
import { floodToLevel, getZ, isWater, markPos } from "./terrain";

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
//timeJavaHashset();
//timeJavaHashsetTupled();
//timePointSet();

//t=50716

const startPoint = { x: 1072, y: 188 };

//collect connected surface TILES at this level, see if they are to many
const tiles = collectSurfaceAndBorder(
  [pointToTileCoords(startPoint)],
  makeSet(),
  70,
  10, //remaining surface
  (p: point) => false,
  (p: point) => dimension.getTile(p.x, p.y)?.getHighestIntHeight()
);

log("found tiles:" + JSON.stringify(tiles));
log(
  "height at border: " +
    JSON.stringify(
      tiles.border.map((t) =>
        dimension.getTile(t.x, t.y)?.getHighestIntHeight()
      )
    )
);
tiles.surface.forEach((t) => {
  for (let x = t.x * 128; x < (t.x + 1) * 128; x++) {
    for (let y = t.y * 128; y < (t.y + 1) * 128; y++) {
      markPos({ x: x, y: y }, 37);
    }
  }
});

tiles.border.forEach((t) => {
  for (let x = t.x * 128; x < (t.x + 1) * 128; x++) {
    for (let y = t.y * 128; y < (t.y + 1) * 128; y++) {
      markPos({ x: x, y: y }, 38);
    }
  }
});
