// script.description= create natural creeks and ponds\nMark the starting points of the rivers with a cyan annotation.\nDetailed instructions at https://github.com/IR0NSIGHT/Puddler

//script.param.maxSurface.type=integer
//script.param.maxSurface.description=maximum surface area of ponds
//script.param.maxSurface.optional=false
//script.param.maxSurface.default=10000
//script.param.maxSurface.displayName=Max Puddle Surface

//script.param.minRiverLength.type=integer
//script.param.minRiverLength.description=minimal length of river in blocks
//script.param.minRiverLength.optional=false
//script.param.minRiverLength.default=50
//script.param.minRiverLength.displayName=Minimal River Length

//script.param.blocksPerRiver.type=integer
//script.param.blocksPerRiver.description=spawn one river every x blocks
//script.param.blocksPerRiver.optional=false
//script.param.blocksPerRiver.default=1000
//script.param.blocksPerRiver.displayName=Spawn Probability

//script.param.floodPuddles.type=boolean
//script.param.floodPuddles.description=flood ponds with water on map.
//script.param.floodPuddles.optional=false
//script.param.floodPuddles.default=false
//script.param.floodPuddles.displayName=Flood Puddles

//script.param.applyRivers.type=boolean
//script.param.applyRivers.description=generate rivers as water on map.
//script.param.applyRivers.optional=false
//script.param.applyRivers.default=false
//script.param.applyRivers.displayName=Apply Rivers

//script.param.annotateAll.type=boolean
//script.param.annotateAll.description=use annotations instead of water for river and puddle
//script.param.annotateAll.optional=false
//script.param.annotateAll.default=true
//script.param.annotateAll.displayName=Apply as Annotations

//script.param.waterLevel.type=integer
//script.param.waterLevel.description=Water level of ocean. rivers will stop if they fall below that level
//script.param.waterLevel.optional=false
//script.param.waterLevel.default=62
//script.param.waterLevel.displayName=Ocean Water Level

//script.param.stopOnWater.type=boolean
//script.param.stopOnWater.description=stop the river if it hits a body of water
//script.param.stopOnWater.optional=false
//script.param.stopOnWater.default=true
//script.param.stopOnWater.displayName=Stop on Water

//script.param.growthRate.type=float
//script.param.growthRate.description=How fast a river grows in width. formula is width = sqrt(rate * length)
//script.param.growthRate.optional=false
//script.param.growthRate.default=0.005
//script.param.growthRate.displayName=Growth Rate of river width
