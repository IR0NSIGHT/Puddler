import {point} from "./point";
import {isWater, setWaterLevel, setZ} from "./terrain";

import {minFilter} from "./pathing/postprocessing";
import {Puddle} from "./puddle";
import {SeenSetReadOnly} from "./SeenSet";

export type RiverExportTarget = {
    annotationColor: AnnotationLayer | undefined,
    applyRivers: boolean
}

type AnnotationLayer = number;
export const applyRiverToTerrain = (waterSystem: {
    river: point[],
    ponds: Puddle[],
}, target: RiverExportTarget, globalPondSurface: SeenSetReadOnly): void => {

    waterSystem.river
        .filter(globalPondSurface.hasNot)   //river point is not part of a pond
        .filter((a) => !isWater(a))
        .map(minFilter)
        .forEach((a) => {
            if ( target.applyRivers)
                setZ(a.point, a.z - 1)

            if (target.applyRivers)
                setWaterLevel(a.point, a.z )

            if (target.annotationColor !== undefined)
                dimension.setLayerValueAt(org.pepsoft.worldpainter.layers.Annotations.INSTANCE, a.point.x, a.point.y, target.annotationColor);
        });
};
