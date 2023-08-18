import {findClosestIndex} from "./riverLayer";

// Replace the original module with the mock implementation
jest.mock('../SeenSet');
describe("", () => {
    beforeEach(() => {
        (global as any).dimension = {
            getLowestX: () => 0,
            getLowestY: () => 0,
            getHighestX: () => 1,   //chunk, times 128
            getHighestY: () => 1,
            getHeightAt: (x: number, y: number) => x,
            getWaterLevelAt: (x: number, y: number) => -1,
            setWaterLevelAt: (x: number, y: number, waterLevel: number) => {
            }
        };
        (global as any).print = (s: string) => console.log(s);
        (global as any).params = {
            waterLevel: 62,
        }
    })

    afterEach(() => {
        (global as any).dimension = undefined;
        (global as any).print = undefined;
    });

    test("", () => {
        const p = {x: 10, y: 10}
        const list = [
            {x: 0, y: 0},
            {x: 1, y: 1},
            {x: 10, y: 10},
            {x: 11, y: 11}
        ]
        expect(findClosestIndex(p, list)).toBe(2)
    })

    test("can collect one layer")
})