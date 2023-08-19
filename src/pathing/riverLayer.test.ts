import {collectLayers, collectOneLayer, findClosestIndex} from "./riverLayer";
import {makeSet, makeSetFrom} from "../SeenSet";
import {point, pointsEqual, squaredDistance} from "../point";

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
            {x: 0, y: 0, z: 60},
            {x: 1, y: 1, z: 60},
            {x: 10, y: 10, z: 60},
            {x: 11, y: 11, z: 60},
        ]
        expect(findClosestIndex(p, list)).toBe(2)
    })

    test("can collect one layer around one point", () => {
        const river = [
            {x: 10, y: 10, z: 42, parent: {x: 10, y: 10, z: 42}}
        ]
        const layerOne = collectOneLayer(river, river, makeSet())
        expect(layerOne.length).toEqual(8)
        const distances = layerOne.map(p => squaredDistance(river[0], p))   //direct neighbours are 1, diagonal neighbours are 2
        distances.forEach(p =>
            expect(p).toBeLessThanOrEqual(2)
        )
        layerOne.forEach(p => {
            expect(p.parent).toBe(river[0])
        })
        layerOne.forEach(p => {
            expect(p).not.toBe(river[0])
        })
    })

    test("can collect one layer around multiple points", () => {
        const river = [
            {x: 10, y: 10, z: 42, parent: {x: 10, y: 10, z: 42}},
            {x: 10, y: 11, z: 42, parent: {x: 10, y: 11, z: 42}},
            {x: 10, y: 12, z: 42, parent: {x: 10, y: 12, z: 42}},
            {x: 10, y: 13, z: 42, parent: {x: 10, y: 13, z: 42}}
        ]
        const layerOne = collectOneLayer(river, river, makeSet())
        expect(layerOne.length).toEqual(3 + 3 + 4 + 4)
        const distances = layerOne.map(p => squaredDistance(p.parent!, p))   //direct neighbours are 1, diagonal neighbours are 2
        distances.forEach(p =>
            expect(p).toBeLessThanOrEqual(2)
        )

        //test that all points in the layer are unique => no clones
        const layerSet = new Set<point>()
        layerOne.forEach(p => {
            layerSet.add(p)
        })
        expect(layerSet.size).toEqual(layerOne.length)
        const riverSet = makeSet()
        river.forEach(riverSet.add)

        layerOne.forEach(p => {
            expect(riverSet.has(p.parent!)).toBeTruthy()
        })
        const riverAndLayer = layerOne.filter(riverSet.has).map(p => ({
            x: p.x, y: p.y
        }))
        expect(riverAndLayer).toEqual([])
    })


    test("layer parents are preferred to have lower z - 01", () => {
        const river = [
            {x: 10, y: 10, z: 42, parent: {x: 10, y: 10, z: 42}},
            {x: 10, y: 12, z: 40, parent: {x: 10, y: 12, z: 40}},
        ]
        const layerOne = collectOneLayer(river, river, makeSet())

        layerOne
            .filter(p => squaredDistance(p, river[0]) == squaredDistance(p, river[1]))
            .forEach(p => {
                expect(p.parent).toEqual(river[1])
            })
    })

    test("layer parents are preferred to have lower z - 02", () => {
        //reverse riverpoint order
        const river = [
            {x: 10, y: 12, z: 40, parent: {x: 10, y: 12, z: 40}},
            {x: 10, y: 10, z: 42, parent: {x: 10, y: 10, z: 42}},
        ]
        const layer = collectOneLayer(river, river, makeSet())

        layer
            .filter(p => squaredDistance(p, river[0]) == squaredDistance(p, river[1]))
            .forEach(p => {
                expect(p.parent).toEqual(river[0])
            })
    })

    test("every point is in exactly one layer. no layers share points.", () => {
        (global as any).dimension.getHeightAt = (x: number, y: number) => y

        const river = [
            {x: 10, y: 10, z: 10, parent: {x: 10, y: 10, z: 10}},
            {x: 10, y: 11, z: 11, parent: {x: 10, y: 11, z: 11}},
            {x: 10, y: 12, z: 12, parent: {x: 10, y: 12, z: 12}},
            {x: 10, y: 13, z: 12, parent: {x: 10, y: 13, z: 12}},
            {x: 10, y: 14, z: 12, parent: {x: 10, y: 14, z: 12}},
            {x: 10, y: 15, z: 12, parent: {x: 10, y: 15, z: 12}},

        ]
        const layers = collectLayers(river, 2).map(
            (layer, idx) => ({idx: idx, layer: layer, set: makeSetFrom(layer)})
        )

        for (let myLayer of layers) {
            for (let otherLayer of layers) {
                if (myLayer.idx === otherLayer.idx) continue;
                //make sure that my points are not present in the other layer
                const shared = myLayer.layer.filter(p => otherLayer.set.has(p))
                expect(shared).toHaveLength(0)
            }
        }

    })


    test("inspect why parenting is ", () => {
        (global as any).dimension.getHeightAt = (x: number, y: number) => y


        //reverse riverpoint order
        const river = [
            {x: 10, y: 10, z: 10, parent: {x: 10, y: 10, z: 10}},
            {x: 10, y: 11, z: 11, parent: {x: 10, y: 11, z: 11}},
            {x: 10, y: 12, z: 12, parent: {x: 10, y: 12, z: 12}},
            {x: 10, y: 13, z: 13, parent: {x: 10, y: 13, z: 13}},
            {x: 10, y: 14, z: 14, parent: {x: 10, y: 14, z: 14}},
            {x: 10, y: 15, z: 15, parent: {x: 10, y: 15, z: 15}},
            {x: 10, y: 16, z: 16, parent: {x: 10, y: 16, z: 16}},
            {x: 10, y: 17, z: 17, parent: {x: 10, y: 17, z: 17}},
            {x: 10, y: 18, z: 18, parent: {x: 10, y: 18, z: 18}},
            {x: 10, y: 19, z: 19, parent: {x: 10, y: 19, z: 19}},
            {x: 10, y: 20, z: 20, parent: {x: 10, y: 20, z: 20}},

        ]
        const iterations = 5
        const layers = collectLayers(river, iterations)
        const allPoints = layers.flat()

        allPoints.forEach(
            p => expect(p.parent).toBeDefined()
        )

        //non endpoint origins will have 1 + iterations + iterations children
        river.slice(1, river.length - 1).forEach(
            origin => {
                const originChildren = allPoints.filter(p => pointsEqual(p.parent, origin))
                expect(originChildren).toHaveLength(1 + iterations + iterations)
            })


    })
})