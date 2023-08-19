import {getNeighbourPoints, point, zPoint} from "../point";
import {getTerrainById, getZ} from "../terrain";
import {collectLayers} from "./riverLayer";
import {annotateAll} from "../puddle";
import {annotationColor} from "./river";
import {SeenSetReadOnly} from "../SeenSet";

/**
 * will get the z of the lowest neighbour of the riverpoint (which is the point after the point in the river)
 * @param p
 * @returns river with z values
 */
export const minFilter = (
    p: point,
): { point: point; z: number } => {
    const neiZs = getNeighbourPoints(p).map((a) => getZ(a, true));
    const minNeighbourNonRiver = Math.min.apply(Math, neiZs);
    return {
        point: p,
        z: minNeighbourNonRiver,
    };
};

export const applyRiverOutline = (river: point[], pondSurface: SeenSetReadOnly, waterLevelModifier: number): void => {

    const outlines = collectLayers(river, 4)
    let i = 0
    outlines.forEach(outline => {
        i += 1;
        const isRiverBed = (point: zPoint, layerIdx: number) : boolean=> layerIdx <= 4
        const isOcean = (point: zPoint, layerIdx: number) : boolean=> point.z <= params.waterLevel
        outline.filter(pondSurface.hasNot).forEach(p => {
            if (p.parent === undefined) {
                throw new Error("position does not have parent: " + p.x + " " + p.y + "")
            }

            if (isRiverBed(p, i)) {
                dimension.setHeightAt(p.x, p.y, p.parent.z + waterLevelModifier - 1)
                //const terracotta = 10 + (Math.abs(p.parent.z) % 16)
                //if (terracotta < 10 || terracotta > 26) {
                //    throw new Error("terracotta out of bounds: " + terracotta)
                //}
                dimension.setTerrainAt(p.x, p.y, getTerrainById(22))    //blue terracotta
                dimension.setWaterLevelAt(p.x,p.y, p.parent.z + waterLevelModifier)
                annotateAll([p], annotationColor.PURPLE)

            } else {
                if (isOcean(p, i))
                    return
                //raise riverbank
                dimension.setHeightAt(p.x, p.y, p.parent.z )
                dimension.setTerrainAt(p.x, p.y, getTerrainById(24)) // green terracotta
                annotateAll([p], annotationColor.ORANGE)
            }
        })
    })
}