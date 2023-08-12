import {averagePoint, findClosestDrop, insertInSortedQueue, pathRiverFrom, squaredDistanceBetweenPoints} from "./river";
import {parentedPoint} from "../point";
import {makeSet} from '../SeenSet';
import {getZ} from "../terrain";
import {findPondOutflow} from "../puddle";

// Replace the original module with the mock implementation
jest.mock('../SeenSet');

describe('helper function river path', () => {
    test("distance calculation easy", () => {
        const pointA = {x: 0, y: 0};
        const pointB = {x: 0, y: 10};
        expect(squaredDistanceBetweenPoints(pointA, pointB)).toBe(10 * 10);
    })

    test("distance calculation easy", () => {
        const pointA = {x: 10, y: 10};
        const pointB = {x: 20, y: 20};
        expect(squaredDistanceBetweenPoints(pointA, pointB)).toBe(10 * 10 + 10*10);
    })

    test("sorted queue", () => {
        const pointA = {point: {x: 0, y: 0}, parent: undefined, distance: 0};
        const pointB = {point: {x: 0, y: 0}, parent: undefined, distance: 50};
        const pointC = {point: {x: 0, y: 0}, parent: undefined, distance: 100};

        const queue: parentedPoint[] = [];
        insertInSortedQueue(queue, pointC);
        expect(queue).toEqual([pointC]);
        insertInSortedQueue(queue, pointA);
        expect(queue).toEqual([pointA, pointC]);
        insertInSortedQueue(queue, pointB);
        expect(queue).toEqual([pointA, pointB, pointC]);
    })

    test("average point", () => {
        const pointA = {x: 0, y: 0};
        const pointB = {x: 10, y: 10};
        const pointC = {x: 20, y: -10};

        expect(averagePoint([pointA])).toEqual(pointA);
        const avg = averagePoint([pointA, pointB]);
        expect(avg).toEqual({x: 5, y: 5});
        const avg1 = averagePoint([pointA, pointB, pointC]);
        expect(avg1).toEqual({x: 10, y: 0})
    })


});

describe("river pathing", () => {
    beforeEach(() => {
        (global as any).dimension = {
            getLowestX: () => 0,
            getLowestY: () => 0,
            getHighestX: () => 10,
            getHighestY: () => 10,
            getHeightAt: (x: number, y: number) => x,
        };
        (global as any).print = (s: string) => console.log(s);
    })

    afterEach(() => {
        (global as any).dimension = undefined;
        (global as any).print = undefined;
    });

    test("path to drop follows easy downhill", () => {
        const path = findClosestDrop({x: 5, y: 5}, getZ({x: 5, y: 5}));
        expect(path).toBeDefined()
        expect(path![0].point).toEqual({x: 4, y: 5})
        expect(path!.length).toBe(1)
    })

    test("path to drop can cross flat area", () => {
        //mock: area is flat, at (2,5) is a drop
        (global as any).dimension.getHeightAt = (x: number, y: number) => {
            return (x == 2 && y == 5) ? 0 : 42
        }
        const path = findClosestDrop({x: 5, y: 5}, getZ({x: 5, y: 5}));
        expect(path).toBeDefined()
        expect(path!.length ).toEqual(3)
        expect(path![path!.length - 1].point).toEqual({x: 2, y: 5})
    })

    test("path to drop can fail if no drop", () => {
        //mock: area is flat, starts in drop
        expect((global as any).dimension.getHeightAt).toBeDefined();
        (global as any).dimension.getHeightAt = (x: number, y: number) => {
            return (x == 5 && y == 5) ? 0 : 42
        }
        const path = findClosestDrop({x: 5, y: 5}, getZ({x: 5, y: 5}));
        expect(path).toBeUndefined();
    })

    test("path to drop can not walk uphill to drop", () => {
        //mock: area is flat, starts in drop
        (global as any).dimension.getHeightAt = (x: number, y: number) => {
            if (x == 5 && y == 5) return 10;
            if (x == 0 && y == 0) return 0; //existing drop but not reachable without going uphill
            return 42
        }
        const path = findClosestDrop({x: 5, y: 5}, getZ({x: 5, y: 5}));
        expect(path).toBeUndefined();
    })

    test("river paths downhill", () => {
        const path = pathRiverFrom({x: 5, y: 5}, makeSet())
        expect(path).toBeDefined()
        expect(path[0]).toEqual({x: 5, y: 5})
        expect(path.length).toEqual(10)
        expect(path[9]).toEqual({x: 0, y: 0})
    })

    test("river escapes simple pond", () => {
        //mock: area is flat, starts in drop
        (global as any).dimension.getHeightAt = (x: number, y: number) => {
            if (x == 5 && (y == 5 ||y == 6)) return 100;
            if (x == 0 && y == 5) return 0; //existing drop but not reachable without going uphill
            return 110
        }
        const start = {x: 5, y: 5};

        const { pondSurface, waterLevel, depth, escapePoint} = findPondOutflow([start], 1000000, makeSet())
        expect(pondSurface.length).toEqual(2)
        expect(waterLevel).toEqual(110)
        expect(depth).toEqual(10)
        expect(escapePoint).toEqual({x: 0, y: 5})
    })

    test("river paths after escape from pond", () => {
        //mock: area is flat, starts in drop
        (global as any).dimension.getHeightAt = (x: number, y: number) => {
            if (x == 5 && (y == 5 ||y == 6)) return 100;    //first and start pond
            if (x == 5 && (y == 1 ||y == 2)) return 100;    //second pond to traverse
            if (x == 0 && y == 5) return 0; //existing drop but not reachable without going uphill
            return 110
        }
        const start = {x: 5, y: 5};

        const { pondSurface, waterLevel, depth, escapePoint} = findPondOutflow([start], 1000000, makeSet())
        expect(pondSurface.length).toEqual(2)
        expect(waterLevel).toEqual(110)
        expect(depth).toEqual(10)
        expect(escapePoint).toEqual({x: 5, y: 2})
    })
})