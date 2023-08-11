import {World2} from "./World2";

type GetWorldOp = any;
type GetLayerOp = any;
type GetTerrainOp = any;
type ImportHeightMapOp = any;
type ExportWorldOp = any;
type MergeWorldOp = any;
type SaveWorldOp = any;
type GetHeightMapOp = any;
type MappingOp = any;
type InstallCustomTerrainOp = any;
type CreateFilterOp = any;
type GetPlatformOp = any;
type ScriptException = any;
type HeightMap = any;
type MixedMaterial = any;
type Layer = any;

export interface ScriptingContext {
    getVersion(): string;
    getWorld(): GetWorldOp;
    getLayer(): GetLayerOp;
    getTerrain(): GetTerrainOp;
    createWorld(): ImportHeightMapOp;
    exportWorld(world: World2): ExportWorldOp;
    mergeWorld(): MergeWorldOp; // TODO: Define the MergeWorldOp type
    saveWorld(world: World2): SaveWorldOp;
    getHeightMap(): GetHeightMapOp;
    applyHeightMap(heightMap: HeightMap): MappingOp;
    applyLayer(layer: Layer): MappingOp;
    applyTerrain(terrainIndex: number): MappingOp;
    installCustomTerrain(terrain: MixedMaterial): InstallCustomTerrainOp;
    createFilter(): CreateFilterOp;
    getMapFormat(): GetPlatformOp;
    checkGoCalled(commandName: string): void;
}
