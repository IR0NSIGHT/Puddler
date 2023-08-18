import {getNeighbourPoints, point} from "../point";
import {getZ} from "../terrain";
import {collectLayers} from "./riverLayer";
import {annotateAll} from "../puddle";

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
            annotateAll(outline, 3 + i);
            i += 1;
        }
    )
}