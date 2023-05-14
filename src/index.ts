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

  while (queue.length != 0 && safetyIterator < 10000) {
    next = queue.shift() as point;
    markPos(next, 13);
    //make sure position is not yet marked

    //abort condition
    if (Math.floor(getZ(next)) < posZ) {
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
    safetyIterator++;
  }
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
    var next = advanceDownhill(current);
    if (isWater(next) || isMarked(next, 37)) {
      waterReached = true;
      break;
    }
    if (pointsEqual(current, next)) {
      log("find closest drop from " + JSON.stringify(next));
      var nextLower = findClosestDrop(next, Math.floor(getZ(next)));
      log("drop at: " + JSON.stringify(nextLower));
      if (pointsEqual(nextLower, next))
        //abort if closestDrop coulndt find anything
        break;
      current = nextLower; //use found pos
      markPos(current, 14);
      continue; //restart with a lower point
    }

    current = next;
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
