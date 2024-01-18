import {
  getNeighbourPoints,
  point,
  pointsEqual,
  squaredDistance,
  withZ,
  zPoint,
} from "../point";
import { getZ, isWater, setWaterLevel, setZ } from "../terrain";
import { collectLayers, layerPoint } from "./riverLayer";
import { annotateAll } from "../puddle";
import { SeenSetReadOnly } from "../SeenSet";
import { RiverExportTarget } from "../applyRiver";
import { log } from "../log";
import { annotationColor } from "./river";

/**
 * will get the z of the lowest neighbour of the riverpoint (which is the point after the point in the river)
 * @param p
 * @returns river with z values
 */
export const minFilter = (p: point): { point: point; z: number } => {
  const neiZs = getNeighbourPoints(p).map((a) => getZ(a, true));
  const minNeighbourNonRiver = Math.min.apply(Math, neiZs);
  return {
    point: p,
    z: minNeighbourNonRiver,
  };
};

type riverProfilePoint = zPoint & riverProfile;
type riverProfile = { width: number; depth: number; speed: number };

/**
 * apply river to map: cave out river bed, floor river bed, annotate
 * @param river
 * @param pondSurface
 * @param riverExport
 */
export const applyRiverLayers = (
  river: point[],
  pondSurface: SeenSetReadOnly,
  riverExport: RiverExportTarget,
): void => {
  const riverProfile: riverProfilePoint[] = river
    .map(minFilter)
    .map((point, index) => ({
      x: point.point.x,
      y: point.point.y,
      z: point.z,
      width: Math.sqrt(params.growthRate * index),
      depth: 1,
      speed: 1,
    }));

  const outlines = collectLayers(riverProfile, 4);
  const allPoints: layerPoint[] = [];
  outlines.forEach((layer) => allPoints.push(...layer));

  const applyAsRiverBed = (point: layerPoint, profile: riverProfile): void => {
    if (riverExport.applyRivers) {
      setZ(point, point.parent.z - profile.depth);
      setWaterLevel(point, point.parent.z);
    }

    const isRiverSpine = (p: layerPoint) => {
      return p.x == p.parent.x && p.y == p.parent.y;
    };

    if (riverExport.annotationColor !== undefined) {
      annotateAll(
        [point],
        riverExport.annotationColor,
      );
    }
  };

  const applyAsRiverBank = (p: layerPoint, profile: riverProfile): void => {
    const lip = dimension.getSlope(p.x, p.y) > 1.5 ? 1 : 0; //1 == 45°
    if (riverExport.applyRivers) {
      setZ(p, Math.max(p.z, p.parent.z + lip));
      annotateAll([p], annotationColor.YELLOW);
    }
  };

  const isOcean = (point: zPoint): boolean => point.z <= params.waterLevel;

  riverProfile.map((profilePoint) => {
    const children = allPoints.filter((layerPoint) =>
      pointsEqual(layerPoint.parent, profilePoint),
    );
    const widthSquared = profilePoint.width * profilePoint.width;

    children
      .filter(pondSurface.hasNot)
      .filter((p) => !isWater(p))
      .map((child) => ({
        ...child,
        distSquared: squaredDistance(profilePoint, child),
      }))
      .forEach((child) => {
        if (child.distSquared <= widthSquared) {
          applyAsRiverBed(child, profilePoint);
        } else if (!isOcean(child) && child.distSquared <= widthSquared + 1) {
          //1 layer of outline
          applyAsRiverBank(child, profilePoint);
        }
      });
  });
};
