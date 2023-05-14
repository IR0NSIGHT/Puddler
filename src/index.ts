type point = { x: number; y: number };

function log(mssg: string) {
  //@ts-ignore
  print(mssg);
}

function getNeighbours(pos: point): point[] {
  return [
    addPoints({ x: -1, y: 0 }, pos),
    addPoints({ x: 1, y: 0 }, pos),
    addPoints({ x: 0, y: -1 }, pos),
    addPoints({ x: 0, y: 1 }, pos),
  ];
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
/**
 * find the point closest to pos thats at least one block lower
 * @param pos
 * @param posZ
 * @returns
 */
function findClosestDrop(pos: point, posZ: number, floor: boolean): point {
  log("find closest drop from " + JSON.stringify(pos) + " floor: " + floor);
  var seenSet: string[] = [];
  const markSeen = (pos: point) => {
    seenSet.push(JSON.stringify(pos));
  };
  const isSeen = (pos: point) => {
    return seenSet.indexOf(JSON.stringify(pos)) !== -1;
  };
  var queue = [pos];
  var closed = [];
  var next;
  var safetyIterator = 0;
  markSeen(pos);
  while (queue.length != 0 && safetyIterator < 10000) {
    next = queue.shift() as point;
    const nextDetail = { x: next.x, y: next.y, z: getZ(next, floor) };
    closed.push(nextDetail);
    //make sure position is not yet marked

    //abort condition
    if (getZ(next, floor) < posZ) {
      return next; //TODO return path to next
    }

    var neighbours = getNeighbours(next);
    neighbours.forEach(function (n) {
      if (getZ(n, floor) <= posZ && !isSeen(n)) {
        //unknown point
        markSeen(n);
        queue.push(n); //add to queue
      }
    });
    safetyIterator++;
  }
  if (!floor) {
    //try again with rounded numbers
    log("try again with flooring");
    return findClosestDrop(pos, Math.floor(posZ), true);
  }
  closed.forEach((a) => {
    markPos(a, 13);
    log("closed[]:" + JSON.stringify(a));
  });
  log("failed to find lower drop, return original " + JSON.stringify(pos));
  return pos;
}

const pointsEqual = (a: point, b: point) => {
  return a.x == b.x && a.y == b.y;
};

function pathDownhill(pos: point) {
  log("path downhill from:" + JSON.stringify(pos));
  var path = [pos];
  var i = 0;
  var current = pos;
  let waterReached = false;
  while (i < 1000) {
    i++;
    var next = findClosestDrop(current, getZ(current), false);
    if (pointsEqual(next, current))
      //abort if closestDrop coulndt find anything
      break;
    current = next;

    if (isWater(current) || isMarked(current, 37)) {
      waterReached = true;
      break;
    }

    path.push(current);
    markPos(current, 37);
    log(JSON.stringify(current) + " z=" + getZ(current));
  }
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
pathDownhill({ x: 627, y: 1418 });
