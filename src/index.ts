import {makeSet} from "./SeenSet";
import {timer} from "./Timer";
import {applyRiverToTerrain, RiverExportTarget} from "./applyRiver";
import {log} from "./log";
import {mapDimensions, point} from "./point";
import {applyPuddleToMap, Puddle, PuddleExportTarget} from "./puddle";
import {annotationColor, capRiverStart, pathRiverFrom} from "./pathing/river";
import {applyRiverOutline} from "./pathing/postprocessing";


const main = () => {
  const {
    maxSurface,
    minRiverLength,
    blocksPerRiver,
    floodPuddles,
    applyRivers,
    annotateAll
  } = params;

  if (!floodPuddles && !applyRivers && !annotateAll) {
    log("ERROR: the script will have NO EFFECT with the current settings!\nmust make/annotate puddle and/or river for script to have any effect.");
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

  type Tile = any
  const TILE_SIZE_BITS = 7;
  const SHIFT_AMOUNT = 1 << TILE_SIZE_BITS; // Equivalent to 128

  //collect all tiles
  const tiles: Tile[] = []
  for (let x = dims.start.x>>TILE_SIZE_BITS; x < dims.end.x>>TILE_SIZE_BITS; x++) {
    for (let y = dims.start.y>>TILE_SIZE_BITS; y < dims.end.y>>TILE_SIZE_BITS; y++) {
      tiles.push(dimension.getTile(x, y))
    }
  }


  const annotatedTiles = tiles.filter((t) => t.hasLayer(annotations))
      .map(tile => {
        const start: point = {x: (tile.getX() << TILE_SIZE_BITS), y: (tile.y << TILE_SIZE_BITS)};
        return {
          start: start,
          end: {x: start.x + SHIFT_AMOUNT, y: start.y + SHIFT_AMOUNT},
        }
      })
  log("annotated tiles: " + annotatedTiles.length);
  annotatedTiles.forEach((tile) => {
        for (let x = tile.start.x; x < tile.end.x; x++) {
          for (let y = tile.start.y; y < tile.end.y; y++) {
            const point = {x: x, y: y};
            if (isCyanAnnotated(point)) {
              startPoints.push(point);
            }
          }
        }
      }
  );


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
    return pathRiverFrom(start, allRiverPoints, { maxSurface: maxSurface});
  });

  const exportTargetPuddle: PuddleExportTarget = {
    annotationColor: !annotateAll ? undefined : annotationColor.PURPLE,
    flood: floodPuddles,
  }
  const exportTargetRiver: RiverExportTarget = {
    annotationColor:  !annotateAll ? undefined : annotationColor.ORANGE,
    applyRivers: applyRivers
  }

  const longRivers = rivers
      .map((a) => ({
        ...a,
        river: capRiverStart(a.river, 10)
      }))
      .filter((r) => r.river.length > minRiverLength)


  log("export target river: " + JSON.stringify(exportTargetRiver));


  log("export target puddle: " + JSON.stringify(exportTargetPuddle));

  const globalPonds = makeSet();
  longRivers.forEach(
      r => r.ponds.forEach
      (p => p.pondSurface.forEach(globalPonds.add)));

  longRivers.forEach(r => applyRiverToTerrain(r, exportTargetRiver, globalPonds));
  //longRivers.forEach(r => r.ponds.forEach(p => applyPuddleToMap(p.pondSurface, p.waterLevel, exportTargetPuddle)))

  let allPonds: Puddle[] = [];
  longRivers.map(r => r.ponds)
      .forEach(p => allPonds.push(...p))
  allPonds.sort((a, b) => b.pondSurface.length - a.pondSurface.length)

  const processedPondSurface = makeSet()
  for (let pond of allPonds) {
    //find out if this pond is embedded in another pond
    let embeddedPond = false;
    for (let surfacePoint of pond.pondSurface) {
      if (processedPondSurface.has(surfacePoint)) {
        embeddedPond = true
        break;
      }
    }
    if (embeddedPond)
      continue;

    pond.pondSurface.forEach(processedPondSurface.add)
    applyPuddleToMap(pond.pondSurface, pond.waterLevel, exportTargetPuddle)
  }


  // DEBUG
  longRivers.map(r => r.river).forEach(applyRiverOutline)
  // !DEBUG


  let totalLength = 0;
  longRivers.forEach((r) => (totalLength += r.river.length));
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
