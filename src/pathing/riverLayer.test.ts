import {collectLayers, collectOneLayer, findClosestIndex} from "./riverLayer";
import {makeSet, makeSetFrom} from "../SeenSet";
import {point, squaredDistance} from "../point";

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
            {x: 10, y: 10, z: 42, parent: undefined}
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
            {x: 10, y: 10, z: 42, parent: undefined},
            {x: 10, y: 11, z: 42, parent: undefined},
            {x: 10, y: 12, z: 42, parent: undefined},
            {x: 10, y: 13, z: 42, parent: undefined}
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


    test("layer parents are preferred to have lower z", () => {
        const river = [
            {x: 10, y: 10, z: 42, parent: undefined},
            {x: 10, y: 12, z: 40, parent: undefined},
        ]
        const layerOne = collectOneLayer(river, river, makeSet())

        layerOne
            .filter(p =>squaredDistance(p,river[0]) == squaredDistance(p, river[1]))
            .forEach(p => {
                expect(p.parent).toEqual(river[1])
            })
    })

    test("",()=>{
        //reverse riverpoint order
        const river = [
            {x: 10, y: 12, z: 40, parent: undefined},
            {x: 10, y: 10, z: 42, parent: undefined},
        ]
        const layer = collectOneLayer(river, river, makeSet())

        layer
            .filter(p => squaredDistance(p, river[0]) == squaredDistance(p, river[1]))
            .forEach(p => {
                expect(p.parent).toEqual(river[0])
            })
    })

    test("", () => {
        (global as any).dimension.getHeightAt = (x: number, y: number) => y


        //reverse riverpoint order
        const river = [
            {x: 10, y: 10, z: 10, parent: undefined},
            {x: 10, y: 11, z: 11, parent: undefined},
            {x: 10, y: 12, z: 12, parent: undefined},
            {x: 10, y: 13, z: 13, parent: undefined},
            {x: 10, y: 14, z: 14, parent: undefined},
            {x: 10, y: 15, z: 15, parent: undefined},
            {x: 10, y: 16, z: 16, parent: undefined},
            {x: 10, y: 17, z: 17, parent: undefined},
            {x: 10, y: 18, z: 18, parent: undefined},
            {x: 10, y: 19, z: 19, parent: undefined},
            {x: 10, y: 20, z: 20, parent: undefined},

        ]
        const layers = collectLayers(river, 5)

        //all parents are define
        layers.forEach(layer => layer.forEach(
            p => expect(p.parent).toBeDefined()
        ))

        const zeroLayer = makeSetFrom(layers[0])
        expect(layers[0].length).toEqual(river.length)
        river.forEach(p => {
            expect(zeroLayer.has(p)).toBeTruthy()
        })

        layers[1].forEach(p => {
            expect(p.parent).toEqual({x: 10, y: p.y, z: p.y})
        })

        expect(layers[1].length).toEqual(river.length * 2 + 6)
    })
})