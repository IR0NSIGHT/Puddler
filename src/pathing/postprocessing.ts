import {getNeighbourPoints, point} from "../point";
import {getTerrainById, getZ} from "../terrain";
import {collectLayers} from "./riverLayer";
import {annotateAll} from "../puddle";
import {annotationColor} from "./river";

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

export const applyRiverOutline = (river: point[]): void => {

    const outlines = collectLayers(river, 4)
    let i = 0
    outlines.forEach(outline => {
        i += 1;
        outline.forEach(p => {
            if (p.parent === undefined) {
                throw new Error("position does not have parent: " + p.x + " " + p.y + "")
            }

                dimension.setHeightAt(p.x, p.y, p.parent.z - 5)
                const terracotta = 10 + (Math.abs(p.parent.z) % 16)
                if (terracotta < 10 || terracotta > 26) {
                    throw new Error("terracotta out of bounds: " + terracotta)
                }
                dimension.setTerrainAt(p.x, p.y, getTerrainById(terracotta))
                //dimension.setWaterLevelAt(p.x,p.y, p.parent.z)
        })
    })
    annotateAll(outlines[0], annotationColor.YELLOW);


}