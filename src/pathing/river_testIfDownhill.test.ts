// Your tests that use the getZ function
import * as terrainModule from '../terrain';
import {point} from "../point";
import {testIfDownhill} from "./river";

jest.mock('../terrain');
const mockedGetZ = jest.fn((pos: point, floor: boolean) => {
    return pos.x;
});
(terrainModule as any).getZ = mockedGetZ;

test('river-never-running-uphill assertion works', () => {


    const riverPath: point[] = [{x: 3, y: -1},{x: 3, y: -1},{x: 2, y: -1},{x: 1, y: -1}];
    expect(testIfDownhill(riverPath)).toEqual(true);
    riverPath.push({x:2, y: -1})
    expect(testIfDownhill(riverPath)).toEqual(false);
});
