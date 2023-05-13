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

function findClosestDrop(pos: point, targetZ: number) {
  var seenSet: point[] = [];
  var queue = [pos];
  var next;
  var safetyIterator = 0;
  log("find drop from pos=" + JSON.stringify(pos));

  while (queue.length != 0 && safetyIterator < 10000) {
    next = queue.shift() as point;

    markPos(next, 13);
    //abort condition
    if (Math.floor(getZ(next)) < targetZ) {
      log("found lower at z=" + getZ(next) + " vs targetZ=" + targetZ);
      return next; //TODO return path to next
    }

    var neighbours = getNeighbours(next);
    neighbours.forEach(function (n) {
      if (Math.floor(getZ(n)) <= targetZ && seenSet.indexOf(n) == -1) {
        //unknown point
        seenSet.push(n);
        queue.push(n); //add to queue
      }
    });
    safetyIterator++;
  }
  log("no drop found after " + safetyIterator + " iterations, abort");
  log("seen list: " + seenSet.length);
  return pos;
}

function pathDownhill(pos: point) {
  var path = [pos];
  var i = 0;
  var current = pos;
  while (i < 10000) {
    var next = advanceDownhill(current);
    if (isWater(next)) break;
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
    i = i + 1;
  }
}

var pos = { x: 851, y: 1353 };

pathDownhill(pos);
pathDownhill({ x: 627, y: 1418 });
