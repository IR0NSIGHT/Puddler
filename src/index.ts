import {makeSet} from "./SeenSet";
import {timer} from "./Timer";
import {applyRiverToTerrain, RiverExportTarget} from "./applyRiver";
import {log} from "./log";
import {mapDimensions, point} from "./point";
import {annotateAll, applyPuddleToMap, findPondOutflow, PuddleExportTarget} from "./puddle";
import {capRiverStart, pathRiverFrom} from "./pathing/river";
import {getZ, isWater, markPos} from "./terrain";

const main = () => {
  const {
    maxSurface,
    minDepth,
    minRiverLength,
    blocksPerRiver,
    floodPuddles,
    applyRivers,
    exportRiverToAnnotation,
    exportRiverWaterDepth,
    exportRiverTerrainDepth,
    exportPuddleToAnnotation
  } = params;

  if (!floodPuddles && !applyRivers && exportRiverToAnnotation < 0 && exportPuddleToAnnotation < 0) {
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

  const exportTargetPuddle: PuddleExportTarget = {
    annotationColor: (params.exportPuddleToAnnotation < 0) ? undefined : params.exportPuddleToAnnotation,
    flood: floodPuddles,
  }
  const exportTargetRiver: RiverExportTarget = {
    annotationColor: (params.exportRiverToAnnotation < 0) ? undefined : params.exportRiverToAnnotation,
    terrainDepth: (params.exportRiverTerrainDepth < 0) ? undefined : params.exportRiverTerrainDepth,
    waterlevel: (params.exportRiverWaterDepth < 0) ? undefined : params.exportRiverWaterDepth,
    applyRivers: applyRivers
  }

  const longRivers = rivers
      .map((a) => capRiverStart(a, 10))
      .filter((r) => r.length > minRiverLength )


  log("export target river: " + JSON.stringify(exportTargetRiver));


  log("export target puddle: " + JSON.stringify(exportTargetPuddle));
  longRivers  //FIXME cap all potetntial rivers, not just hte long one
      .forEach((riverPath) => {
        log("river start: " +  JSON.stringify(riverPath[0]) + " end: " +  JSON.stringify(riverPath[riverPath.length-1]))
        log("river downhill: " + riverPath.map((a) => getZ(a, true)).join(","))
        riverPath.forEach((p) => annotateAll([p], Math.max(1,Math.min(15,getZ(p, true) - 62))))
        //markPos(riverPath[0], 2)
        //markPos(riverPath[riverPath.length-1], 3)
        const pond = findPondOutflow([riverPath[riverPath.length-1]], maxSurface);
        applyPuddleToMap(pond.pondSurface, pond.waterLevel, exportTargetPuddle);

      });

  longRivers.forEach(r => applyRiverToTerrain(r, exportTargetRiver));

  let totalLength = 0;
  longRivers.forEach((r) => (totalLength += r.length));
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
