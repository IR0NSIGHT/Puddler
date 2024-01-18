import {makeSet, SeenSet} from "../SeenSet";
import {addPoints, getNeighbourPoints, parentedPoint, parentedToList, point,} from "../point";
import {getZ, isWater} from "../terrain";
import {findPondOutflow, PondGenerationParams, Puddle} from "../puddle";
import {log} from "../log";
import * as assert from "assert";
import {RiverPath} from "./riverLayer";

export const testIfDownhill = (path: RiverPath) => {
    for (let i = 0; i < path.length - 1; i++) {
        const current = getZ(path[i], true);
        const next = getZ(path[i + 1], true)
        if (next > current)
            return false;
    }
    return true;
}
export const annotationColor = {
    PURPLE: 10,
    ORANGE: 2,
    YELLOW: 5,
    RED: 14
};

/**
 * finds route that escapes the pond, to continue the river there
 */
const escapePond = (pond: Puddle, startPoint: parentedPoint, puddleDebugSet: SeenSet): {
    canEscape: boolean,
    escapePath: parentedPoint[]
} => {
    if (pond.escapePoint !== undefined) { //can escape pond
        pond.pondSurface.forEach(puddleDebugSet.add);

        const escapePoint: parentedPoint = {
            point: pond.escapePoint!,
            parent: startPoint,
            distance: -1
        }

        const thisPond = makeSet();
        pond.pondSurface.forEach(thisPond.add);
        //connect pond to escape
        const {pathToDrop, failed} = findClosestDrop(
            escapePoint.point,
            pond.waterLevel,
            (p) => thisPond.has(p), //we found a connection to the pond surface!
            (p: point) => getZ(p, true) <= pond.waterLevel
        )
        if (failed) {
            log("ERROR: couldnt find path to escape point: " + JSON.stringify(escapePoint.point))
            return {canEscape: false, escapePath: []}
        }
        const pathOutOfPond = pathToDrop.reverse();
        pathOutOfPond.shift(); //remove connectionpoint on pond surface
        pathOutOfPond.push(escapePoint);
        return {canEscape: true, escapePath: pathOutOfPond}
    } else {
        return {canEscape: false, escapePath: []}
    }
}

enum RiverStoppedReason {
    foundWater,
    mergedIntoRiver,
    belowOceanLevel,
    error
}

/**
 * will generate the next segment of the river from starting point.
 * can climb uphill if from-point is the bottom of a puddle
 * @param from
 * @param pondParams
 * @param puddleDebugSet
 */
const nextRiverSegment = (from: parentedPoint, pondParams: PondGenerationParams, puddleDebugSet: SeenSet): {
    generatedPond: Puddle | undefined,
    riverSegment: parentedPoint[],
    stopped: RiverStoppedReason | undefined,

} => {
    if (getZ(from.point) < params.waterLevel) //base water level reached
        return {
            generatedPond: undefined,
            riverSegment: [],
            stopped: RiverStoppedReason.belowOceanLevel
        }
    if (params.stopOnWater && isWater(from.point)) {
        return {
            generatedPond: undefined,
            riverSegment: [],
            stopped: RiverStoppedReason.foundWater
        }
    }

    const {pathToDrop, failed} = findClosestDrop(from.point, getZ(from.point));   //TODO refactor return type to use meaningful booleans

    if (!failed) {
        return {
            generatedPond: undefined,
            riverSegment: pathToDrop,
            stopped: undefined,

        }
    }

    //could not find a dropPoint => caught in hole
    const pond = findPondOutflow([from.point], pondParams.maxSurface, puddleDebugSet)
    const escape = escapePond(pond, from, puddleDebugSet)

    if (escape.canEscape) {
        return {
            stopped: undefined,
            riverSegment: escape.escapePath,
            generatedPond: pond
        }
    } else {
        return {
            stopped: RiverStoppedReason.error,
            riverSegment: [],
            generatedPond: pond
        }
    }
}

const findIndex = <T>(arr: T[], match: (x: T) => boolean): number => {
    for (let i = 0; i < arr.length; i++) {
        if (match(arr[i]))
            return i;
    }
    return -1;
}
const onlyPointsBeforeMerge = (riverPath: parentedPoint[], rivers: SeenSet) => {
    const lastPointToAddIdx = findIndex<parentedPoint>(riverPath, (p: parentedPoint): boolean => {
        return rivers.has(p.point) || (params.stopOnWater && isWater(p.point))
    })
    const didMerge = lastPointToAddIdx != -1
    const pointsBeforeMerge = didMerge ? riverPath.slice(0, lastPointToAddIdx) : riverPath
    return {merge: didMerge, pointsBeforeMerge: pointsBeforeMerge}
}

export type River = { path: RiverPath, ponds: Puddle[] }

/**
 * start a new river path at this position
 * @param pos
 * @param rivers
 * @param pondParams
 */
export const pathRiverFrom = (pos: point, rivers: SeenSet, pondParams: PondGenerationParams): River => {
    const path: parentedPoint[] = [{point: pos, parent: undefined, distance: -1}];
    let safetyIt = 0;
    const thisRiverSet = makeSet();
    const puddleDebugSet = makeSet();
    const ponds: Puddle[] = [];


    while (safetyIt < 1000) {
        safetyIt++;

        const {
            riverSegment,
            stopped,
            generatedPond
        } = nextRiverSegment(path[path.length - 1], pondParams, puddleDebugSet)
        const {merge, pointsBeforeMerge} = onlyPointsBeforeMerge(riverSegment, rivers)

        pointsBeforeMerge.forEach(p => {
            thisRiverSet.add(p.point)
            path.push(p)
        })
        if (generatedPond)
            ponds.push(generatedPond)
        if (stopped || merge) {
            break;
        }
    }
    path.forEach((p) => rivers.add(p.point));
    return {path: path.map((a) => a.point), ponds: ponds};
};


export const squaredDistanceBetweenPoints = (a: point, b: point) => {
    const diff = {x: a.x - b.x, y: a.y - b.y};
    return diff.x * diff.x + diff.y * diff.y;
}


export const insertInSortedQueue = (sortedQueue: parentedPoint[], point: parentedPoint): void => {
    let i = 0;
    for (let iteratorPoint of sortedQueue) {
        if (iteratorPoint.distance > point.distance) break;
        i++;
    }
    sortedQueue.splice(i, 0, point);
}


export const averagePoint = (points: point[]): point => {
    const sum = points.reduce((a, b) => addPoints(a, b), {x: 0, y: 0});
    return {x: sum.x / points.length, y: sum.y / points.length};
}

/**
 * find the point closest to pos thats at least one block lower
 * @param startingPoint
 * @param posZ
 * @param isDrop
 * @param isValidNeighbour
 * @returns path to this point with drop being the last
 */
export function findClosestDrop(
    startingPoint: point,
    posZ: number,
    isDrop: (p: point) => boolean = (p) => getZ(p, true) < Math.round(posZ),
    isValidNeighbour: (p: point) => boolean = (p) => getZ(p, true) <= posZ
): { pathToDrop: parentedPoint[], failed: boolean } {
    const seenSet: SeenSet = makeSet();

    const queue: parentedPoint[] = [];
    queue.push({point: startingPoint, parent: undefined, distance: 0})
    seenSet.add(startingPoint);
    let next: parentedPoint;
    let safetyIterator = 0;

    while (queue.length != 0 && safetyIterator < 50000) {
        next = queue.shift() as parentedPoint;
        if (isDrop(next.point)) {
            const path = parentedToList(next, []).reverse();
            //path starts with startingPoint, which is not wanted
            path.shift();
            return {pathToDrop: path, failed: false};
        }

        let neighbours = getNeighbourPoints(next.point).filter(seenSet.hasNot);
        const trueLowerNeighbours = neighbours.filter(n => getZ(n, true) < Math.round(posZ));
        if (trueLowerNeighbours.length == 0) {
            //no lower neighbour, river is in flat area => sort by tinyest height difference
            neighbours = neighbours.sort((a, b) => {
                const aZ = getZ(a, false);
                const bZ = getZ(b, false);
                return aZ - bZ;
            });
        }

        neighbours.filter(isValidNeighbour).forEach((n) => {
            seenSet.add(n);
            insertInSortedQueue(queue, {
                point: n,
                parent: next,
                distance: squaredDistanceBetweenPoints(n, startingPoint)
            });
        });
        safetyIterator++;
    }
    return {pathToDrop: [], failed: true};
}

export const capRiverStart = (river: RiverPath, slice: number) => {
    return river.slice(slice);
};
