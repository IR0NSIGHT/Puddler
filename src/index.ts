import "core-js/es/set";

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

function advanceDownhill(pos: point): point {
  var lowestZ = getZ(pos);
  var stepPos = pos;
  getNeighbours(pos).forEach(function (n) {
    var neighZ = getZ(n);
    if (neighZ < lowestZ) {
      lowestZ = neighZ;
      stepPos = n;
    }
  });
  return stepPos;
}

function addPoints(a: point, b: point): point {
  return { x: a.x + b.x, y: a.y + b.y };
}

function getZ(pos: point): number {
  return dimension.getHeightAt(pos.x, pos.y);
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
function findClosestDrop(pos: point, posZ: number) {
  var seenSet: string[] = [];
  const markSeen = (pos: point) => {
    seenSet.push(JSON.stringify(pos));
  };
  const isSeen = (pos: point) => {
    return seenSet.indexOf(JSON.stringify(pos)) !== -1;
  };
  var queue = [pos];
  var next;
  var safetyIterator = 0;
  log("find drop from pos=" + JSON.stringify(pos));

  while (queue.length != 0 && safetyIterator < 10000) {
    next = queue.shift() as point;
    markPos(next, 13);
    //make sure position is not yet marked

    //abort condition
    if (Math.floor(getZ(next)) < posZ) {
      log("found lower at z=" + getZ(next) + " vs targetZ=" + posZ);
      return next; //TODO return path to next
    }

    var neighbours = getNeighbours(next);
    neighbours.forEach(function (n) {
      if (Math.floor(getZ(n)) <= posZ && !isSeen(n)) {
        //unknown point
        markSeen(n);
        queue.push(n); //add to queue
      }
    });
    log("seen: " + JSON.stringify(seenSet));
    safetyIterator++;
  }
  log("no drop found after " + safetyIterator + " iterations, abort");
  log("seen list: " + seenSet.length);
  return pos;
}

function pathDownhill(pos: point) {
  log("path downhill from:" + JSON.stringify(pos));
  var path = [pos];
  var i = 0;
  var current = pos;
  let waterReached = false;
  while (i < 10000) {
    var next = advanceDownhill(current);
    if (isWater(next)) {
      waterReached = true;
      break;
    }
    if (next == current) {
      var nextLower = findClosestDrop(next, Math.floor(getZ(next)));
      if (nextLower == next)
        //abort if closestDrop coulndt find anything
        break;
      next = nextLower; //use found pos
      markPos(next, 14);
      return; //restart with a lower point
    }

    current = next;
    path.push(current);
    markPos(current, 37);
    log(JSON.stringify(current));
    i++;
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

const set = new Set<number>();
set.add(1);
set.add(2);
set.add(3);

log("" + set.has(2)); // true
log("" + set.size); // 3
