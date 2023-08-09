// script.description= create natural creeks and ponds\nMark the starting points of the rivers with a cyan annotation.\nDetailed instructions at https://github.com/IR0NSIGHT/Puddler \nAnnotations: None(0), White(1), Orange(2), Magenta(3), LightBlue(4), Yellow(5), Lime(6), Pink(7), LightGrey(8), Cyan(9), Purple(10), Blue(11), Brown(12), Green(13), Red(14), Black(15)

//script.param.maxSurface.type=integer
//script.param.maxSurface.description=maximum surface area of ponds
//script.param.maxSurface.optional=false
//script.param.maxSurface.default=500

//script.param.minDepth.type=integer
//script.param.minDepth.description=minimal depth of ponds
//script.param.minDepth.optional=false
//script.param.minDepth.default=2

//script.param.minRiverLength.type=integer
//script.param.minRiverLength.description=minimal length of river
//script.param.minRiverLength.optional=false
//script.param.minRiverLength.default=50

//script.param.blocksPerRiver.type=integer
//script.param.blocksPerRiver.description=one river every x blocks
//script.param.blocksPerRiver.optional=false
//script.param.blocksPerRiver.default=100

//script.param.mustEndInPuddle.type=boolean
//script.param.mustEndInPuddle.description=river must end in puddle or existing water. NOT YET IMPLEMENTED
//script.param.mustEndInPuddle.optional=false
//script.param.mustEndInPuddle.default=true

//script.param.makePuddles.type=boolean
//script.param.makePuddles.description=generate puddles on map.
//script.param.makePuddles.optional=false
//script.param.makePuddles.default=true

//script.param.makeRivers.type=boolean
//script.param.makeRivers.description=generate rivers on map.
//script.param.makeRivers.optional=false
//script.param.makeRivers.default=true

//script.param.exportRiverToAnnotation.type=integer
//script.param.exportRiverToAnnotation.description=Annotation color to export rivers to. -1 to disable. 10: purple
//script.param.exportRiverToAnnotation.optional=false
//script.param.exportRiverToAnnotation.default=-1

//script.param.exportRiverWaterDepth.type=integer
//script.param.exportRiverWaterDepth.description=Depth below original terrain level to export waterlevel to. -1 to disable.
//script.param.exportRiverWaterDepth.optional=false
//script.param.exportRiverWaterDepth.default=0

//script.param.exportRiverTerrainDepth.type=integer
//script.param.exportRiverTerrainDepth.description=Depth below original terrain level to export river bottom to. Should be higher than waterDepth to have effect -1 to disable.
//script.param.exportRiverTerrainDepth.optional=false
//script.param.exportRiverTerrainDepth.default=1
