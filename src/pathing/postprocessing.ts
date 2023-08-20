import {getNeighbourPoints, point, pointsEqual, squaredDistance, withZ, zPoint} from "../point";
import {getZ, isWater} from "../terrain";
import {collectLayers, layerPoint} from "./riverLayer";
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


type riverProfilePoint = zPoint & riverProfile
type riverProfile = { width: number, depth: number, speed: number }
export const applyRiverOutline = (river: point[], pondSurface: SeenSetReadOnly, waterLevelModifier: number): void => {
    const riverProfile: riverProfilePoint[] = river.map(
        (point, index) => ({
            ...withZ(point),
            width: Math.sqrt(0.005*index),
            depth: 2,
            speed: 1
        })
    )

    const outlines = collectLayers(riverProfile, 4)
    const allPoints: layerPoint[] = []
    outlines.forEach(layer => allPoints.push(...layer))

    const applyAsRiverBed = (point: layerPoint, profile: riverProfile): void => {
        dimension.setHeightAt(point.x, point.y, point.parent.z - profile.depth)
    //    dimension.setTerrainAt(point.x, point.y, getTerrainById(22))    //blue terracotta
        dimension.setWaterLevelAt(point.x, point.y, point.parent.z)
        annotateAll([point], annotationColor.PURPLE)
    }

    const applyAsRiverBank = (p: layerPoint, profile: riverProfile): void => {
        dimension.setHeightAt(p.x, p.y, p.parent.z)
    //    dimension.setTerrainAt(p.x, p.y, getTerrainById(24)) // green terracotta
        annotateAll([p], annotationColor.ORANGE)
    }

    const isOcean = (point: zPoint): boolean => point.z <= params.waterLevel

    riverProfile.map(profilePoint => {
        const children = allPoints.filter(layerPoint => pointsEqual(layerPoint.parent, profilePoint))
        const widthSquared = profilePoint.width * profilePoint.width

        children.filter(pondSurface.hasNot).filter(p => !isWater(p))
            .map(child => ({
                ...child,
                distSquared: squaredDistance(profilePoint, child)
            }))
            .forEach(child => {
                if (child.distSquared <= widthSquared) {
                    applyAsRiverBed(child, profilePoint)
                } else if (!isOcean(child) && child.distSquared <= widthSquared +1) {   //1 layer of outline
                    applyAsRiverBank(child, profilePoint)
                }
            })
    })
}