// Your tests that use the getZ function
import { minFilter } from "./postprocessing";
import { point } from "../point";

describe("min filter", () => {
  beforeAll(() => {
    (global as any).dimension = {
      getLowestX: () => 0,
      getLowestY: () => 0,
      getHighestX: () => 10,
      getHighestY: () => 10,
      getHeightAt: (x: number, y: number) => x,
    };
  });

  afterAll(() => {
    (global as any).dimension = undefined;
  });

  test("min filter returns min z neighbour", () => {
    const point: point = { x: 5, y: 5 };
    const minNeighbour = minFilter(point);
    expect(minNeighbour.z).toEqual(4);
  });
});
