// RJM's code for simulating a robot.
// 19/01/2015
// 7/7/15

 var envMode = 0				// for different modes
				// 0 is basic; 1 is complex; 2 is racetrack; 3 is hilled track; 4 is guide; 5 is maze; 6 is line to follow
 var environment = []
 var environment2 = []			// for race track
 var raceHills = []				//for hills on race track
 var pathToFollow = []			// for line tracking
 var oneRobot = false			// if true, then one robot called robot exists
 var robots = []				// array of robots
 var numRobs = 0				// how many there are
 var mouseSel = 999				// index used to indicate which robot/light selected by the mouse
 var lights = []				// array of lights
 var numLights = 0				// how many there are
 
 var PI = Math.PI				// mathematical constants used 
 var PIby2 = PI/2
 var PIby4 = PI/4
 var TwoPI = 2*PI
 
 var backCols = ["255, 255, 192", "255, 192, 192", "192, 255, 255", "255, 255, 160", "255, 255, 128"]
								// strings defining different colours used for the background of the environment
 var canvasback = "rgb("+backCols[0]+")"		// string to define the main background colour
 
 function setGrayBack() {
	// function to set the grey background for the robots - as used on FutureLearn
	 backCols = ["233, 234, 232", "255, 234, 232", "233, 255, 232", "211, 212, 210", "191, 192, 190"]
     canvasback = "rgb("+backCols[0]+")"
 }	 

 
function doResize(newWidth) {   
		// function to resize canvas to given width ... check that any robots / lights are in range
var canvas  = document.getElementById("myCanvasSYS")
var ctx = canvas.getContext("2d");
    canvas.setAttribute('width', newWidth);				// set canvas so expands with browser
    if (oneRobot) {
		robot.checkOnCanvas(newWidth)
	}
	else 
		for (var ct= 0; ct< numRobs; ct++)	robots[ct].checkOnCanvas (newWidth)
	for (var ct= 0; ct< numLights; ct++) lights[ct].checkOnCanvas (newWidth)
		
   resizeEnvironment()
   redrawEnvironment(ctx);						// draw the environment with robot
}

 	function addMouseDown (canvas) {
		// set up function doMouseDown to be called when mouse clicks on the given canvas
		canvas.addEventListener("mousedown", doMousedown, false);			// define mouse functions
	}	

  	function getMousePos(canvas, event) {
			// returns the x,y coordinates of where the mouse clicks within the canvas
	   var rect = canvas.getBoundingClientRect();
	   return {
	     x : event.clientX - rect.left,				// x is the actual position - the left of the canvas rectangle
		 y : event.clientY - rect.top				// y is the y position - the top of the canvas
		 };
	}	 

    function robotMouseDown(theRobot, mousepos) {
				// function called when the user repositions the given robot at the mouse position
		theRobot.robotDraw(false)					// first undraw the robot at its current position
		theRobot.robotx = mousepos.x				// position it at the neew position
		theRobot.roboty = mousepos.y
		theRobot.stuck = false						// say robot is not stuck
		redrawEnvironment(theRobot.ctx)				// redraw the environment
		theRobot.robotDraw(true)					// now draw the robot in its new position
	}

	function doMousedown(event) {
				// function called when the user mouse clicks in to the canvas
	var canvas = document.getElementById("myCanvasSYS")
	var mousepos = getMousePos(canvas, event);		// get its position
	var dist, sdist, ct
		if (mouseSel == 999) {						// if no robot selected, assume there is a single robot
			robotMouseDown (robot, mousepos)		// and put it down
		}	
		else if (mouseSel >= 100) {					// if user has selected a light 
			lights[mouseSel-100].lightDraw(false)	// erase from its old position
			lights[mouseSel-100].lightx = mousepos.x	// set its new position
			lights[mouseSel-100].lighty = mousepos.y
			lights[mouseSel-100].lightDraw(true)	// draw light in its new position
			mouseSel = -1							// deselect light
		}
		else if (mouseSel >= 0) {					// otherwise have selected one of the robots
			robotMouseDown(robots[mouseSel], mousepos)	// so move to new position
			mouseSel = -1							// deselect robot
		}
		else {										// no device has been selected, so this click is selecting nearest robot/light
		    rsel = -1;								// specify no robot selected
			lsel = -1								// and no light selected
			sdist = 1000							// set shortest distance to be large
		    for (ct = 0; ct < numRobs; ct++) {		// search all robots to find the one closest to mouse position
				dist = robots[ct].distFrom (mousepos.x, mousepos.y)		// how far from mouse
				if (dist < sdist) {					// if closer than previous
				   sdist = dist						// remember this distance
				   rsel = ct						// and which robot
				}   
			}
		    for (ct = 0; ct < numLights; ct++) {	// do the same for all the lights
				dist = lights[ct].distFrom (mousepos.x, mousepos.y)
				if (dist < sdist) {
				   sdist = dist
				   lsel = ct
				   rsel = -1						// if light is closer than robot, deselect the robot
				}   
			}
			if (rsel >= 0) {						// if robot (not light) is closest
													// if mouse is within 2 radii of robot, select it
				if (sdist <= robots[rsel].robotsz * 2) mouseSel = rsel
			}										// if click within light, select it
			else if (sdist <= lights[lsel].lightsz) mouseSel = lsel	+ 100				// +100 so know have selected light
		}
	}


 
function drawLine (ctx, x1, y1, x2, y2) {
		// draw line on ctx from x1 to y1
   ctx.beginPath()
   ctx.moveTo(x1, y1)
   ctx.lineTo(x2, y2)
   ctx.stroke()
}

function distance (x1, y1, x2, y2) {
		// compute distance from x1,y1 to x2,y2
  return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
}
  
function inrange (p, p1, p2 ) {
		// is p between p1 and p2   ... check in case p2 < or < p1
  return (p2 >= p1) ? ( (p >= p1) && (p <= p2)) : ( (p >= p2) && (p <= p1))
}

function calcPCRange (x1, y1, x2, y2, x3, y3, x4, y4) {
	// x1,y1 to x2,y2 represents a sensor beam
	// function works out whether beam intersects with 'wall' x3,y3 to x4,y4
	// if so it returns distance of 'wall' from x1,y1 as a percentage of the beam x1,y1 to x2,y2

	// first calculate where line x1,y1 to x2,y2 intersects with that from x3,y3 to x4,y4
var x, y				// answer will be x,y
var m1, m2, c1, c2 		// used to compute gradients and offsets of lines
var calc = true;
  if (x1 == x2) {		// if vertical line
    if (x3 == x4) {		// wont intersect with other line
	    calc = false
    }
	else {
      x = x1						// answer's x is on first line
      m2 = (y4 - y3) / (x4 - x3)	// find gradient of second line
      c2 = y4 - x4 * m2				// and offset
      y = m2 * x1 + c2				// use line formula
    }
  }
  else {
    m1 = (y2 - y1) / (x2 - x1)		// calculate gradient/offset of first line
    c1 = y2 - x2 * m1
    if (x3 == x4) {					// if second line vertical
      x = x3
      y = m1 * x3 + c1				// calculate x,y using formulae
    }
    else {							// two non vertical lines
      m2 = (y4 - y3) / (x4 - x3)	//		 ... find grad/offset of second line
      c2 = y4 - x4 * m2;
      if (Math.abs(m2 - m1) < 1.0e-5) {		// if both parallel (or very near), dont intersect
	    calc = false
      }
	  else {
        x = (c2 - c1) / (m1 - m2)		// otherwise calculate intersection of two
        y = m2 * x + c2
      }
    }
  }
	// have found intersection, but now check if x,y between x1,y1 to x2,y2 and x3,y3 to x4,y4
  calc = calc && inrange (x, x1, x2) && inrange (y, y1, y2) && inrange (x, x3, x4) && inrange (y, y3, y4)
  
var pcdist
  if (calc) {										// if valid intersection
	var actdist = distance(x1, y1, x, y)			// calculate distance from x1,y1 to x,y
	var sensdist = distance (x1, y1, x2, y2)		// x1,y1 to x2,y2 represents sensor
	pcdist = 100*actdist / sensdist					// calculate distance to x,y as percentage of sensor
  }
  else pcdist = 1000  								// if no intersection, then distance is large.
  return pcdist
}

function calcdistfrom (x, y, x1, y1, x2, y2) {
// calc shortest distance from x,y to line from x1,y1..x2,y2
// sets xint,yint where perpendicular to x1,y1..x2,y2 goes thru x,y
// then tests if this is on line ...
// returns distance to xint,yint or to the nearest of x1,y1 and x2,y2
 var m, c1, c2
 var xint, yint
 var sdist, sdist2
     if (x1 == x2) {					// easy calculation if vertical line
       xint = x1 
	   yint = y
     }
     else if (y1 == y2) {				//  or if horizontal
       xint = x
	   yint = y1
     }
     else {
       m = (y2 - y1) / (x2 - x1)		// otherwise find m, gradient of line
       c1 = y1 - m * x1;				// and its constant, c
       c2 = y + x / m;					// perpendicular has grad 1/m, so this is its c
       xint = (c2 - c1) / (m + 1.0 / m)
       yint = (c1 / m + c2 * m) / (m + 1.0 / m) 
     }
			// now have point where perpendicular to line through x1,y1 and x2,y2 goes through x,y_
	if (inrange(xint, x1, x2) && inrange(yint, y1, y2) ) {
			// if this is between x1,y1 and x2,y2
		sdist = distance (x, y, xint, yint)		// shortest distance is from x,y to the intersection	
	}
	else {
		sdist = distance (x, y, x1, y1)			// find distance from x,y to x1,y1
		sdist2 = distance (x, y, x2, y2)		// and to x2,y2
		if (sdist2 < sdist) sdist = sdist2		// sdist has shorter
	}
	return sdist
}

function getRectPath() {
	var canvas = document.getElementById("myCanvasSYS");

	var ans = [canvas.width/16, canvas.height/6, 13*canvas.width/16, 2*canvas.height/3]
	return ans
}

function drawRectPath () {
// draw rectangular guide on arena if envOption is selected
var canvas = document.getElementById("myCanvasSYS");
var ctx=canvas.getContext("2d");
	if (envMode == 4) {						// if guide selected
		ctx.strokeStyle = "red"					// draw in red
		ctx.lineWidth = 2
		ctx.beginPath()							// the following rectangle
		var g = getRectPath()
		ctx.rect(g[0], g[1], g[2], g[3]);
					// this is consistent with going round much of race track
		ctx.stroke(); 
		ctx.strokeStyle = canvasback
	}	
}

function addPathToFollow (addit, cw, ch) {
var crad = ch/12
var xright = 13 * cw / 16
var ybot = 5*ch/6
	if (addit)
		pathToFollow = [cw/2, ch/6,  xright-crad, ch/6,  xright, ch/6+crad,  xright, ybot-crad,  xright-crad, ybot,
						cw/8+crad, ybot, cw/8, ybot-crad, cw/8, ch/6+crad, cw/8+crad, ch/6, cw/2, ch/6]
	else
		pathToFollow = []
	envMode = (addit) ? 6 : 0
}

function drawPathToFollow() {
var canvas = document.getElementById("myCanvasSYS");
var ctx=canvas.getContext("2d");
var ct = 0
	ctx.lineWidth = 16
	ctx.strokeStyle = "orange"
	ctx.beginPath()
	ctx.moveTo(pathToFollow[0], pathToFollow[1])
	for (ct= 2; ct<pathToFollow.length; ct+=2)
		ctx.lineTo(pathToFollow[ct], pathToFollow[ct+1])
	ctx.stroke()
}

		
function basicEnvironment (cw, ch) {
		// define an environment which is just a rectangle
	environment = [0, 0,  cw, 0,  cw, ch,  0, ch,  0, 0]
}

function addraceHills (addhills, cw, ch) {
			// function to add the escher hills ... areas where slows/speeds robor
	raceHills = [0, 0, cw/8, ch/3, 1,  5*cw/8, ch/3, cw/8, ch/3, 2]
	var rH1 = [cw/8, 0, 3*cw/8, ch/3, 0,  cw/2, 0, cw/8, ch/3, 3,  3*cw/4, 0, cw/4, ch/3, 0]      // flat up flat
	var rH2 = [3*cw/4, ch/3, cw/4, ch/3, 4,  3*cw/4, 2*ch/3, cw/4, ch/3, 0,  cw/4, 2*ch/3, cw/2, ch/3, 3]   // down flat up
	var rH3 = [0, ch/3, cw/4, 2*ch/3, 0,   cw/4, ch/3, cw/4, ch/3, 4,  cw/2, ch/3, cw/8, ch/3, 0]     // flat down flat
	if (addhills) raceHills = raceHills.concat(rH1, rH2, rH3)
}
	
function raceTrack (addit, addHills, cw, ch) {
			// function to add the race track =- flat or with hills
	basicEnvironment(cw, ch)		
	if (addit || addHills) 	{
		envMode = (addHills) ? 3 : 2
		environment2 = [0, ch/3, 3*cw/4, ch/3, 3*cw/4, 2*ch/3, cw/4, 2*ch/3]// , cw/4, ch/3]
		addraceHills (addHills, cw, ch)
	}	
	else  {
		envMode = 0
		environment2 = []				// deselect the track
		raceHills = []					// and the hills
	}	
}

function advancedEnvironment (cw, ch) {
		// define advanced environment - with peaks etc into rectangular arena
	envMode = 1;			
	var e1 = [0,0, cw*0.6,0, cw*0.61,ch*0.1, cw*0.69,ch*0.1, cw*0.7,0, cw,0]
	var e2 = [cw,ch*0.5, cw*0.9,ch*0.55, cw,ch*0.6, cw,ch]
	var e3 = [cw*0.4,ch, cw*0.4, ch*0.8, cw*0.35, ch*0.8, cw*0.35, ch, 0,ch]
	var e4 = [0,ch*0.5, cw*0.2,ch*0.4, 0,ch*0.3, 0,0]
	environment = e1.concat (e2, e3, e4)
}

function mazeEnvironment (cw, ch) {
		// define the maze environment
	envMode = 5;			
var e1 = [0,0, cw,0, cw,ch*0.25, cw*0.75,ch*0.25, cw*0.75,ch*0.26, cw,ch*0.26, cw,ch*0.5]
var e2 = [cw*0.2,ch*0.5, cw*0.2,ch*0.51, cw,ch*0.51, cw,ch*0.75, cw*0.45,ch*0.75, cw*0.45,ch*0.76, cw, ch*0.76]
var e3 = [cw,ch, 0,ch, 0,ch*0.76, cw*0.3,ch*0.76, cw*0.3,ch*0.75, 0,ch*0.75]
var e4 = [0,ch*0.26, cw*0.6,ch*0.26, cw*0.6,ch*0.25, 0,ch*0.25, 0,0]
	environment = e1.concat (e2, e3, e4)
}

function pathEnvironment(cw, ch) {
	envMode = 4
	basicEnvironment(cw, ch)
}
	
function resizeEnvironment() {
				// 0 is basic; 1 is complex; 2 is racetrack; 3 is hilled track; 4 is guide; 5 is maze
var canvas = document.getElementById("myCanvasSYS");
	switch (envMode) {
		case 0 : basicEnvironment(canvas.width, canvas.height)
				 break
		case 1 : advancedEnvironment(canvas.width, canvas.height)
				 break		 
		case 2 : 
		case 3 : basicEnvironment(canvas.width, canvas.height)
				 raceTrack (true, envMode==3, canvas.width, canvas.height)
				 break		 
		case 4 : basicEnvironment(canvas.width, canvas.height)
				 break
		case 5 : mazeEnvironment(canvas.width, canvas.height)
				 break
		case 6 : basicEnvironment(canvas.width, canvas.height)
				 addPathToFollow(true, canvas.width, canvas.height)
				 break
	}			 
}

function envLimits() {
	// return width and height of canvas
var canvas = document.getElementById("myCanvasSYS");
var ans = [canvas.width, canvas.height]
return ans	
}

function drawAnEnvironment (ctx, anEnv) {
// anEnv is an array of x,y coordinates ... draw them
	ctx.beginPath()
	ctx.moveTo (anEnv[0], anEnv[1])
	for (var ct = 2; ct < anEnv.length; ct = ct + 2) ctx.lineTo(anEnv[ct], anEnv[ct+1])
	ctx.stroke()
}

function drawHills(ctx) {
// draws the 'hills' of the race track ...
// these are defined as a set of flat/up/down rectangles
var atype
	for (var ct=0; ct<raceHills.length; ct+= 5) {
		atype = raceHills[ct+4]								// get type
		ctx.fillStyle = "rgb("+backCols[atype]+")"			// set colour accordingly
		ctx.fillRect(raceHills[ct], raceHills[ct+1], raceHills[ct+2], raceHills[ct+3])		// fill the rectangle
	}	
}

function getAreaType (rx, ry) {
// raceHills defines a set of rectangular areas each with a given type (Flat, uphill, downhill)
// function works out which hill rx,ry is in and returns the associated type
var ans = 0
	for (var ct = 0; ct<raceHills.length; ct+=5) {
		if (rx>=raceHills[ct] && rx<raceHills[ct]+raceHills[ct+2] && ry>=raceHills[ct+1] && ry<raceHills[ct+1]+raceHills[ct+3]) {
			ans = raceHills[ct+4]
		}	
	}
	return ans	
}
	
function inRaceEnd(rx, ry, back) {
// is object at rx, ry in the end of the race track  : end is at 2 if going forward at 1 if going back?
    return (getAreaType(rx, ry)==((back) ? 1 : 2))
}

function redrawEnvironment (ctx) {
// function redraws the environment
var canvas = document.getElementById("myCanvasSYS");	// details of canvas used to show environment
var ctx=canvas.getContext("2d");
	ctx.fillStyle = canvasback;
    ctx.fillRect(0, 0, canvas.width, canvas.height);	// clear canvas to background colour

	ctx.lineWidth = 1;
	ctx.strokeStyle = "black"
	if (environment2.length>0) {					// if second environment specified
		drawHills(ctx)								// draw its hills
		drawAnEnvironment(ctx, environment2)		// and second environment
	}	
	drawAnEnvironment(ctx, environment)				// draw main one

	for (ct = 0; ct < numLights; ct++) lights[ct].lightDraw(true)	//; and its lights
	drawRectPath()										// if specified, draw the rectangular guide
	if (envMode == 6) drawPathToFollow()
	if (oneRobot) robot.robotDraw(true)				// if one robot then draw it
	for (ct = 0; ct < numRobs; ct++) robots[ct].robotDraw(true)	//; if many robots, draw them
}



function inbeam (sAng1, sAng2, lAng1, lAng2) {
// Sensor angles are from sAng1..sAng2, beam in which light exists is from lAng1, lAng2
// sesnor can see light if either of sAng1 or sAng2 between lAng1 and lAng2
// or if either of lAng1 or lAng2 between sAng1 and sAng2
var ans = inrange (sAng1, lAng1, lAng2) || inrange (sAng2, lAng1, lAng2) || inrange (lAng1, sAng1, sAng2) || inrange (lAng2, sAng1, sAng2)
	return ans
}

function testLights(x1, y1, x2, y2, isnarrow) {
// test if can see a light (within angle of line from x1,y1 to x2,y2
// if can see any lights, return distance to closest one, as % of x1,y1 to x2,y2
var smalldist = 1000, newdist = 0, ct = 0				// set smallest distance as large number
var anangle = Math.atan2(y2-y1, x2-x1), anangle2		//compute angle between x1,y1 and x2,y2
var bwidth = (isnarrow) ? PIby4 / 4 : PIby4 / 2			// width of beam is 12 or 22 degrees ish
var bangles = [anangle-bwidth, anangle+bwidth]			// so beam is between these two angles
var dtolight, lsz
	for (ct = 0; ct < numLights; ct ++)  {      // now check distance to all the lights lights
		anangle2 = Math.atan2(lights[ct].lighty-y1, lights[ct].lightx-x1)	// angle x1,y1 to this light
		if (anangle2 > PIby2 && anangle < -PIby2) anangle2-=TwoPI			// fix for -PI..PI discontinuity
		else if (anangle2 < -PIby2 && anangle > PIby2) anangle2 += TwoPI
		
		dtolight = distance(x1, y1, lights[ct].lightx, lights[ct].lighty)	// distance to light
		lsz = lights[ct].lightsz											// take mnote of size of light
		bwidth = (dtolight<lsz) ? PIby4*2 : Math.atan2(lights[ct].lightsz,Math.sqrt(dtolight*dtolight-lsz*lsz)) 
							// if very close to light, it is visible in large beam ...
							// otherwise use an arc sin/cos formula for width
		if (inbeam (bangles[0], bangles[1], anangle2-bwidth, anangle2+bwidth ) ) {
						// now test if the light is within the beam
			newdist = dtolight - lights[ct].lightsz					// it is.. calculate distance to light
			newdist = newdist * 100 / distance(x1, y1, x2, y2)     	// adjust as % of sensor distance
			if (newdist < smalldist) smalldist = newdist			// remember if it is the smallest distance so far
		}
	}
	return smalldist
}


function testEnvironment(x1, y1, x2, y2, thisRob) {
	// x1,y1 to x2,y2 represents a sensor of this Robot  
	// function checks environment, light and other robots to find which wall/object is closest
	// if object is detected, function returns how far it is, as a % of the sensor range
var smalldist = 1000, newdist = 0, ct = 0
	while ( (ct+2 < environment.length) )  {   // first find distance to Walls
		newdist = calcPCRange (x1, y1, x2, y2, environment[ct], environment[ct+1], environment[ct+2], environment[ct+3] )
		if (newdist < smalldist) smalldist = newdist
		ct = ct + 2
	}
	ct = 0
	while ( (ct+2 < environment2.length) )  {   // first find distance to Walls of second environment
		newdist = calcPCRange (x1, y1, x2, y2, environment2[ct], environment2[ct+1], environment2[ct+2], environment2[ct+3] )
		if (newdist < smalldist) smalldist = newdist
		ct = ct + 2
	}
	for (ct = 0; ct < numRobs; ct ++)  {      // now check distance to other robots
		if (thisRob != ct) {				// dont look at this Robot	
			newdist = calcdistfrom (robots[ct].robotx, robots[ct].roboty, x1, y1, x2, y2)
			if (newdist < robots[ct].robotsz) {
				newdist = distance (x1, y1, robots[ct].robotx, robots[ct].roboty) - robots[ct].robotsz
				if (newdist < smalldist) smalldist = newdist
			}
		}
	}
	for (ct = 0; ct < numLights; ct ++)  {      // now check distance to other lights
		newdist = calcdistfrom (lights[ct].lightx, lights[ct].lighty, x1, y1, x2, y2)
		if (newdist < lights[ct].lightsz) {
			newdist = distance (x1, y1, lights[ct].lightx, lights[ct].lighty) - lights[ct].lightsz
			if (newdist < smalldist) smalldist = newdist
		}
	}
return smalldist
}

function distToPath (x, y) {
// function searches environment and finds the wall/robot/light closest to thisRob which is at x,y
var smalldist = 1000, newdist = 0, ct = 0			// distance set high
	while ( (ct+2 < pathToFollow.length) )  {		// find distance to each wall
		newdist = calcdistfrom (x, y, pathToFollow[ct], pathToFollow[ct+1], pathToFollow[ct+2], pathToFollow[ct+3] )
		if (newdist < smalldist) smalldist = newdist
		ct = ct + 2
	}
	return smalldist
}	

function distToEnvironment (x, y, thisRob) {
// function searches environment and finds the wall/robot/light closest to thisRob which is at x,y
var smalldist = 1000, newdist = 0, ct = 0			// distance set high
	while ( (ct+2 < environment.length) )  {		// find distance to each wall
		newdist = calcdistfrom (x, y, environment[ct], environment[ct+1], environment[ct+2], environment[ct+3] )
		if (newdist < smalldist) smalldist = newdist
		ct = ct + 2
	}
	ct = 0
	while ( (ct+2 < environment2.length) )  {		// and each wall in any extra set of walls
		newdist = calcdistfrom (x, y, environment2[ct], environment2[ct+1], environment2[ct+2], environment2[ct+3] )
		if (newdist < smalldist) smalldist = newdist
		ct = ct + 2
	}
	for (ct = 0; ct < numRobs; ct ++)  {      // now check distance to other robots
		if (thisRob != ct) {				// but not this robot
			newdist = robots[ct].distFrom(x, y) - robots[ct].robotsz
			if (newdist < smalldist) smalldist = newdist
		}
	}	
	for (ct = 0; ct < numLights; ct ++)  {      // now check distance to lights
		newdist = lights[ct].distFrom(x, y) - lights[ct].lightsz
		if (newdist < smalldist) smalldist = newdist
	}	
	return smalldist					// return smallest distance
}


function aLight (x, y, sz, ctx, num, col) {
// defines the num'th light at position x,y, size sz, colour col, in canvas ctx
this.lightx = x				// store its details
this.lighty = y
this.lightsz = sz
this.lightcol = col
this.lightNum = num
this.ctx = ctx
this.lightDraw = lightDraw			// define its draw function
this.distFrom = distFrom			// and for computing distance to it
this.checkOnCanvas = checkOnCanvas			// check still on  it
function lightDraw (show) {
		// draw light = if show, draw it, otherwise undraw it
	this.ctx.strokeStyle = (show) ? this.lightcol : canvasback		// set main colour or background
	this.ctx.lineWidth = (show) ? 2 : 4								// when undraw have wider lines 
	ctx.fillStyle = (show) ? this.lightcol : canvasback				// set fill colour similarly
	dsz = (show) ? this.lightsz : this.lightsz+2					// draw bigger when remove
	ctx.beginPath();
	ctx.arc(this.lightx,this.lighty,dsz,0,2*Math.PI);				// fill a circles
	ctx.fill()
}
function distFrom (x, y) {
		// how far away is x,y from light///
  return distance (x, y, this.lightx, this.lighty)
}
function checkOnCanvas (newWidth) {
	if (this.lightx + 10 > newWidth) 					// ensure light not gone off side of window
		this.lightx = newWidth - 10;
}
 
}
	
function aRobot (x, y, sz, ctx) {
// defines a robot at position x,y and given size.  ctx is context of the canvas where robot drawn
this.robotx = x					// store its size
this.roboty = y
this.robotsz = sz
this.lspeed = 0					// set its left and right speed to be 0
this.rspeed = 0
this.stuck = false				// and robot is not stuck
this.sensorTypes = [1, 0, 1]    //default sensor types are Left notForward Right whiskers
this.sensorReadings = [1000, 1000, 1000]	// and readings are objects long way away
this.ctx = ctx
this.dx = 1						// change in x and y directions
this.dy = 0
this.angle = 0					// angle of robot
this.rotm = [1, 0, 0, 1]		// rotation matrix
this.basecol = "rgb(128, 0, 128)"	// set its colour to purple
this.robNum = 0						// its number
this.speedControl = false			// no speed control

this.setRotMat = setRotMat			// define its member functions
this.calcX = robCalcX
this.calcY = robCalcY
this.robotDraw = robotDraw
this.robDrawLine = robDrawLine
this.robDrawArc = robDrawArc
this.forBeam = forBeam
this.forKey = false			// bodge when showing robot in key
this.detectObject = detectObject
this.detectLight = detectLight
this.detectPath = detectPath
this.turnRobot = turnRobot
this.moveRobot = moveRobot
this.checkForObject = checkForObject
this.drawWheels = drawWheels
this.calcNewSpeed = calcNewSpeed
this.drawSensor = drawSensor
this.getSensor = getSensor
this.defineSensors = defineSensors
this.updateRobot = updateRobot
this.lookahead = lookahead
this.isstuck = isstuck
this.distFrom = distFrom
this.checkMoveRobot = checkMoveRobot
this.checkOnCanvas = checkOnCanvas
this.raceStartPos = raceStartPos

function distFrom (x, y) {
		// how far is robot from position x,y
  return distance (x, y, this.robotx, this.roboty)
}  
function robotDraw(show) {
		// draw robot - either showing it or drawing in background colour to hide it
	ctx.strokeStyle = (show) ? "blue" : canvasback		// set colour
	ctx.lineWidth = (show) ? 2 : 4						// thicker lines when erasing
	this.setRotMat();									// compute rotation matrix
	var afac = 4   // (show) ? 3.7 : 4					// factor influencing range of sensor (4* robot size)
														// determine each sensor, and draw accordingly
    if (this.sensorTypes[0]>0) this.drawSensor(0, this.robotsz*afac*1.4, -PIby4, show)		// left at angle -45	
    if (this.sensorTypes[1]>0) this.drawSensor(1, this.robotsz*afac*1.4, 0, show)			// forward at angle 0
    if (this.sensorTypes[2]>0) this.drawSensor(2, this.robotsz*afac*1.4, PIby4, show)		// right at angle +45
	
	ctx.fillStyle = (show) ? this.basecol : canvasback	// set colour for fill
	dsz = (show) ? this.robotsz : this.robotsz+2		// draw slightly bigger when erasing
	ctx.beginPath();
	ctx.arc(this.robotx,this.roboty,dsz,0,2*Math.PI);	// draw body as circle
	ctx.fill()	
	this.drawWheels(show)								// add wheels
}
function getSensor(n) {									// return range already calculated of the nth sensor
   return this.sensorReadings[n]
}
function defineSensors (sT) {							// sT has types of each of the sensors ...
   for (var ct = 0; ct<3; ct++) {
      this.sensorTypes[ct] = sT[ct]
	}
}   
function drawSensor(sCt, sRange, sAngle, show) {
	// draw (or undraw) the sCt'th sensor which has the given range and is at the given angle
var detect = false
var beam = PIby4 / 2 							// beam width
if (this.sensorTypes[sCt] == 6) {
	sRange = this.robotsz*2 
	sAngle = sAngle / 2
}	
else if (this.sensorTypes[sCt] >= 3 ) {		// if is a beam rather than a whisker ...
   sRange = sRange * 2							// has double the range
   sAngle = sAngle / 2							// halve angle as is beam in both sides
  if (this.sensorTypes[sCt] == 3) beam = beam / 2  		// if narrow width halve beamwidth
} 
var ax = sRange*Math.cos(sAngle)				// calculate the x,y position at end of beam
var ay = sRange*Math.sin(sAngle)
var range
	if (show == false || this.forKey) range = this.sensorReadings[sCt] 
	else if (this.sensorTypes[sCt]==6) range = this.detectPath(ax, ay)
	else if (this.sensorTypes[sCt]>=3) range = this.detectLight(ax, ay, sCt) 
	else range = this.detectObject (ax, ay) 
				// if undrawing (or is drawing for key when selecting) use already calculated range
				// otherwise, if light sensor, detect distance to light
				// otrherwise detect distance to robot/wall
	if (show && this.sensorTypes[sCt]==2) {
					// for type 2 .. is range detector with a given beam
					// so calculate range at angles on other sides of main beam
		var range2
		for (var ct = -1; ct<=1; ct+=0.5) {
			if (ct != 0) {
				range2 = this.detectObject (sRange*Math.cos(sAngle + beam*ct), sRange*Math.sin(sAngle + beam*ct)) 
				if (range2 < range) range = range2
			}
		}	
	}	
// at this stage range has range of nearest object (if there) as % of beam length

var col = (show) ? ((range <=50) ? "green" :(range <= 100) ? "red" : "blue") : canvasback
		// set colour as green if very close; red if just visible; blue if too far away
	ctx.strokeStyle = col
var afac = (show) ? 0.95 : 1					// draw slightly smaller beams when show, bigger when erase
	if (this.sensorTypes[sCt] == 1) this.robDrawLine (0, 0, ax* afac, ay * afac)					// draw just a line
	else this.robDrawArc( (range<100) ? range*sRange/100 : sRange, sAngle-beam, sAngle+beam, show)	// draw a beam
	this.sensorReadings[sCt] = range																// remember range
}	
function setRotMat() {
// rotation transformation matrix - so can calulate actual positions despite robot at an angle
var cosa = Math.cos(this.angle)
var sina = Math.sin(this.angle)
	this.rotm = [cosa, sina, -sina, cosa]
}
function robCalcX(x, y) {
		// calculate actual x position of x,y relative to robot, taking into acccount the robot's angle
	return this.robotx + x*this.rotm[0] + y * this.rotm[2]
}	
function robCalcY(x, y) {
		// calculate actual xy position of x,y relative to robot, taking into acccount the robot's angle
	return this.roboty + x*this.rotm[1] + y * this.rotm[3]
}	
function robDrawLine (x1, y1, x2, y2) {
		// draw line x1,y1 to x2,y2 but take account of robot's angle
	drawLine(this.ctx, this.calcX(x1, y1), this.calcY(x1, y1), this.calcX(x2, y2), this.calcY(x2, y2))
}
function forBeam (brange, bangle, isforMoveto) {
	// part of a beam has the given range and angle : calculate its x,y position
	// then either moveTo position or draw from current to this position
var ax = brange*Math.cos(bangle)		// calculate nominal x,y
var ay = brange*Math.sin(bangle)
var x = this.calcX(ax, ay)				// now cope with robot's rotation
var y = this.calcY(ax, ay)
if (isforMoveto) this.ctx.moveTo(x, y) 	// moveto or lineto ...
else	this.ctx.lineTo(x,y)
}
function robDrawArc (sRange, fromAngle, toAngle, show) {
	// draw/undraw arc of beam ... which has given range, between the two angles
	// approximate arc by a series of lines
var mAngle = (fromAngle+toAngle)/2								// middle angle
	this.ctx.beginPath()
	this.ctx.lineWidth = (show) ? 2 : 4							// thicker lines if undraw
	this.forBeam(this.robotsz, mAngle, true)					// start of beam
	this.forBeam(sRange, fromAngle, false)						// draw to point at start of the beam width
	this.forBeam(sRange, (fromAngle*3+toAngle)/4, false)		// draw to point at 1/4 of the beam width
	this.forBeam(sRange, mAngle, false)							// to middle etc
	this.forBeam(sRange, (fromAngle+toAngle*3)/4, false)
	this.forBeam(sRange, toAngle, false)
	this.forBeam(this.robotsz, mAngle, false)
	this.ctx.stroke()
}
function drawWheels (show) {
		// draw/undraw wheels
	ctx.strokeStyle = (show) ? "black" : canvasback
	this.robDrawLine (0, -this.robotsz, 0, this.robotsz)		// draw axle
    ctx.lineWidth = (show) ? 5 : 6								// if undraw, use thicker lines 
var sfac = (show) ? 0.6 : 0.8
	this.robDrawLine(-sfac*this.robotsz, -this.robotsz, sfac*this.robotsz, -this.robotsz)	// draw left wheel
	this.robDrawLine(-sfac*this.robotsz, this.robotsz, sfac*this.robotsz, this.robotsz)		// and right
    ctx.lineWidth =2
}
function detectObject(antX, antY) {
	// calculate a line from robot to antX,antY - this is a sensor beam
	// search environment to see the object which is nearest to the beam.
var x2 = this.calcX(antX, antY)		// calc actual x,y
var y2 = this.calcY(antX, antY)
var distToNearest = testEnvironment (this.robotx, this.roboty, x2, y2, this.robNum)
	return distToNearest
}
function detectLight(antX, antY, sCt) {
	// calculate the shortest distance to a light based on a beam from robot to antX,antY 
	// sCt is the sensor - so beam width is set by its type 3 = narrow, 4 widw
var x2 = this.calcX(antX, antY)	// calc actual x,y
var y2 = this.calcY(antX, antY)
var distToNearest = testLights (this.robotx, this.roboty, x2, y2, (this.sensorTypes[sCt] == 3) )
	return distToNearest
}
function detectPath(antX, antY) {
	// calculate whether sensor at antX,antY can see the line (return 0 if not 1 if can) 
	// sCt is the sensor - so beam width is set by its type 3 = narrow, 4 widw
var x2 = this.calcX(antX, antY)	// calc actual x,y
var y2 = this.calcY(antX, antY)
var ans = (distToPath (x2, y2) < 8) ? 60 : 500
	return ans
}
function lookahead() {
// return distance of any object directly ahead
  return this.detectObject(robot.sz*5, 0)
}

function calcNewSpeed (oldSpeed, newSpeed, hillType, speedControl) {
// calculate the new speed of a motor .. 
// oldSpeed is what is was; newSpeed is the nominal newSpeed; hillType is 3 if upHill, 4 down, else flat
// take note if speedControl is applied
var hillFacs = [0, 1]								// speed is affected by factor hillFacs[1] offset by hillFacs[0]
	if (hillType == 3) hillFacs = [-1, 0.75]		// slows down up hill
	else if (hillType == 4) hillFacs = [1, 1.25]	// speeds up down
	if (speedControl) { 							// speedControl reduces impact of these
	   hillFacs[0] = hillFacs[0] / 10
	   hillFacs[1] = 1
	} 
	
var affSpeed = newSpeed * hillFacs[1] + hillFacs[0] 	// speed affected by disturbance
var updateFacs = (speedControl) ? [0.1, 0.9, 0.1, 0.6] : [0.7, 0.3, 0.3, 0.35]	
		// these factors set the timeconstants of the update ... if control have shorter constants
		// note actual speed is calculated based on old and new speeds
		// if change from +ve to -ve, reduce change of speed...
    if ( ( (oldSpeed > 0) && (affSpeed <= 0) ) || ( (oldSpeed < 0)&& (affSpeed >= 0) ) ) {
      newSpeed = updateFacs[2] * oldSpeed + updateFacs[3] * affSpeed
    }
    else newSpeed = updateFacs[0]*oldSpeed + updateFacs[1] * affSpeed
	return newSpeed		// return calculated speed
}
function moveRobot(newlspeed, newrspeed) {
	// newlspeed newrspeed are the nominal new speeds
var hillType = getAreaType(this.robotx, this.roboty)								// what hill type
this.lspeed = calcNewSpeed(this.lspeed, newlspeed, hillType, this.speedControl)		// calculate actual left speed
this.rspeed = calcNewSpeed(this.rspeed, newrspeed, hillType, this.speedControl)		// and right speed
var dist =  ( (this.rspeed + this.lspeed) * 0.1)    								//  nominal distance travelled			
//	if (dist == 0) dist = 0.001			// bodge so get valid angles!!
var sina = (this.lspeed - this.rspeed) * Math.PI/ 400    							// calc sin or angle change
var newangle = this.angle + 2 * Math.atan2 (sina , Math.sqrt (1 - sina*sina ) );	// compute new angle of robot
    this.updateRobot(newangle, dist)												// robot turns given angle moves distance
}
function updateRobot(newangle, speedfac) {	
		// calculate the new position of the robot if it has turned to the new angle, moved the given distance
var twopi = 2*Math.PI												// first enszure angpe in range 0..2PI
    while (newangle < 0) newangle = newangle + twopi;
    while (newangle > twopi) newangle = newangle - twopi;
	this.angle = newangle
var cosa = Math.cos(newangle)
	sina = Math.sin(newangle)
	this.checkMoveRobot(speedfac*cosa, speedfac*sina)				// compute actual movement
}
function checkMoveRobot(rdx, rdy) {
// attempt to move robot by this amount im x,y direction ... but dont go through objects/walls
	this.stuck = (distToEnvironment(this.robotx + rdx, this.roboty + rdy, this.robNum) <= this.robotsz)
											// stuck if too close to objec
	if (this.stuck == false) {
		this.robotx = this.robotx + rdx		// move robot if not stuck
		this.roboty = this.roboty + rdy
	}	

}
function isstuck () {
		// is robot stuck
  return this.stuck
}  
function turnRobot(angle, speed) {
		// turn robot by given angle at the given speed
	this.updateRobot(this.angle + angle, speed)
}
function checkForObject(speed) {
		// simple robot mover .. look for object on left/right
	this.setRotMat();														// set rotation
var seeLeft = this.detectObject (-this.robotsz*4, this.robotsz*4) < 100		// is there an object on the left
var seeRight = this.detectObject (this.robotsz*4, this.robotsz*4) < 100		// or on the right?
	if ( seeLeft ) this.turnRobot(-0.2, speed) 								// if left turn away
	else if (seeRight) this.turnRobot(0.2, speed)							// if right, turn other way
	else this.turnRobot(0, speed)											// else go forward
}
function checkOnCanvas (newWidth) {
	if (this.robotx + 10 > newWidth) 				// ensure robot not gone off side of window
		this.robotx = newWidth - 10;
}
function raceStartPos(goForward) {
	// put robot at start of race ... utilising raceTrack
	var elim = envLimits()
	if (goForward) {		// if doing return tace
		this.robotx = elim[0]/16									// start in red area facing to left
		this.roboty = elim[1]/6
		this.angle = 0
	}
	else {
		this.robotx = elim[0]*11/16									// start in green area facing right
		this.roboty = elim[1]/2
		this.angle = Math.PI
	}

}
} 

