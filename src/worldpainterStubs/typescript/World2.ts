import {Dimension} from "./Dimension";

type Anchor = any; // Define the actual type for Anchor
type Generator = any; // Define the actual type for Generator
type Platform = any; // Define the actual type for Platform
type GameType = any; // Define the actual type for GameType
type WorldExportSettings = any; // Define the actual type for WorldExportSettings
type HistoryEntry = any; // Define the actual type for HistoryEntry
type BorderSettings = any; // Define the actual type for BorderSettings
type AttributeKey<T> = any; // Define the actual type for AttributeKey
type CoordinateTransform = any; // Define the actual type for CoordinateTransform
type ProgressReceiver = any; // Define the actual type for ProgressReceiver
type Layer = any; // Define the actual type for Layer
type Optional<T> = any; // Define the actual type for Optional
type Direction = any;
type Role = any;

type Set<T> = any
type Map<A,B> = any
interface Point {
    x: number;
    y: number;
}


type PropertyChangeListener = any;
type MixedMaterial = any;
type Serializable = any;
type ZipOutputStream = any;

export interface World2 {
    readonly BIOME_ALGORITHM_NONE: number;
    readonly BIOME_ALGORITHM_CUSTOM_BIOMES: number;
    readonly BIOME_ALGORITHM_AUTO_BIOMES: number;
    readonly DEFAULT_MAX_HEIGHT: number;
    readonly DEFAULT_OCEAN_SEED: number;
    readonly DEFAULT_LAND_SEED: number;
    readonly METADATA_KEY_WP_VERSION: string;
    readonly METADATA_KEY_WP_BUILD: string;
    readonly METADATA_KEY_TIMESTAMP: string;
    readonly METADATA_KEY_PLUGINS: string;
    readonly METADATA_KEY_NAME: string;

    getChangeNo(): number;

    getName(): string;

    setName(name: string): void;

    isCreateGoodiesChest(): boolean;

    setCreateGoodiesChest(createGoodiesChest: boolean): void;

    getTileCoordinates(worldX: number, worldY: number): Point;

    getTileCoordinates(worldCoords: Point): Point;

    getSpawnPoint(): Point;

    setSpawnPoint(spawnPoint: Point): void;

    getImportedFrom(): File;

    setImportedFrom(importedFrom: File): void;

    isMapFeatures(): boolean;

    setMapFeatures(mapFeatures: boolean): void;

    getGameType(): GameType;

    setGameType(gameType: GameType): void;

    addPropertyChangeListener(listener: PropertyChangeListener): void;

    addPropertyChangeListener(propertyName: string, listener: PropertyChangeListener): void;

    removePropertyChangeListener(listener: PropertyChangeListener): void;

    removePropertyChangeListener(propertyName: string, listener: PropertyChangeListener): void;

    getDimension(dim: number): Dimension; // Deprecated
    isDimensionPresent(anchor: Anchor): boolean;

    getDimension(anchor: Anchor): Dimension;

    getDimensions(): Set<Dimension>;

    getDimensionsWithRole(role: Role, inverted: boolean, id: number): Set<Dimension>;

    addDimension(dimension: Dimension): void;

    removeDimension(anchor: Anchor): Dimension;

    getMixedMaterial(index: number): MixedMaterial;

    setMixedMaterial(index: number, material: MixedMaterial): void;

    getMinHeight(): number;

    setMinHeight(minHeight: number): void;

    getMaxHeight(): number;

    setMaxHeight(maxHeight: number): void;

    getGenerator(): Generator; // Deprecated
    getPlatform(): Platform;

    setPlatform(platform: Platform): void;

    isAskToConvertToAnvil(): boolean;

    setAskToConvertToAnvil(askToConvertToAnvil: boolean): void;

    isAskToRotate(): boolean;

    setAskToRotate(askToRotate: boolean): void;

    getUpIs(): Direction;

    setUpIs(upIs: Direction): void;

    isAllowMerging(): boolean;

    setAllowMerging(allowMerging: boolean): void;

    isAllowCheats(): boolean;

    setAllowCheats(allowCheats: boolean): void;

    getGeneratorOptions(): string; // Deprecated
    isExtendedBlockIds(): boolean;

    setExtendedBlockIds(extendedBlockIds: boolean): void;

    getDifficulty(): number;

    setDifficulty(difficulty: number): void;

    getExportSettings(): WorldExportSettings;

    setExportSettings(exportSettings: WorldExportSettings): void;

    getHistory(): HistoryEntry[];

    addHistoryEntry(key: number, ...args: Serializable[]): void;

    getMetadata(): Map<string, any>;

    setMetadata(metadata: Map<string, any>): void;

    getBorderSettings(): BorderSettings;

    getMergedWith(): File;

    setMergedWith(mergedWith: File): void;

    getDataPacks(): File[];

    setDataPacks(dataPacks: File[]): void;

    getAttribute<T>(key: AttributeKey<T>): Optional<T>;

    setAttribute<T>(key: AttributeKey<T>, value: T): void;

    transform(transform: CoordinateTransform, progressReceiver: ProgressReceiver): void;

    transform(anchor: Anchor, transform: CoordinateTransform, progressReceiver: ProgressReceiver): void;

    clearLayerData(layer: Layer): void;

    measureSize(): number;

    save(out: ZipOutputStream): void;


}
