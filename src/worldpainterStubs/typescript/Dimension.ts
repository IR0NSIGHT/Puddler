type UUID = string; // Define the actual type for UUID
type Point = { x: number; y: number }; // Define the actual type for Point
type Terrain = any; // Define the actual type for Terrain
type Border = any; // Define the actual type for Border
type TileFactory = any; // Define the actual type for TileFactory
type Overlay = any; // Define the actual type for Overlay
type MapGenerator = any; // Define the actual type for MapGenerator
type WallType = any; // Define the actual type for WallType
type ExportSettings = any; // Define the actual type for ExportSettings
type Listener = any; // Define the actual type for Listener
type Tile = any; // Define the actual type for Tile
type AttributeKey<T> = any; // Define the actual type for AttributeKey
type ProgressReceiver = any; // Define the actual type for ProgressReceiver
type Set<T> = any; // Define the actual type for Set
type TileVisitationBuilder = any;
type ExporterSettings = any;
type LayerAnchor = any;
type Anchor = any;

type Map<A, B> = any

export interface Dimension {
    POSSIBLE_AUTO_BIOMES: number[];

    getWorld(): World2;

    setWorld(world: World2): void;

    getAnchor(): Anchor;

    getId(): UUID;

    getName(): string;

    setName(name: string): void;

    getChangeNo(): number;

    changed(): void;

    getSeed(): number;

    getSubsurfaceMaterial(): Terrain;

    setSubsurfaceMaterial(subsurfaceMaterial: Terrain): void;

    isPopulate(): boolean;

    setPopulate(populate: boolean): void;

    getBorder(): Border;

    setBorder(border: Border): void;

    getBorderLevel(): number;

    setBorderLevel(borderLevel: number): void;

    getBorderSize(): number;

    setBorderSize(borderSize: number): void;

    getTileFactory(): TileFactory;

    isTilePresent(x: number, y: number): boolean;

    isBorderTile(x: number, y: number): boolean;

    getTile(x: number, y: number): Tile;

    getTile(coords: Point): Tile;

    getTileForEditing(x: number, y: number): Tile;

    getTileForEditing(coords: Point): Tile;

    getExtent(): Rectangle;

    getTileCount(): number;

    getTiles(): Tile[];

    getTileCoords(): Set<Point>;

    addTile(tile: Tile): void;

    removeTile(tileX: number, tileY: number): void;

    removeTile(tile: Tile): void;

    removeTile(coords: Point): void;

    getHighestX(): number;

    getHighestY(): number;

    getLowestX(): number;

    getLowestY(): number;

    getWidth(): number;

    getHeight(): number;

    getIntHeightAt(x: number, y: number): number;

    getIntHeightAt(x: number, y: number, defaultHeight: number): number;

    getIntHeightAt(coords: Point): number;

    getLowestIntHeight(): number;

    getHighestIntHeight(): number;

    getIntHeightRange(): number[];

    getHeightAt(x: number, y: number): number;

    getHeightAt(coords: Point): number;

    getLowestHeight(): number;

    getHighestHeight(): number;

    getHeightRange(): number[];

    setHeightAt(x: number, y: number, height: number): void;

    setHeightAt(coords: Point, height: number): void;

    getRawHeightAt(x: number, y: number): number;

    getLowestRawHeight(): number;

    getHighestRawHeight(): number;

    getRawHeightRange(): number[];

    getRawHeightAt(coords: Point): number;

    setRawHeightAt(x: number, y: number, rawHeight: number): void;

    setRawHeightAt(coords: Point, rawHeight: number): void;

    getSlope(x: number, y: number): number;

    getTerrainAt(x: number, y: number): Terrain;

    setTerrainAt(x: number, y: number, terrain: Terrain): void;

    getAllTerrains(): Set<Terrain>;

    setTerrainAt(coords: Point, terrain: Terrain): void;

    applyTheme(x: number, y: number): void;

    getWaterLevelAt(x: number, y: number): number;

    getWaterLevelAt(coords: Point): number;

    setWaterLevelAt(x: number, y: number, waterLevel: number): void;

    getLayerValueAt(layer: Layer, x: number, y: number): number;

    getLayerValueAt(layer: Layer, coords: Point): number;

    setLayerValueAt(layer: Layer, x: number, y: number, value: number): void;

    getBitLayerValueAt(layer: Layer, x: number, y: number): boolean;

    getBitLayerCount(layer: Layer, x: number, y: number, r: number): number;

    getLayersAt(x: number, y: number): Map<Layer, number>;

    getFloodedCount(x: number, y: number, r: number, lava: boolean): number;

    getDistanceToEdge(layer: Layer, x: number, y: number, maxDistance: number): number;

    getDistancesToEdge(layer: Layer, maxDistance: number): HeightMap;

    setBitLayerValueAt(layer: Layer, x: number, y: number, value: boolean): void;

    clearLayerData(layer: Layer): void;

    clearLayerData(x: number, y: number, excludedLayers: Set<Layer>): void;

    setEventsInhibited(eventsInhibited: boolean): void;

    isEventsInhibited(): boolean;

    getAllLayerSettings(): Map<Layer, ExporterSettings>;

    getLayerSettings(layer: Layer): ExporterSettings;

    setLayerSettings(layer: Layer, settings: ExporterSettings): void;

    getMinecraftSeed(): number;

    setMinecraftSeed(minecraftSeed: number): void;

    getOverlays(): Overlay[];

    addOverlay(overlay: Overlay): number;

    removeOverlay(index: number): void;

    isGridEnabled(): boolean;

    setGridEnabled(gridEnabled: boolean): void;

    getGridSize(): number;

    setGridSize(gridSize: number): void;

    isOverlaysEnabled(): boolean;

    setOverlaysEnabled(overlaysEnabled: boolean): void;

    getMinHeight(): number;

    setMinHeight(minHeight: number): void;

    getMaxHeight(): number;

    setMaxHeight(maxHeight: number): void;

    getContourSeparation(): number;

    setContourSeparation(contourSeparation: number): void;

    isContoursEnabled(): boolean;

    setContoursEnabled(contoursEnabled: boolean): void;

    getTopLayerMinDepth(): number;

    setTopLayerMinDepth(topLayerMinDepth: number): void;

    getTopLayerVariation(): number;

    setTopLayerVariation(topLayerVariation: number): void;

    isBottomless(): boolean;

    setBottomless(bottomless: boolean): void;

    getLastViewPosition(): Point;

    setLastViewPosition(lastViewPosition: Point): void;

    getCustomBiomes(): CustomBiome[];

    setCustomBiomes(customBiomes: CustomBiome[]): void;

    isCoverSteepTerrain(): boolean;

    setCoverSteepTerrain(coverSteepTerrain: boolean): void;

    isFixOverlayCoords(): boolean;

    setFixOverlayCoords(fixOverlayCoords: boolean): void;

    getGarden(): Garden;

    getCustomLayers(): CustomLayer[];

    getCustomLayers(applyCombinedLayers: boolean): CustomLayer[];

    setCustomLayers(customLayers: CustomLayer[]): void;

    getAllLayers(applyCombinedLayers: boolean): Set<Layer>;

    getMinimumLayers(): Set<Layer>;

    getCeilingHeight(): number;

    setCeilingHeight(ceilingHeight: number): void;

    getSubsurfaceLayerAnchor(): LayerAnchor;

    setSubsurfaceLayerAnchor(subsurfaceLayerAnchor: LayerAnchor): void;

    getTopLayerAnchor(): LayerAnchor;

    setTopLayerAnchor(topLayerAnchor: LayerAnchor): void;

    getExportSettings(): ExportSettings;

    setExportSettings(exportSettings: ExportSettings): void;

    getGenerator(): MapGenerator;

    setGenerator(generator: MapGenerator): void;

    getWallType(): WallType;

    setWallType(wallType: WallType): void;

    getRoofType(): WallType;

    setRoofType(roofType: WallType): void;

    getScale(): number;

    setScale(scale: number): void;

    getHiddenPalettes(): Set<string>;

    setHiddenPalettes(hiddenPalettes: Set<string>): void;

    getSoloedPalette(): string;

    setSoloedPalette(soloedPalette: string): void;

    applyTheme(coords: Point): void;

    isUndoAvailable(): boolean;

    registerUndoManager(undoManager: UndoManager): void;

    undoChanges(): boolean;

    clearUndo(): void;

    armSavePoint(): void;

    rememberChanges(): void;

    clearRedo(): void;

    unregisterUndoManager(): void;

    getAutoBiome(x: number, y: number): number;

    getAutoBiome(x: number, y: number, defaultBiome: number): number;

    getAutoBiome(tile: Tile, x: number, y: number): number;

    getAutoBiome(tile: Tile, x: number, y: number, defaultBiome: number): number;

    getSnapshot(): Dimension;

    getTopLayerDepth(x: number, y: number, z: number): number;

    addDimensionListener(listener: Listener): void;

    removeDimensionListener(listener: Listener): void;

    addPropertyChangeListener(listener: PropertyChangeListener): void;

    addPropertyChangeListener(propertyName: string, listener: PropertyChangeListener): void;

    removePropertyChangeListener(listener: PropertyChangeListener): void;

    removePropertyChangeListener(propertyName: string, listener: PropertyChangeListener): void;

    transform(transform: CoordinateTransform, progressReceiver: ProgressReceiver): void;

    containsOneOf(layers: Layer[]): boolean;

    visitTilesForEditing(): TileVisitationBuilder;

    visitTiles(): TileVisitationBuilder;

    getAttribute<T>(key: AttributeKey<T>): T;

    setAttribute<T>(key: AttributeKey<T>, value: T): void;

    getMostPrevalentBiome(x: number, y: number, defaultBiome: number): number;

    save(out: ZipOutputStream): void;

    heightMapChanged(tile: Tile): void;

    terrainChanged(tile: Tile): void;

    waterLevelChanged(tile: Tile): void;

    seedsChanged(tile: Tile): void;

    layerDataChanged(tile: Tile, changedLayers: Set<Layer>): void;

    allBitLayerDataChanged(tile: Tile): void;

    allNonBitlayerDataChanged(tile: Tile): void;
}

interface HeightMap {
    // Define the methods and properties of HeightMap
}

interface CustomBiome {
    // Define the methods and properties of CustomBiome
}

interface CustomLayer {
    // Define the methods and properties of CustomLayer
}

interface UndoManager {
    // Define the methods and properties of UndoManager
}

declare class World2 {
    // Define the methods and properties of World2
}

declare class ZipOutputStream {
    // Define the methods and properties of ZipOutputStream
}

declare class Layer {
    // Define the methods and properties of Layer
}

declare class Garden {
    // Define the methods and properties of Garden
}

declare class PropertyChangeListener {
    // Define the methods and properties of PropertyChangeListener
}


declare class Rectangle {
    // Define the methods and properties of Rectangle
}

declare class CoordinateTransform {
    // Define the methods and properties of CoordinateTransform
}
