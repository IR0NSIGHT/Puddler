import {getNeighbourPoints, point} from "../point";
import {getZ} from "../terrain";
import {collectLayers} from "./riverLayer";
import {annotateAll} from "../puddle";
import {annotationColor} from "./river";

/**
 * will get the z of the lowest neighbour of the riverpoint (which is the point after the point in the river)
 * @param p
 * @param i
 * @param river point array that flows from high to low
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

export const applyRiverOutline = (river: point[]) : void => {
    const outline = collectLayers(river, 1)[1]
    annotateAll(outline, annotationColor.YELLOW)
}