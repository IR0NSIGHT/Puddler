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

