import {point} from "./point";
import {minFilter} from "./river";
import {isWater, setWaterLevel, setZ} from "./terrain";

export type exportTarget = {
    waterlevel: number|undefined,
    terrainDepth: number|undefined,
    annotationColor: AnnotationLayer|undefined
}

type AnnotationLayer = number;
export const applyRiverToTerrain = (river: point[], target: exportTarget): void => {
    river
        .filter((a) => !isWater(a))
        .map(minFilter)
        .forEach((a) => {
            if (target.terrainDepth !== undefined)
                setZ(a.point, a.z - target.terrainDepth)

            if (target.waterlevel !== undefined)
                setWaterLevel(a.point, a.z - target.waterlevel)

            if (target.annotationColor !== undefined)
                dimension.setLayerValueAt(org.pepsoft.worldpainter.layers.Annotations.INSTANCE, a.point.x, a.point.y, target.annotationColor);
        });
};
