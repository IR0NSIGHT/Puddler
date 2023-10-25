import {getNeighbourPoints, point, pointsEqual, squaredDistance, withZ, zPoint} from "../point";
import {getZ, isWater} from "../terrain";
import {collectLayers, layerPoint} from "./riverLayer";
import {annotateAll} from "../puddle";
import {SeenSetReadOnly} from "../SeenSet";
import {RiverExportTarget} from "../applyRiver";
import {log} from "../log";

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

/**
 * depth of river by distance to river spine.
 * models a quadratic curve with the lowest point at the spine
 * @param maxWidth
 * @param maxDepth
 * @param dist
 */
const depthByDist = (maxWidth: number, maxDepth: number, dist: number): number => {
    return (dist / maxWidth) * (dist / maxWidth) * maxDepth;
}

export const applyRiverLayers = (river: point[], pondSurface: SeenSetReadOnly, riverExport: RiverExportTarget): void => {
    const riverSpine: riverProfilePoint[] = river.map(minFilter).map(
        (point, index) => ({
            x: point.point.x,
            y: point.point.y,
            z: point.z,
            width: Math.sqrt(params.growthRate * index),
            depth: 2,
            speed: 1
        })
    )

    const outlines = collectLayers(riverSpine, 4)
    const allPoints: layerPoint[] = []
    outlines.forEach(layer => allPoints.push(...layer))

    /**
     *
     * @param point
     * @param profile
     * @param squaredDistToParent river center = 0, outermost layer = 5 f.e.
     */
    const applyAsRiverBed = (point: layerPoint, profile: riverProfile, squaredDistToParent: number): void => {
        if (riverExport.applyRivers) {
            const lip = dimension.getSlope(point.x, point.y) > 1 ? 1 : 0 //1 == 45°

            const depth = depthByDist(profile.width, profile.depth, Math.sqrt(squaredDistToParent));
            dimension.setHeightAt(point.x, point.y, point.parent.z - profile.depth - lip)
            dimension.setWaterLevelAt(point.x, point.y, point.parent.z - lip)
        }

        if (riverExport.annotationColor !== undefined) {
            annotateAll([point], riverExport.annotationColor)
        }

    }

    const applyAsRiverBank = (p: layerPoint, profile: riverProfile): void => {
        const lip = dimension.getSlope(p.x, p.y) > 1.5 ? 1 : 0 //1 == 45°
        log(`slope: ${dimension.getSlope(p.x, p.y)}`)
        if (riverExport.applyRivers) {
            dimension.setHeightAt(p.x, p.y, p.parent.z + lip)
        }
    }

    const isOcean = (point: zPoint): boolean => point.z <= params.waterLevel

    riverSpine.forEach(profilePoint => {
        const children = allPoints.filter(layerPoint => pointsEqual(layerPoint.parent, profilePoint))
        const widthSquared = profilePoint.width * profilePoint.width

        children
            .filter(pondSurface.hasNot).filter(p => !isWater(p))
            .map(child => ({
                ...child,
                distSquared: squaredDistance(profilePoint, child)
            }))
            .forEach(child => {
                if (child.distSquared <= widthSquared) {
                    applyAsRiverBed(child, profilePoint, child.distSquared)
                } else if (!isOcean(child) && child.distSquared <= widthSquared + 1) {   //1 layer of outline
                    applyAsRiverBank(child, profilePoint)
                }
            })
    })
}