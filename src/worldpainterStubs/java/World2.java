package org.pepsoft.worldpainter;

import org.pepsoft.minecraft.Direction;
import org.pepsoft.util.AttributeKey;
import org.pepsoft.util.ProgressReceiver;
import org.pepsoft.worldpainter.exporting.WorldExportSettings;
import org.pepsoft.worldpainter.history.HistoryEntry;
import org.pepsoft.worldpainter.layers.Layer;

import java.awt.*;
import java.beans.PropertyChangeListener;
import java.io.File;
import java.io.IOException;
import java.io.Serializable;
import java.util.*;
import java.util.List;
import java.util.zip.ZipOutputStream;

public interface World2Interface extends Serializable, Cloneable {
    @Deprecated
    int BIOME_ALGORITHM_NONE = -1;
    @Deprecated
    int BIOME_ALGORITHM_CUSTOM_BIOMES = 6;
    @Deprecated
    int BIOME_ALGORITHM_AUTO_BIOMES = 7;
    int DEFAULT_MAX_HEIGHT = org.pepsoft.minecraft.Constants.DEFAULT_MAX_HEIGHT_ANVIL;
    long DEFAULT_OCEAN_SEED = 27594263L; // A seed with a large ocean around the origin, and not many mushroom islands nearby. Should be used with Large Biomes long DEFAULT_LAND_SEED = 227290L; // A seed with a huge continent around the origin. Should be used with Large Biomes
    /**
     * A {@link String} containing the WorldPainter version with which this file
     * was saved.
     */
    String METADATA_KEY_WP_VERSION = "org.pepsoft.worldpainter.wp.version";
    /**
     * A {@link String} containing the WorldPainter build with which this file
     * was saved.
     */
    String METADATA_KEY_WP_BUILD = "org.pepsoft.worldpainter.wp.build";
    /**
     * A {@link Date} containing the time at which this file was saved.
     */
    String METADATA_KEY_TIMESTAMP = "org.pepsoft.worldpainter.timestamp";
    /**
     * An optional two dimensional {@link String}[][2] array containing the
     * plugins installed in the WorldPainter instance which saved the file. One
     * row per plugin, which each row containing two elements, the first being
     * the plugin name, the second being the plugin version.
     *
     * <p>May be {@code null} if no non-standard plugins were present.
     */
    String METADATA_KEY_PLUGINS = "org.pepsoft.worldpainter.plugins";
    /**
     * A string containing the name of the world.
     */
    String METADATA_KEY_NAME = "name";

    long getChangeNo();

    String getName();

    void setName(String name);

    boolean isCreateGoodiesChest();

    void setCreateGoodiesChest(boolean createGoodiesChest);

    Point getTileCoordinates(int worldX, int worldY);

    Point getTileCoordinates(Point worldCoords);

    Point getSpawnPoint();

    void setSpawnPoint(Point spawnPoint);

    File getImportedFrom();

    void setImportedFrom(File importedFrom);

    boolean isMapFeatures();

    void setMapFeatures(boolean mapFeatures);

    GameType getGameType();

    void setGameType(GameType gameType);

    void addPropertyChangeListener(PropertyChangeListener listener);

    void addPropertyChangeListener(String propertyName, PropertyChangeListener listener);

    void removePropertyChangeListener(PropertyChangeListener listener);

    void removePropertyChangeListener(String propertyName, PropertyChangeListener listener);

    @Deprecated
    Dimension getDimension(int dim);

    boolean isDimensionPresent(Anchor anchor);

    Dimension getDimension(Anchor anchor);

    Set<Dimension> getDimensions();

    Set<Dimension> getDimensionsWithRole(Dimension.Role role, boolean inverted, int id);

    void addDimension(Dimension dimension);

    Dimension removeDimension(Anchor anchor);

    MixedMaterial getMixedMaterial(int index);

    void setMixedMaterial(int index, MixedMaterial material);

    int getMinHeight();

    void setMinHeight(int minHeight);

    int getMaxHeight();

    void setMaxHeight(int maxHeight);

    @Deprecated
    Generator getGenerator();

    Platform getPlatform();

    void setPlatform(Platform platform);

    boolean isAskToConvertToAnvil();

    void setAskToConvertToAnvil(boolean askToConvertToAnvil);

    boolean isAskToRotate();

    void setAskToRotate(boolean askToRotate);

    Direction getUpIs();

    void setUpIs(Direction upIs);

    boolean isAllowMerging();

    void setAllowMerging(boolean allowMerging);

    boolean isAllowCheats();

    void setAllowCheats(boolean allowCheats);

    @Deprecated
    String getGeneratorOptions();

    boolean isExtendedBlockIds();

    void setExtendedBlockIds(boolean extendedBlockIds);

    int getDifficulty();

    void setDifficulty(int difficulty);

    WorldExportSettings getExportSettings();

    void setExportSettings(WorldExportSettings exportSettings);

    List<HistoryEntry> getHistory();

    void addHistoryEntry(int key, Serializable... args);

    Map<String, Object> getMetadata();

    void setMetadata(Map<String, Object> metadata);

    BorderSettings getBorderSettings();

    File getMergedWith();

    void setMergedWith(File mergedWith);

    List<File> getDataPacks();

    void setDataPacks(List<File> dataPacks);

    <T> Optional<T> getAttribute(AttributeKey<T> key);

    <T> void setAttribute(AttributeKey<T> key, T value);

    void transform(CoordinateTransform transform, ProgressReceiver progressReceiver) throws ProgressReceiver.OperationCancelled;

    void transform(Anchor anchor, CoordinateTransform transform, ProgressReceiver progressReceiver) throws ProgressReceiver.OperationCancelled;

    void clearLayerData(Layer layer);

    long measureSize();

    void save(ZipOutputStream out) throws IOException;

    public enum Warning {
        /**
         * Warn the user that automatic biomes are now the default and are enabled.
         */
        AUTO_BIOMES_ENABLED,

        /**
         * Warn the user that automatic biomes were previously in use but are now disabled.
         */
        AUTO_BIOMES_DISABLED,

        /**
         * Warn the user that one or more custom terrain types were missing and have been replaced with magenta wool.
         */
        MISSING_CUSTOM_TERRAINS,

        /**
         * Warn the user that the Superflat settings could not be parsed and were reset to defaults.
         */
        SUPERFLAT_SETTINGS_RESET,

        /**
         * The game type was lost and was reset to Survival.
         */
        GAME_TYPE_RESET
    }
}
