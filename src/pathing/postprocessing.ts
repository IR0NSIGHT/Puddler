import {getNeighbourPoints, point} from "../point";
import {getZ} from "../terrain";

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