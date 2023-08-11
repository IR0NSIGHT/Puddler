package org.pepsoft.worldpainter.tools.scripts;

import org.pepsoft.worldpainter.HeightMap;
import org.pepsoft.worldpainter.MixedMaterial;
import org.pepsoft.worldpainter.World2;
import org.pepsoft.worldpainter.layers.Layer;

public interface ScriptingContextInterface {
    String getVersion();

    GetWorldOp getWorld();

    GetLayerOp getLayer();

    GetTerrainOp getTerrain();

    ImportHeightMapOp createWorld();

    ExportWorldOp exportWorld(World2 world) throws ScriptException;

    // TODO
    MergeWorldOp mergeWorld();

    SaveWorldOp saveWorld(World2 world) throws ScriptException;

    GetHeightMapOp getHeightMap();

    MappingOp applyHeightMap(HeightMap heightMap) throws ScriptException;

    MappingOp applyLayer(Layer layer) throws ScriptException;

    MappingOp applyTerrain(int terrainIndex) throws ScriptException;

    InstallCustomTerrainOp installCustomTerrain(MixedMaterial terrain) throws ScriptException;

    CreateFilterOp createFilter();

    GetPlatformOp getMapFormat();

    void checkGoCalled(String commandName);
}
