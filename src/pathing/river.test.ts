import {averagePoint, insertInSortedQueue, squaredDistanceBetweenPoints} from "./river";
import {parentedPoint} from "../point";

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