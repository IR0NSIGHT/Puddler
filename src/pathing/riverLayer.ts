import {getNeighbourPointsDiagonal, point, squaredDistance, withZ, zPoint} from "../point";
import {makeSet, SeenSetReadOnly} from "../SeenSet";

type layerPoint = zPoint & { parent: layerPoint | undefined }
type layer = layerPoint[]
export const collectLayers = (river: point[], iterations: number): layer[] => {
    const ignoreAsNeighbour = makeSet()
    const layers: layer[] = []
    const firstLayer: layer = river.map(p => ({...withZ(p), parent: undefined}))
    layers.push(firstLayer)

    let origins: layer = firstLayer;
    for (let i = 0; i < iterations; i++) {
        const layer = collectOneLayer(origins, origins, ignoreAsNeighbour)
        layer.forEach(ignoreAsNeighbour.add)
        layers.push(layer)
    }

    return layers
}

export const collectOneLayer = (origins: layerPoint[], parents: layerPoint[], invalidNeighbours: SeenSetReadOnly): layer => {
    const originsSet = makeSet()
    const nsSet = makeSet()
    origins.forEach(originsSet.add)
    const neighbours: layerPoint[] = []
    origins.forEach(p => {
        const ns = getNeighbourPointsDiagonal(p)
            .filter(nsSet.hasNot)
            .filter(originsSet.hasNot)
            .filter(invalidNeighbours.hasNot)
            .map(n => ({...withZ(n), parent: findParent(p, parents)}))
        neighbours.push(...ns)
        ns.forEach(nsSet.add)
    })
    return neighbours
}

/**
 * choose the layerpoint that is closes to to p as the parent, return parent
 * @param p
 * @param list
 * @independent
 */
const findParent = (p: point, list: layerPoint[]): layerPoint => {
    const idx = findClosestIndex(p, list);
    return list[idx];
}

/**
 * get index of closest point.
 * if not point is closer than initial distance, return -1
 * @param p
 * @param list
 * @independent
 */
export const findClosestIndex = (p: point, list: point[]): number => {
    let closest = -1
    let closestDist = 1000000000
    for (let i = 0; i < list.length; i++) {
        const candidate = list[i]
        const candidateDist = squaredDistance(candidate, p)
        if (candidateDist < closestDist) {
            closestDist = candidateDist
            closest = i
        }
    }
    return closest!
}