package org.pepsoft.worldpainter;

import org.jetbrains.annotations.NotNull;
import org.pepsoft.minecraft.MapGenerator;
import org.pepsoft.util.AttributeKey;
import org.pepsoft.util.ProgressReceiver;
import org.pepsoft.util.undo.UndoManager;
import org.pepsoft.worldpainter.biomeschemes.CustomBiome;
import org.pepsoft.worldpainter.exporting.ExportSettings;
import org.pepsoft.worldpainter.gardenofeden.Garden;
import org.pepsoft.worldpainter.layers.CustomLayer;
import org.pepsoft.worldpainter.layers.Layer;
import org.pepsoft.worldpainter.layers.exporters.ExporterSettings;
import org.pepsoft.worldpainter.layers.tunnel.TunnelLayer;

import java.awt.*;
import java.beans.PropertyChangeListener;
import java.io.IOException;
import java.io.Serializable;
import java.util.*;
import java.util.List;
import java.util.zip.ZipOutputStream;

import static org.pepsoft.worldpainter.Constants.*;
import static org.pepsoft.worldpainter.Dimension.Role.DETAIL;
import static org.pepsoft.worldpainter.Dimension.Role.MASTER;
import static org.pepsoft.worldpainter.biomeschemes.Minecraft1_7Biomes.*;

public interface DimensionInterface extends TileProvider, Serializable, Tile.Listener, Cloneable {
    int[] POSSIBLE_AUTO_BIOMES = {BIOME_PLAINS, BIOME_FOREST,
            BIOME_SWAMPLAND, BIOME_JUNGLE, BIOME_MESA, BIOME_DESERT, BIOME_BEACH,
            BIOME_RIVER, BIOME_OCEAN, BIOME_DEEP_OCEAN, BIOME_ICE_PLAINS,
            BIOME_COLD_TAIGA, BIOME_FROZEN_RIVER, BIOME_FROZEN_OCEAN,
            BIOME_MUSHROOM_ISLAND, BIOME_HELL, BIOME_SKY};

    World2 getWorld();

    void setWorld(World2 world);

    Anchor getAnchor();

    UUID getId();

    String getName();

    void setName(String name);

    long getChangeNo();

    void changed();

    long getSeed();

    Terrain getSubsurfaceMaterial();

    void setSubsurfaceMaterial(Terrain subsurfaceMaterial);

    boolean isPopulate();

    void setPopulate(boolean populate);

    Border getBorder();

    void setBorder(Border border);

    int getBorderLevel();

    void setBorderLevel(int borderLevel);

    int getBorderSize();

    void setBorderSize(int borderSize);

    TileFactory getTileFactory();

    @Override
    boolean isTilePresent(int x, int y);

    boolean isBorderTile(int x, int y);

    @Override
    Tile getTile(int x, int y);

    Tile getTile(Point coords);

    Tile getTileForEditing(int x, int y);

    Tile getTileForEditing(Point coords);

    @Override
    Rectangle getExtent();

    int getTileCount();

    Collection<? extends Tile> getTiles();

    Set<Point> getTileCoords();

    void addTile(Tile tile);

    void removeTile(int tileX, int tileY);

    void removeTile(Tile tile);

    void removeTile(Point coords);

    int getHighestX();

    int getHighestY();

    int getLowestX();

    int getLowestY();

    int getWidth();

    int getHeight();

    int getIntHeightAt(int x, int y);

    int getIntHeightAt(int x, int y, int defaultHeight);

    int getIntHeightAt(Point coords);

    int getLowestIntHeight();

    int getHighestIntHeight();

    int[] getIntHeightRange();

    float getHeightAt(int x, int y);

    float getHeightAt(Point coords);

    float getLowestHeight();

    float getHighestHeight();

    float[] getHeightRange();

    void setHeightAt(int x, int y, float height);

    void setHeightAt(Point coords, float height);

    int getRawHeightAt(int x, int y);

    int getLowestRawHeight();

    int getHighestRawHeight();

    int[] getRawHeightRange();

    int getRawHeightAt(Point coords);

    void setRawHeightAt(int x, int y, int rawHeight);

    void setRawHeightAt(Point coords, int rawHeight);

    float getSlope(int x, int y);

    Terrain getTerrainAt(int x, int y);

    void setTerrainAt(int x, int y, Terrain terrain);

    Set<Terrain> getAllTerrains();

    void setTerrainAt(Point coords, Terrain terrain);

    void applyTheme(int x, int y);

    int getWaterLevelAt(int x, int y);

    int getWaterLevelAt(Point coords);

    void setWaterLevelAt(int x, int y, int waterLevel);

    int getLayerValueAt(Layer layer, int x, int y);

    int getLayerValueAt(Layer layer, Point coords);

    void setLayerValueAt(Layer layer, int x, int y, int value);

    boolean getBitLayerValueAt(Layer layer, int x, int y);

    int getBitLayerCount(Layer layer, int x, int y, int r);

    Map<Layer, Integer> getLayersAt(int x, int y);

    int getFloodedCount(int x, int y, int r, boolean lava);

    float getDistanceToEdge(Layer layer, int x, int y, float maxDistance);

    @SuppressWarnings("UnnecessaryLocalVariable")
        // Clarity
    HeightMap getDistancesToEdge(Layer layer, float maxDistance);

    void setBitLayerValueAt(Layer layer, int x, int y, boolean value);

    void clearLayerData(Layer layer);

    void clearLayerData(int x, int y, Set<Layer> excludedLayers);

    void setEventsInhibited(boolean eventsInhibited);

    boolean isEventsInhibited();

    Map<Layer, ExporterSettings> getAllLayerSettings();

    ExporterSettings getLayerSettings(Layer layer);

    void setLayerSettings(Layer layer, ExporterSettings settings);

    long getMinecraftSeed();

    void setMinecraftSeed(long minecraftSeed);

    List<Overlay> getOverlays();

    int addOverlay(Overlay overlay);

    void removeOverlay(int index);

    boolean isGridEnabled();

    void setGridEnabled(boolean gridEnabled);

    int getGridSize();

    void setGridSize(int gridSize);

    boolean isOverlaysEnabled();

    void setOverlaysEnabled(boolean overlaysEnabled);

    int getMinHeight();

    void setMinHeight(int minHeight);

    int getMaxHeight();

    void setMaxHeight(int maxHeight);

    int getContourSeparation();

    void setContourSeparation(int contourSeparation);

    boolean isContoursEnabled();

    void setContoursEnabled(boolean contoursEnabled);

    int getTopLayerMinDepth();

    void setTopLayerMinDepth(int topLayerMinDepth);

    int getTopLayerVariation();

    void setTopLayerVariation(int topLayerVariation);

    boolean isBottomless();

    void setBottomless(boolean bottomless);

    Point getLastViewPosition();

    void setLastViewPosition(Point lastViewPosition);

    List<CustomBiome> getCustomBiomes();

    void setCustomBiomes(List<CustomBiome> customBiomes);

    boolean isCoverSteepTerrain();

    void setCoverSteepTerrain(boolean coverSteepTerrain);

    boolean isFixOverlayCoords();

    void setFixOverlayCoords(boolean fixOverlayCoords);

    Garden getGarden();

    List<CustomLayer> getCustomLayers();

    @SuppressWarnings("DataFlowIssue")
        // The applyLayerContainer may have added non-CustomLayers
    List<CustomLayer> getCustomLayers(boolean applyCombinedLayers);

    void setCustomLayers(List<CustomLayer> customLayers);

    Set<Layer> getAllLayers(boolean applyCombinedLayers);

    Set<Layer> getMinimumLayers();

    int getCeilingHeight();

    void setCeilingHeight(int ceilingHeight);

    LayerAnchor getSubsurfaceLayerAnchor();

    void setSubsurfaceLayerAnchor(LayerAnchor subsurfaceLayerAnchor);

    LayerAnchor getTopLayerAnchor();

    void setTopLayerAnchor(LayerAnchor topLayerAnchor);

    ExportSettings getExportSettings();

    void setExportSettings(ExportSettings exportSettings);

    MapGenerator getGenerator();

    void setGenerator(MapGenerator generator);

    WallType getWallType();

    void setWallType(WallType wallType);

    WallType getRoofType();

    void setRoofType(WallType roofType);

    float getScale();

    void setScale(float scale);

    Set<String> getHiddenPalettes();

    void setHiddenPalettes(Set<String> hiddenPalettes);

    String getSoloedPalette();

    void setSoloedPalette(String soloedPalette);

    void applyTheme(Point coords);

    boolean isUndoAvailable();

    void registerUndoManager(UndoManager undoManager);

    boolean undoChanges();

    void clearUndo();

    void armSavePoint();

    void rememberChanges();

    void clearRedo();

    void unregisterUndoManager();

    int getAutoBiome(int x, int y);

    int getAutoBiome(int x, int y, int defaultBiome);

    int getAutoBiome(Tile tile, int x, int y);

    int getAutoBiome(Tile tile, int x, int y, int defaultBiome);

    Dimension getSnapshot();

    int getTopLayerDepth(int x, int y, int z);

    void addDimensionListener(Listener listener);

    void removeDimensionListener(Listener listener);

    void addPropertyChangeListener(PropertyChangeListener listener);

    void addPropertyChangeListener(String propertyName, PropertyChangeListener listener);

    void removePropertyChangeListener(PropertyChangeListener listener);

    void removePropertyChangeListener(String propertyName, PropertyChangeListener listener);

    void transform(CoordinateTransform transform, ProgressReceiver progressReceiver) throws ProgressReceiver.OperationCancelled;

    boolean containsOneOf(Layer... layers);

    Dimension.TileVisitationBuilder visitTilesForEditing();

    Dimension.TileVisitationBuilder visitTiles();

    <T> T getAttribute(AttributeKey<T> key);

    <T> void setAttribute(AttributeKey<T> key, T value);

    int getMostPrevalentBiome(int x, int y, int defaultBiome);

    void save(ZipOutputStream out) throws IOException;

    @Override
    void heightMapChanged(Tile tile);

    @Override
    void terrainChanged(Tile tile);

    @Override
    void waterLevelChanged(Tile tile);

    @Override
    void seedsChanged(Tile tile);

    @Override
    void layerDataChanged(Tile tile, Set<Layer> changedLayers);

    @Override
    void allBitLayerDataChanged(Tile tile);

    @Override
    void allNonBitlayerDataChanged(Tile tile);

    public enum Border {
        VOID(false), WATER(false), LAVA(false), ENDLESS_VOID(true), ENDLESS_WATER(true), ENDLESS_LAVA(true), BARRIER(false), ENDLESS_BARRIER(true);

        Border(boolean endless) {
            this.endless = endless;
        }

        public boolean isEndless() {
            return endless;
        }

        private final boolean endless;
    }

    public enum LayerAnchor {BEDROCK, TERRAIN}

    public enum WallType {BEDROCK, BARIER /* typo, but it's in the wild, so we can't easily fix it anymore... 😔 */}

    /**
     * A role of a {@link Dimension} within a game dimension.
     */
    public enum Role {
        /**
         * A detail dimension.
         */
        DETAIL,

        /**
         * A master dimension that is exported where no detail dimension exists, at 1:16 scale.
         */
        MASTER,

        /**
         * A dimension associated with a {@link TunnelLayer} floor. The {@link Anchor#id} field is used to associate
         * it with a particular layer.
         */
        CAVE_FLOOR
    }

    public interface Listener {
        void tilesAdded(Dimension dimension, Set<Tile> tiles);

        void tilesRemoved(Dimension dimension, Set<Tile> tiles);

        void overlayAdded(Dimension dimension, int index, Overlay overlay);

        void overlayRemoved(Dimension dimension, int index, Overlay overlay);
    }

    public interface TileVisitor {
        void visit(Tile tile);
    }

    public static final class Anchor implements Serializable, Comparable {
        public Anchor(int dim, Role role, boolean invert, int id) {
            if (role == null) {
                throw new NullPointerException("role");
            }
            this.dim = dim;
            this.role = role;
            this.invert = invert;
            this.id = id;
        }

        public String getDefaultName() {
            final StringBuilder sb = new StringBuilder();
            switch (dim) {
                case DIM_NORMAL:
                    sb.append("Surface");
                    break;
                case DIM_NETHER:
                    sb.append("Nether");
                    break;
                case DIM_END:
                    sb.append("End");
                    break;
                default:
                    sb.append("Dimension ");
                    sb.append(dim);
                    break;
            }
            switch (role) {
                case MASTER:
                    sb.append(" Master");
                    break;
                case CAVE_FLOOR:
                    sb.append(" Cave Floor");
                    break;
            }
            if (invert) {
                sb.append(" Ceiling");
            }
            if (id != 0) {
                sb.append(' ');
                sb.append(id);
            }
            return sb.toString();
        }

        @Override
        public String toString() {
            return dim
                    + " " + role
                    + (invert ? " CEILING" : "")
                    + ((id != 0) ? (" " + id) : "");
        }

        @Override
        public boolean equals(final Object o) {
            return (o instanceof Anchor)
                    && (((Anchor) o).dim == dim)
                    && (((Anchor) o).role == role)
                    && (((Anchor) o).invert == invert)
                    && (((Anchor) o).id == id);
        }

        @Override
        public int hashCode() {
            return 31 * (31 * (31 * dim + role.hashCode()) + (invert ? 1 : 0)) + id;
        }

        // Comparable

        @Override
        public int compareTo(@NotNull Object o) {
            return COMPARATOR.compare(this, (Anchor) o);
        }

        /**
         * Parse a string previously produced by {@link #toString()} into a new {@code Anchor} instance.
         */
        public static Anchor fromString(String str) {
            final String[] parts = str.split(" ");
            final int dim = Integer.parseInt(parts[0]);
            final Role role = DimensionInterface.Role.valueOf(parts[1]);
            final boolean invert = (parts.length > 2) && parts[2].equals("CEILING");
            final int id = invert
                    ? ((parts.length > 3) ? Integer.parseInt(parts[3]) : 0)
                    : ((parts.length > 2) ? Integer.parseInt(parts[2]) : 0);
            return new Anchor(dim, role, invert, id);
        }

        /**
         * The game dimension to which this anchor refers. See {@link Constants#DIM_NORMAL},
         * {@link Constants#DIM_NETHER} and {@link Constants#DIM_END} for predefined values. Note that they don't
         * correspond to the dimension numbers in Minecraft.
         */
        public final int dim;

        /**
         * The role this anchor plays in the specified game dimension.
         */
        public final Role role;

        /**
         * Whether this anchor should be exported inverted (e.g. as a ceiling).
         */
        public final boolean invert;

        /**
         * A unique identifier that identifies this anchor within the same ({@link #dim}, {@link #role},
         * {@link #invert}) combo. ID 0 should always exist and be the "main" or "default" anchor. Other values may or
         * may not imply an ordering.
         */
        public final int id;

        /**
         * Convenience constant for the default dimension (surface detail dimension, not inverted, layer zero).
         */
        public static final Anchor NORMAL_DETAIL = new Anchor(DIM_NORMAL, DETAIL, false, 0);

        /**
         * Convenience constant for the default Master dimension (surface master dimension, not inverted, layer zero).
         */
        public static final Anchor NORMAL_MASTER = new Anchor(DIM_NORMAL, MASTER, false, 0);

        /**
         * Convenience constant for the default Nether dimension (Nether detail dimension, not inverted, layer zero).
         */
        public static final Anchor NETHER_DETAIL = new Anchor(DIM_NETHER, DETAIL, false, 0);

        /**
         * Convenience constant for the default End dimension (End detail dimension, not inverted, layer zero).
         */
        public static final Anchor END_DETAIL = new Anchor(DIM_END, DETAIL, false, 0);

        /**
         * Convenience constant for the default dimension ceiling (surface detail dimension, inverted, layer zero).
         */
        public static final Anchor NORMAL_DETAIL_CEILING = new Anchor(DIM_NORMAL, DETAIL, true, 0);

        /**
         * Convenience constant for the default Nether dimension ceiling (Nether detail dimension, inverted, layer zero).
         */
        public static final Anchor NETHER_DETAIL_CEILING = new Anchor(DIM_NETHER, DETAIL, true, 0);

        /**
         * Convenience constant for the default End dimension ceiling (End detail dimension, inverted, layer zero).
         */
        public static final Anchor END_DETAIL_CEILING = new Anchor(DIM_END, DETAIL, true, 0);

        private static final Comparator<Dimension.Anchor> COMPARATOR = Comparator
                .comparing((Anchor a) -> a.dim)
                .thenComparing(a -> a.role)
                .thenComparing(a -> a.invert)
                .thenComparing(a -> a.id);
        private static final long serialVersionUID = 1L;
    }
}
