import { makeSet } from "./SeenSet";
import { timer } from "./Timer";
import { applyRiverToTerrain } from "./applyRiver";
import { log } from "./log";
import { mapDimensions, point } from "./point";
import { capRiverWithPond } from "./puddle";
import { capRiverStart, pathRiverFrom } from "./river";

const main = () => {
  const {
    maxSurface,
    minDepth,
    minRiverLength,
    blocksPerRiver,
    makePuddles: makePuddle,
    makeRivers,
    mustEndInPuddle,
  } = params;

  if (!makePuddle && !makeRivers) {
    log("ERROR: must make puddle and/or river for script to have any effect.");
    return;
  }

  log("max surface = " + maxSurface);
  let startPoints: point[] = [];
  const dims = mapDimensions();
  log("map dimension: " + JSON.stringify(dims));

  //@ts-ignore
  const annotations = org.pepsoft.worldpainter.layers.Annotations.INSTANCE;
  const isCyanAnnotated = (p: point): boolean => {
    return dimension.getLayerValueAt(annotations, p.x, p.y) == 9;
  };

  for (let x = dims.start.x; x < dims.end.x; x++) {
    for (let y = dims.start.y; y < dims.end.y; y++) {
      const point = { x: x, y: y };
      if (isCyanAnnotated(point)) {
        startPoints.push(point);
      }
    }
  }

  const passRandom = (p: point, chance: number): boolean => {
    const seed = p.x * p.y + p.x;
    //@ts-ignore
    const randGen: any = new java.util.Random(seed);
    return randGen.nextFloat() < chance;
  };

  //TODO user option (checkbox) to remove annotation from used points

  let t = timer();
  t.start();
  let allRiverPoints = makeSet();
  log("total possible starts: " + startPoints.length);
  const filter = (p: point) => passRandom(p, 1 / blocksPerRiver);
  let rivers = startPoints.filter(filter).map((start) => {
    return pathRiverFrom(start, allRiverPoints);
  });

  if (makePuddle) {
    rivers.forEach((riverPath) => {
      capRiverWithPond(riverPath, maxSurface, minDepth);
    });
  }

  rivers = rivers
    .map((a) => capRiverStart(a, 10))
    .filter((r) => r.length > minRiverLength);

  if (makeRivers) rivers.forEach(applyRiverToTerrain);

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
