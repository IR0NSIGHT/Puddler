import {Dimension} from "./worldpainterStubs/typescript/Dimension";
import {World2} from "./worldpainterStubs/typescript/World2";
import {ScriptingContext} from "./worldpainterStubs/typescript/ScriptingContext";

declare const wp: ScriptingContext;
declare const world: World2;
declare const dimension: Dimension;
declare const org: any; //org.pepsoft java package
declare const params: {
  maxSurface: number;
  minDepth: number;
  minRiverLength: number;
  blocksPerRiver: number;
  floodPuddles: boolean;
  applyRivers: boolean;
  exportRiverToAnnotation: number;
  exportRiverWaterDepth: number;
  exportRiverTerrainDepth: number;

  exportPuddleToAnnotation: number;
};
