import {makeSet, SeenSet} from "../SeenSet";
import {addPoints, getNeighbourPoints, parentedPoint, parentedToList, point,} from "../point";
import {getZ, isWater} from "../terrain";
import {findPondOutflow, PondGenerationParams, Puddle} from "../puddle";
import {log} from "../log";

export const testIfDownhill = (path: point[]) => {
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
        const pathEscapeToPond = findClosestDrop(
            escapePoint.point,
            pond.waterLevel,
            (p) => thisPond.has(p), //we found a connection to the pond surface!
            (p: point) => getZ(p, true) <= pond.waterLevel
        )
        if (pathEscapeToPond == undefined) {
            log("ERROR: couldnt find path to escape point: " + JSON.stringify(escapePoint.point))
            return {canEscape: false, escapePath: []}
        }
        const pathToDrop = pathEscapeToPond.reverse();
        pathToDrop.shift(); //remove connectionpoint on pond surface
        pathToDrop.push(escapePoint);
        return {canEscape: true, escapePath: pathToDrop}
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

const advanceRiver = (from: parentedPoint, pondParams: PondGenerationParams, puddleDebugSet: SeenSet): {
    generatedPond: Puddle | undefined,
    riverPath: parentedPoint[],
    stopped: RiverStoppedReason | undefined,

} => {
    if (getZ(from.point) < params.waterLevel) //base water level reached
        return {
            generatedPond: undefined,
            riverPath: [],
            stopped: RiverStoppedReason.belowOceanLevel
        }
    if (params.stopOnWater && isWater(from.point)) {
        return {
            generatedPond: undefined,
            riverPath: [],
            stopped: RiverStoppedReason.foundWater
        }
    }

    let pathToDrop = findClosestDrop(from.point, getZ(from.point));   //TODO refactor return type to use meaningful booleans

    if (pathToDrop !== undefined) {
        return {
            generatedPond: undefined,
            riverPath: pathToDrop,
            stopped: undefined,

        }
    }

    //could not find a dropPoint => caught in hole
    const pond = findPondOutflow([from.point], pondParams.maxSurface, puddleDebugSet)
    const escape = escapePond(pond, from, puddleDebugSet)

    if (escape.canEscape) {
        return {
            stopped: undefined,
            riverPath: escape.escapePath,
            generatedPond: pond
        }
    } else {
        return {
            stopped: RiverStoppedReason.error,
            riverPath: [],
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
    const lastPointToAddIdx = findIndex<parentedPoint>(riverPath,(p: parentedPoint): boolean => {
        return rivers.has(p.point) || (params.stopOnWater && isWater(p.point))
    })
    const didMerge = lastPointToAddIdx != -1
    const pointsBeforeMerge = didMerge ? riverPath.slice(0, lastPointToAddIdx) : riverPath
    return {merge: didMerge, pointsBeforeMerge: pointsBeforeMerge}
}

/**
 * start a new river path at this position
 * @param pos
 * @param rivers
 * @param pondParams
 */
export const pathRiverFrom = (pos: point, rivers: SeenSet, pondParams: PondGenerationParams): {
    river: point[],
    ponds: { pondSurface: point[], waterLevel: number, depth: number, escapePoint: point | undefined }[]
} => {
    const path: parentedPoint[] = [{point: pos, parent: undefined, distance: -1}];
    let safetyIt = 0;
    const thisRiverSet = makeSet();
    const puddleDebugSet = makeSet();
    const ponds: Puddle[] = [];


    while (safetyIt < 1000) {
        safetyIt++;

        const {riverPath, stopped, generatedPond} = advanceRiver(path[path.length-1], pondParams, puddleDebugSet)

        const {merge, pointsBeforeMerge} = onlyPointsBeforeMerge(riverPath, rivers)

        pointsBeforeMerge.forEach(p => {
            thisRiverSet.add(p.point)
            path.push(p)
        })
        if (generatedPond)
            ponds.push(generatedPond)
        if (stopped|| merge ) {
            break;
        }
    }
    path.forEach((p) => rivers.add(p.point));
    return {river: path.map((a) => a.point), ponds: ponds};
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
): parentedPoint[] | undefined {
    const seenSet: SeenSet = makeSet();

    const queue: parentedPoint[] = [];
    queue.push({point: startingPoint, parent: undefined, distance: 0})
    seenSet.add(startingPoint);
    let next: parentedPoint;
    let safetyIterator = 0;
    let searchCenter: point = startingPoint

    while (queue.length != 0 && safetyIterator < 50000) {
        next = queue.shift() as parentedPoint;
        if (isDrop(next.point)) {
            const path = parentedToList(next, []).reverse();
            //path starts with startingPoint, which is not wanted
            path.shift();
            return path;
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
                distance: squaredDistanceBetweenPoints(n, searchCenter)
            });
        });
        safetyIterator++;
    }
    return undefined;
}

export const capRiverStart = (river: point[], slice: number) => {
    return river.slice(slice);
};
