type point = { x: number; y: number };

function log(mssg: string) {
  //@ts-ignore
  print(mssg);
}

function getNeighbours(pos: point): point[] {
  switch ((pos.x + pos.y) % 4) {
    case 0:
      return [
        addPoints({ x: -1, y: 0 }, pos),
        addPoints({ x: 1, y: 0 }, pos),
        addPoints({ x: 0, y: -1 }, pos),
        addPoints({ x: 0, y: 1 }, pos),
      ];
    case 1:
      return [
        addPoints({ x: 1, y: 0 }, pos),
        addPoints({ x: 0, y: -1 }, pos),
        addPoints({ x: 0, y: 1 }, pos),
        addPoints({ x: -1, y: 0 }, pos),
      ];
    case 2:
      return [
        addPoints({ x: 0, y: -1 }, pos),
        addPoints({ x: 0, y: 1 }, pos),
        addPoints({ x: -1, y: 0 }, pos),
        addPoints({ x: 1, y: 0 }, pos),
      ];
    case 3:
      return [
        addPoints({ x: 0, y: 1 }, pos),
        addPoints({ x: -1, y: 0 }, pos),
        addPoints({ x: 1, y: 0 }, pos),
        addPoints({ x: 0, y: -1 }, pos),
      ];
    default:
      throw new Error("impossible");
  }
}

function addPoints(a: point, b: point): point {
  return { x: a.x + b.x, y: a.y + b.y };
}

function getZ(pos: point, floor?: boolean): number {
  const z = dimension.getHeightAt(pos.x, pos.y);
  return floor ? Math.floor(z) : z;
}

function getTerrainById(terrainId: number) {
  //@ts-ignore
  var terrain = org.pepsoft.worldpainter.Terrain.VALUES[terrainId];
  return terrain;
}

function markPos(pos: point, id: number) {
  dimension.setTerrainAt(pos.x, pos.y, getTerrainById(id));
}

function isWater(pos: point) {
  var terrainZ = getZ(pos);

  return terrainZ < dimension.getWaterLevelAt(pos.x, pos.y);
}

const isMarked = (pos: point, id: number): boolean => {
  return (
    dimension.getTerrainAt(pos.x, pos.y).getName() ==
    getTerrainById(id).getName()
  );
};

const assert = (cond: boolean, mssg: string) => {
  if (!cond) throw new Error("condition hurt: " + mssg);
};

type parentedPoint = { point: point; parent: parentedPoint | undefined };

const parentedToList = (
  endPoint: parentedPoint,
  list: parentedPoint[]
): parentedPoint[] => {
  list.push(endPoint);
  log("push parented point: " + JSON.stringify(endPoint.point));
  if (endPoint.parent === undefined) return list;
  return parentedToList(endPoint.parent, list); //its recursion B)
};

/**
 * find the point closest to pos thats at least one block lower
 * @param pos
 * @param posZ
 * @returns
 */
function findClosestDrop(
  pos: point,
  posZ: number,
  floor: boolean,
  blacklist?: parentedPoint[]
): parentedPoint[] {
  log("find closest drop from " + JSON.stringify(pos) + " floor: " + floor);
  var seenSet: string[] = [];
  const markSeen = (pos: point) => {
    seenSet.push(JSON.stringify(pos));
  };
  const isSeen = (pos: point) => {
    return seenSet.indexOf(JSON.stringify(pos)) !== -1;
  };
  var queue: parentedPoint[] = [{ point: pos, parent: undefined }];
  let next: parentedPoint;
  var safetyIterator = 0;
  markSeen(pos);
  while (queue.length != 0 && safetyIterator < 10000) {
    next = queue.shift() as parentedPoint;

    //abort condition
    if (getZ(next.point, floor) < posZ) {
      log("listify endpoint:" + JSON.stringify(next));
      return parentedToList(next, []); //TODO return path to next
    }

    var neighbours = getNeighbours(next.point);
    neighbours.forEach(function (n) {
      if (getZ(n, floor) <= posZ && !isSeen(n)) {
        //unknown point
        markSeen(n);
        queue.push({ point: n, parent: next }); //add to queue
      }
    });
    safetyIterator++;
  }
  if (!floor) {
    //try again with rounded numbers
    log("try again with flooring");
    return findClosestDrop(pos, Math.floor(posZ), true);
  }
  log("failed to find lower drop, return original " + JSON.stringify(pos));
  return [];
}

const pointsEqual = (a: point, b: point) => {
  return a.x == b.x && a.y == b.y;
};

/**
 * start a new river path at this position
 * @param pos
 */
function pathRiverFrom(pos: point) {
  log("path downhill from:" + JSON.stringify(pos));
  var path: parentedPoint[] = [{ point: pos, parent: undefined }];
  var i = 0;
  var current = pos;
  let waterReached = false;
  while (i < 1000) {
    i++;
    const pathToDrop = findClosestDrop(current, getZ(current), false);
    if (pathToDrop.length == 0)
      //abort if closestDrop coulndt find anything
      break;
    log("path to drop: " + JSON.stringify(pathToDrop.map((a) => a.point)));
    pathToDrop.forEach((a) => path.push(a));
    current = pathToDrop[0].point;

    if (isWater(current) || isMarked(current, 37)) {
      waterReached = true;
      break;
    }

    log(JSON.stringify(current) + " z=" + getZ(current));
  }
  path.forEach((a) => {
    markPos(a.point, 37);
  });
  log(
    "finished path, reached water: " +
      waterReached +
      " path length: " +
      path.length +
      " end:" +
      JSON.stringify(path[path.length - 1])
  );
}

var pos = { x: 851, y: 1353 };

//pathDownhill(pos);
pathRiverFrom({ x: 627, y: 1418 });

for (let x = 0; x < 10; x++) {
  for (let y = 0; y < 10; y++) {
    pathRiverFrom({ x: x * 100, y: y * 100 });
  }
}
