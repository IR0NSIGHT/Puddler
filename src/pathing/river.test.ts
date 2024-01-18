import {
  averagePoint,
  findClosestDrop,
  insertInSortedQueue,
  pathRiverFrom,
  squaredDistanceBetweenPoints,
} from "./river";
import { parentedPoint, point } from "../point";
import { makeSet } from "../SeenSet";
import { getZ } from "../terrain";
import { findPondOutflow } from "../puddle";

// Replace the original module with the mock implementation
jest.mock("../SeenSet");

describe("helper function river path", () => {
  test("distance calculation easy", () => {
    const pointA = { x: 0, y: 0 };
    const pointB = { x: 0, y: 10 };
    expect(squaredDistanceBetweenPoints(pointA, pointB)).toBe(10 * 10);
  });

  test("distance calculation easy", () => {
    const pointA = { x: 10, y: 10 };
    const pointB = { x: 20, y: 20 };
    expect(squaredDistanceBetweenPoints(pointA, pointB)).toBe(
      10 * 10 + 10 * 10,
    );
  });

  test("sorted queue", () => {
    const pointA = { point: { x: 0, y: 0 }, parent: undefined, distance: 0 };
    const pointB = { point: { x: 0, y: 0 }, parent: undefined, distance: 50 };
    const pointC = { point: { x: 0, y: 0 }, parent: undefined, distance: 100 };

    const queue: parentedPoint[] = [];
    insertInSortedQueue(queue, pointC);
    expect(queue).toEqual([pointC]);
    insertInSortedQueue(queue, pointA);
    expect(queue).toEqual([pointA, pointC]);
    insertInSortedQueue(queue, pointB);
    expect(queue).toEqual([pointA, pointB, pointC]);
  });

  test("average point", () => {
    const pointA = { x: 0, y: 0 };
    const pointB = { x: 10, y: 10 };
    const pointC = { x: 20, y: -10 };

    expect(averagePoint([pointA])).toEqual(pointA);
    const avg = averagePoint([pointA, pointB]);
    expect(avg).toEqual({ x: 5, y: 5 });
    const avg1 = averagePoint([pointA, pointB, pointC]);
    expect(avg1).toEqual({ x: 10, y: 0 });
  });
});

describe("river pathing", () => {
  beforeEach(() => {
    (global as any).dimension = {
      getLowestX: () => 0,
      getLowestY: () => 0,
      getHighestX: () => 1, //chunk, times 128
      getHighestY: () => 1,
      getHeightAt: (x: number, y: number) => x,
      getWaterLevelAt: (x: number, y: number) => -1,
      setWaterLevelAt: (x: number, y: number, waterLevel: number) => {},
    };
    (global as any).print = (s: string) => console.log(s);
    (global as any).params = {
      waterLevel: 62,
    };
  });

  afterEach(() => {
    (global as any).dimension = undefined;
    (global as any).print = undefined;
  });

  test("path to drop follows easy downhill", () => {
    const { pathToDrop, failed } = findClosestDrop(
      { x: 5, y: 5 },
      getZ({ x: 5, y: 5 }),
    );
    expect(failed).toBeFalsy();
    expect(pathToDrop![0].point).toEqual({ x: 4, y: 5 });
    expect(pathToDrop!.length).toBe(1);
  });

  test("path to drop can cross flat area", () => {
    //mock: area is flat, at (2,5) is a drop
    (global as any).dimension.getHeightAt = (x: number, y: number) => {
      return x == 2 && y == 5 ? 0 : 42;
    };
    const { pathToDrop } = findClosestDrop(
      { x: 5, y: 5 },
      getZ({ x: 5, y: 5 }),
    );
    expect(pathToDrop).toBeDefined();
    expect(pathToDrop!.length).toEqual(3);
    expect(pathToDrop![pathToDrop!.length - 1].point).toEqual({ x: 2, y: 5 });
  });

  test("path to drop can fail if no drop", () => {
    //mock: area is flat, starts in drop
    expect((global as any).dimension.getHeightAt).toBeDefined();
    (global as any).dimension.getHeightAt = (x: number, y: number) => {
      return x == 5 && y == 5 ? 0 : 42;
    };
    const path = findClosestDrop({ x: 5, y: 5 }, getZ({ x: 5, y: 5 }));
    expect(path.failed).toBeTruthy();
  });

  test("path to drop can not walk uphill to drop", () => {
    //mock: area is flat, starts in drop
    (global as any).dimension.getHeightAt = (x: number, y: number) => {
      if (x == 5 && y == 5) return 10;
      if (x == 0 && y == 0) return 0; //existing drop but not reachable without going uphill
      return 42;
    };
    const path = findClosestDrop({ x: 5, y: 5 }, getZ({ x: 5, y: 5 }));
    expect(path.failed).toBeTruthy();
  });

  test("river paths downhill and stops at waterlevel", () => {
    (global as any).dimension.getHeightAt = (x: number, y: number) => {
      if (x == 0) return 61; //terrain is one below waterlevel => is ocean
      return x + 62;
    };
    (global as any).params.waterLevel = 62;
    const { path, ponds } = pathRiverFrom({ x: 5, y: 5 }, makeSet(), {
      maxSurface: 1000000,
    });
    expect(path).toBeDefined();
    expect(path).toEqual([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
      { x: 2, y: 5 },
      { x: 1, y: 5 },
      { x: 0, y: 5 },
    ]);
    expect(ponds.length).toEqual(0);
  });

  test("findPondOutflow escapes simple pond", () => {
    //mock: area is flat, starts in drop
    (global as any).dimension.getHeightAt = (x: number, y: number) => {
      if (x == 5 && (y == 5 || y == 6)) return 100;
      if (x == 0 && y == 5) return 0; //existing drop but not reachable without going uphill
      return 110;
    };
    const start = { x: 5, y: 5 };

    const { pondSurface, waterLevel, depth, escapePoint } = findPondOutflow(
      [start],
      1000000,
      makeSet(),
    );
    expect(pondSurface.length).toEqual(2);
    expect(waterLevel).toEqual(110);
    expect(depth).toEqual(10);
    expect(escapePoint).toEqual({ x: 0, y: 5 });
  });

  test("findPondOutflow escapes deep pond", () => {
    //mock: area is flat, starts in drop
    (global as any).dimension.getHeightAt = (x: number, y: number) => {
      if (x == 5 && (y == 5 || y == 6)) return 100;
      if (x == 0 && y == 5) return 0; //existing drop but not reachable without going uphill
      return 200;
    };
    const start = { x: 5, y: 5 };

    const { pondSurface, waterLevel, depth, escapePoint } = findPondOutflow(
      [start],
      1000000,
      makeSet(),
    );
    expect(pondSurface.length).toEqual(2);
    expect(waterLevel).toEqual(200);
    expect(depth).toEqual(100);
    expect(escapePoint).toEqual({ x: 0, y: 5 });
  });

  test("findPondOutflow doesnt walk uphill", () => {
    //mock: area is flat, starts in drop
    (global as any).dimension.getHeightAt = (x: number, y: number) => {
      if (x == 5 && (y == 5 || y == 6)) return 100; //first and start pond
      if (x == 5 && (y == 1 || y == 2)) return 100; //second pond to traverse
      if (x == 0 && y == 5) return 0; //existing drop but not reachable without going uphill
      return 110;
    };
    const start = { x: 5, y: 5 };

    const { pondSurface, waterLevel, depth, escapePoint } = findPondOutflow(
      [start],
      1000000,
      makeSet(),
    );
    expect(pondSurface.length).toEqual(2);
    expect(waterLevel).toEqual(110);
    expect(depth).toEqual(10);
    expect(escapePoint).toEqual({ x: 5, y: 2 });
  });

  test("river escapes pond twice, second pond swallows first pond", () => {
    //mock: area is flat, starts in drop
    (global as any).dimension.getHeightAt = (x: number, y: number) => {
      if (x == 1 && y == 1) return 100; //first and start pond
      if (x == 3 && y == 3) return 100; //second pond
      if (x == 8 && y == 8) return 0; //final pond

      if (x >= 5 || y >= 5) return 200; //higher land everywhere except 0..5 => 0..5 will be the swallowing pond
      return 110;
    };
    const start = { x: 0, y: 0 };

    const { path, ponds } = pathRiverFrom(start, makeSet(), {
      maxSurface: 1000000,
    });
    //    expect(river).toEqual([{x: 0, y: 0}, {x: 0, y: 1},{x:1,y:1}])
    expect(path[0]).toEqual(start);
    expect(path[path.length - 1]).toEqual({ x: 8, y: 8 });
    expect(ponds.length).toEqual(2);
    expect(ponds[0].pondSurface).toEqual([{ x: 1, y: 1 }]);
    expect(ponds[0].escapePoint).toEqual({ x: 3, y: 3 });

    expect(ponds[1].pondSurface[0]).toEqual({ x: 3, y: 3 });
    expect(ponds[1].escapePoint).toEqual({ x: 8, y: 8 });

    const comparePoints = (a: point, b: point): number => {
      if (a.x !== b.x) {
        return a.x - b.x;
      }

      return a.y - b.y;
    };

    const pondIdeal: point[] = [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 1, y: 4 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 2, y: 4 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 4, y: 0 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 4, y: 3 },
      { x: 4, y: 4 },
    ];
    expect(pondIdeal.sort(comparePoints)).toEqual(
      ponds[1].pondSurface.sort(comparePoints),
    );
  });

  test("river escapes pond and connects escape to pond", () => {
    //mock: area is flat, starts in drop
    (global as any).dimension.getHeightAt = (x: number, y: number) => {
      if (x == 5 && y == 5) return 100;
      if (x == 0 && y == 5) return 0; //dropout
      return 110;
    };
    const start = { x: 8, y: 5 };

    const { path, ponds } = pathRiverFrom(start, makeSet(), {
      maxSurface: 1000000,
    });
    expect(path).toEqual([
      { x: 8, y: 5 },
      { x: 7, y: 5 },
      { x: 6, y: 5 },
      { x: 5, y: 5 }, //pond bottom
      { x: 4, y: 5 },
      { x: 3, y: 5 },
      { x: 2, y: 5 },
      { x: 1, y: 5 },
      { x: 0, y: 5 }, //escape point
    ]);
  });

  test("regression: river was unable to path to escape point", () => {
    //build after a real life map where i encountered the bug
    //mock: area is flat, starts in drop
    (global as any).dimension.getHeightAt = (x: number, y: number) => {
      if (x == 10 && y == 5) return 88;
      if (x <= 5) return 88; //dropout
      return 89;
    };
    const start = { x: 15, y: 5 };

    const { path, ponds } = pathRiverFrom(start, makeSet(), {
      maxSurface: 1000000,
    });
    expect(path).toEqual([
      { x: 15, y: 5 },
      { x: 14, y: 5 },
      { x: 13, y: 5 },
      { x: 12, y: 5 },
      { x: 11, y: 5 },
      { x: 10, y: 5 }, //pond bottom
      { x: 9, y: 5 },
      { x: 8, y: 5 },
      { x: 7, y: 5 },
      { x: 6, y: 5 },
      { x: 5, y: 5 }, //escape point
    ]);
  });
});
