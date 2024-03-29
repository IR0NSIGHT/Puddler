import { makeSet } from "./SeenSet";
import { timer } from "./Timer";
import { RiverExportTarget } from "./applyRiver";
import { log } from "./log";
import { mapDimensions, point } from "./point";
import { applyPuddleToMap, Puddle, PuddleExportTarget } from "./puddle";
import {
  annotationColor,
  capRiverStart,
  pathRiverFrom,
  River,
} from "./pathing/river";
import { applyRiverLayers } from "./pathing/postprocessing";
import {getZ} from "./terrain";

const TILE_SIZE_BITS = 7;
const SHIFT_AMOUNT = 1 << TILE_SIZE_BITS; // Equivalent to 128

const getAllTiles = (): Tile[] =>{
  const dims = mapDimensions();
  const tiles = []
  for (
      let x = dims.start.x >> TILE_SIZE_BITS;
      x < dims.end.x >> TILE_SIZE_BITS;
      x++
  ) {
    for (
        let y = dims.start.y >> TILE_SIZE_BITS;
        y < dims.end.y >> TILE_SIZE_BITS;
        y++
    ) {
      const tile = dimension.getTile(x, y);
      if (tile != null) tiles.push(tile);
    }
  }
  return tiles
}

const allAnnotatedPoints = (tiles: Tile[]): point[] => {
  const annotations = org.pepsoft.worldpainter.layers.Annotations.INSTANCE;
  const isCyanAnnotated = (p: point): boolean => {
    return dimension.getLayerValueAt(annotations, p.x, p.y) == 9;
  };

  const annotatedTiles = tiles
      .filter((t) => t.hasLayer(annotations))
      .map((tile) => {
        const start: point = {
          x: (tile.x << TILE_SIZE_BITS),
          y: (tile.y << TILE_SIZE_BITS),
        };
        return {
          start: start,
          end: { x: start.x + SHIFT_AMOUNT, y: start.y + SHIFT_AMOUNT },
        };
      });
  const startPoints: point[] = []
  annotatedTiles.forEach((tile) => {
    for (let x = tile.start.x; x < tile.end.x; x++) {
      for (let y = tile.start.y; y < tile.end.y; y++) {
        const point = { x: x, y: y };
        if (isCyanAnnotated(point)) {
          startPoints.push(point);
        }
      }
    }
  });
  return startPoints
}
type Tile = { x: number, y: number, hasLayer: any};

const main = () => {
  const {
    maxSurface,
    minRiverLength,
    blocksPerRiver,
    floodPuddles,
    applyRivers,
    annotateAll,
  } = params;

  log("max surface = " + maxSurface);
  const dims = mapDimensions();
  log("map dimension: " + JSON.stringify(dims));

  const sortHighestFirst = (ps: point[]): point[] => {
    ps.sort((a,b) => getZ(b) - getZ(a));
    return ps;
  }
  const startPoints: point[] = sortHighestFirst(allAnnotatedPoints(getAllTiles()))

   const passRandom = (p: point, chance: number): boolean => {
    const seed = p.x * p.y + p.x;
    //@ts-expect-error: provided by worldpainter context
    return new java.util.Random(seed).nextFloat() < chance;
  };

  const t = timer();
  t.start();
  const allRiverPoints = makeSet();
  log("total possible starts: " + startPoints.length);
  const filter = (p: point) => passRandom(p, 1 / blocksPerRiver);
  const rivers = startPoints.filter(filter).map((start) => {
    return pathRiverFrom(start, allRiverPoints, {maxSurface: maxSurface});
  });

  const exportTargetPuddle: PuddleExportTarget = {
    annotationColor: !annotateAll ? undefined : annotationColor.PURPLE,
    flood: floodPuddles,
  };
  const exportTargetRiver: RiverExportTarget = {
    annotationColor: !annotateAll ? undefined : annotationColor.ORANGE,
    applyRivers: applyRivers,
  };

  const longRivers: River[] = rivers
    .map((a) => ({
      ...a,
      path: capRiverStart(a.path, 10),
    }))
    .filter((r) => r.path.length > minRiverLength);

  log("export target river: " + JSON.stringify(exportTargetRiver));
  log("export target puddle: " + JSON.stringify(exportTargetPuddle));

  applyToMap(longRivers, exportTargetRiver, exportTargetPuddle)

  let totalLength = 0;
  longRivers.forEach((r) => (totalLength += r.path.length));
  //collect puddles
  log(
    "script too =" +
      t.stop() / 1000 +
      " seconds for " +
      rivers.length +
      " rivers.\nGenerated " +
      totalLength +
      " meters of river.",
  );
};

const applyToMap = (longRivers: River[], exportTargetRiver: RiverExportTarget, exportTargetPuddle: PuddleExportTarget) => {
  const globalPonds = makeSet();
  longRivers.forEach((river) =>
      river.ponds.forEach((pond) => {
        pond.pondSurface.forEach(globalPonds.add);
      }),
  );

  const allPonds = collectSortedPondsOfRivers(longRivers);
  const addPondToSeenSet = (pond: Puddle) => {
    pond.pondSurface.forEach(globalPonds.add);
  };
  allPonds.forEach(addPondToSeenSet);

  // DEBUG
  longRivers
      .map((r) => r.path)
      .forEach((r) => applyRiverLayers(r, globalPonds, exportTargetRiver));
  // !DEBUG

  const processedPondSurface = makeSet();
  for (const pond of allPonds) {
    //find out if this pond is embedded in another pond
    let embeddedPond = false;
    for (const surfacePoint of pond.pondSurface) {
      if (processedPondSurface.has(surfacePoint)) {
        embeddedPond = true;
        break;
      }
    }
    if (embeddedPond) continue;

    pond.pondSurface.forEach(processedPondSurface.add);
    applyPuddleToMap(pond.pondSurface, pond.waterLevel, exportTargetPuddle);
  }
}

const collectSortedPondsOfRivers = (rivers: River[]): Puddle[] => {
  const allPonds: Puddle[] = [];
  rivers.map((r) => r.ponds).forEach((p) => allPonds.push(...p));
  allPonds.sort((a, b) => b.pondSurface.length - a.pondSurface.length);
  return allPonds;
};

main();
