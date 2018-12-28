// Library file for drawing ERIC models - in 2D or 3D

// (c) Professor Richard Mitchell 2015

 var canvasback = "rgb(233, 234, 232)"
 var canvasbackdarker = "rgb(200, 201, 199)"
 var canvasbacklighter = "rgb(249, 250, 248)"

 var wheelColour = "rgb(128, 128, 128)"
 var rimColour = "rgb(100, 100, 100)"
 
 var motorCols = ["rgb(170, 170, 110)", "rgb(140, 140, 80)", "rgb(190, 190, 130)"]
 
 var batteryCols = ["rgb(64, 64, 64)", "rgb(16, 16, 16)", "rgb(80, 80, 80)"]
 
 var boardCols = ["rgb(0, 192, 0)", "rgb(0, 128, 0)", "rgb(0, 220, 0)"]
 

function clearCanvas(ctx, cw, ch, cols, ch2) {
// clear the canvas.
// if cols has one colour, just fill with that colour
// if three colours, then do gradient down to ch2 using cols[0,1], and gradient below

	if (cols.length==1) {
		ctx.fillStyle = canvasback;
		ctx.fillRect(0, 0, cw*100, ch*100)
	}
	else {
		var my_gradienttop=ctx.createLinearGradient(0,0,0,ch2);
		my_gradienttop.addColorStop(0,cols[0]);
		my_gradienttop.addColorStop(1,cols[1]);	
		ctx.fillStyle = my_gradienttop
		ctx.fillRect(0, 0, cw*100, ch2);
		var my_gradientbot=ctx.createLinearGradient(0,ch2,0,ch*100);
		my_gradientbot.addColorStop(0,cols[0]);	
		my_gradientbot.addColorStop(1,cols[2]);
		ctx.fillStyle = my_gradientbot
		ctx.fillRect(0, ch2, cw*100, ch*100);
	}
}

function putPoints (ctx, data, isfill) {
// data is array of x,y points ... to be drawn on canvas ctx
// fill shape defined if isfill, else justdraw	
	ctx.beginPath()											// start Path
	for (ct=0; ct<data.length; ct+=2) {						// for each x,y pair
		if (ct==0) ctx.moveTo(data[ct], data[ct+1])			// moveTo first pair
		else ctx.lineTo(data[ct], data[ct+1])				// draw lineTo others
	}
	if (isfill) ctx.fill()									// then fill or stroke
	else ctx.stroke()
}

function drawSpoke (ctx, xo, yo, rad, efac, viewAngle) {
// draw spoke of wheel centred at xo,yo, y radius rad, xrad rad*efac; spoke at viewAngle angle
		// do so by calculating end points of line
	putPoints (ctx, [xo+rad*efac*Math.cos(viewAngle), yo+rad*Math.sin(viewAngle), xo-rad*efac*Math.cos(viewAngle), yo-rad*Math.sin(viewAngle)], false)
}

function cossin(org, rad, ang, iscos) {
	// ang is angle in degrees, return org + rad * sin/cos (ang)
var rang = ang * Math.PI/180									// compute angle in radians
var csang = (iscos) ? Math.cos(rang) : Math.sin(rang)			// calc cos/sin
	return Math.round(org + rad * csang)						// calc org + rad * this as Integer
}	

function noteang(ang, sang, eang) {
	// is ang at end of range sang..eang    (but check if range increase/decreases
	if (sang<eang) return ang<=eang
	else return ang>=eang
}	

function halfEllipse (xo, yo, xrad, yrad, sang, eang, dang) {
	// calculate points on ellipse of origin xo,yo, radii rad*efac, rad from sang to eang by dang 
var points = []														// empty result
	for (ang = sang; noteang(ang, sang, eang); ang += dang) {		// for all intermediate angles
		points[points.length] = cossin(xo, xrad, ang, true)		// calc x value
		points[points.length] = cossin(yo, yrad, ang, false)			// and y value
	}
	return points
}
	
function halfEllipseRim (ctx, xo1, xo2, yo, orad, irad, efac, sang, eang) {
var orimpoints = halfEllipse (xo1, yo, orad*efac, orad, sang, eang, 5) 
var irimpoints = halfEllipse (xo2, yo, irad*efac, irad, eang, sang, -5) 
	putPoints(ctx, orimpoints.concat(irimpoints), true)
}

function drawRim3D (ctx, orad, irad, efac, xpos, ypos, xpos2, spokeangle) {
// draw Rim of wheel	
var angs = [90, 270, 270, 450]
	ctx.fillStyle = rimColour
	halfEllipseRim(ctx, xpos, xpos2, ypos, irad, irad, efac, angs[0], angs[1])
//	halfEllipseRim(ctx, xpos, xpos2, ypos, orad, orad, efac, angs[2], angs[3])
	ctx.fillStyle = wheelColour
	halfEllipseRim(ctx, xpos, xpos, ypos, orad, irad, efac, 90, 270)
	halfEllipseRim(ctx, xpos, xpos, ypos, orad, irad, efac, 270, 450)

	ctx.strokeStyle = wheelColour
	ctx.lineWidth = 5

	for (act = 0; act < 1.9*Math.PI; act+=Math.PI/5)
		drawSpoke (ctx, (xpos+xpos2)/2, ypos, irad, efac, spokeangle+act)

	ctx.fillStyle = rimColour
	halfEllipseRim(ctx, xpos, xpos2, ypos, orad, orad, efac, angs[2], angs[3])
}

function drawAWheel (ctx, cw, ch, motorData, viewAngle, posTest, angle, in2D) {
	var xoff
	var worg = getVert (motorData[0], motorData[1], 0, motorData[5]+8*ch, motorData[4]+2*ch, 0, (posTest) ? 4 : 5, viewAngle, 0)
						// [0],[1] are xo,yo; [5] is depth of motor - wheel bit bigger; [4] is width of motor
	if (viewAngle != 0) {
		var efac = Math.sin(viewAngle*Math.PI/180)
		if (in2D) xoff = 0 
		else xoff = (viewAngle>0) ?  10 - 6*efac : -10 - 6*efac

		var orad = (worg[3]-worg[1])/2
		drawRim3D(ctx, orad, orad*0.9, efac, worg[0]-xoff/2, (worg[1]+worg[3])/2, worg[0]+xoff/2, angle) 		
	}	
	else {
		ctx.fillStyle = rimColour
		xoff = ((posTest)? -1 : 1)
		worg[4] = worg[2] + 5*ch*xoff
		worg[5] = worg[3]
		worg[6] = worg[4]
		worg[7] = worg[1]
		worg[0] = worg[0] + xoff
		worg[2] = worg[0]
		putPoints(ctx, worg, true)
	}
}

function getXYZ (xo, yo, xs, ys, zs, ndx, viewAngle, boardAngle) {
var angs = [-135, -45, 45, 135, -90, 90]
var zfac = (angs[ndx]>=-90 && angs[ndx]<=90) ? 1 : -1
var xm = xs * ( (angs[ndx]<=0) ? -1 : 1)
var y = ys * Math.cos(boardAngle) - zs*zfac*Math.sin(boardAngle)
var zm = ys * Math.sin(boardAngle) + zs*zfac*Math.cos(boardAngle)

 var vARad = viewAngle*Math.PI/180
 var x = xm*Math.cos(vARad) + zm*Math.sin(vARad)
 var z = -xm*Math.sin(vARad) + zm*Math.cos(vARad)
 
var xdepth = 1 + 0.1*z/xs		// was zs
var zdepth = 1 + 0.1*z/xs
	return [xo + x*xdepth, yo - y*zdepth ]
}

function getVert (xo, yo, yoff, vh, xs, zs, ndx, viewAngle, boardAngle) {
var point1 = getXYZ(xo, yo, xs, yoff+vh, zs, ndx, viewAngle, boardAngle)
var point2 = getXYZ(xo, yo, xs, yoff-vh, zs, ndx, viewAngle, boardAngle)
   return point1.concat(point2)
}

function getPlane(pData, ndx1, ndx2, viewAngle, boardAngle) { 
var plane1 = getVert(pData[0], pData[1], pData[2], pData[3], pData[4], pData[5], ndx1, viewAngle, boardAngle)
var plane2 = getVert(pData[0], pData[1], pData[2], -pData[3], pData[4], pData[5], ndx2, viewAngle, boardAngle)
return plane1.concat(plane2)
}

function getXYZHoriz (pData, viewAngle, boardAngle, ndx, istop) {
var tfac = (istop) ? 1 : -1
	return getXYZ(pData[0], pData[1], pData[4], pData[2]+tfac*pData[3], pData[5], ndx, viewAngle, boardAngle)
} 	

function topPlane(ctx, planeData, col, viewAngle, boardAngle, istop) {
var point1 = getXYZHoriz(planeData, viewAngle, boardAngle, 0, istop)
var point2 = getXYZHoriz(planeData, viewAngle, boardAngle, 1, istop)
var point3 = getXYZHoriz(planeData, viewAngle, boardAngle, 2, istop)
var point4 = getXYZHoriz(planeData, viewAngle, boardAngle, 3, istop)
	ctx.fillStyle = col
	putPoints(ctx, point1.concat(point2, point3, point4), true)
}
	
function sidePlane (ctx, planeData, col, viewAngle, boardAngle, forMain) {
var points = []
	if (forMain) points = getPlane (planeData, 1, 2, viewAngle, boardAngle)
	else if (viewAngle>0) points = getPlane (planeData, 0, 1, viewAngle, boardAngle)
	else points = getPlane (planeData, 2, 3, viewAngle, boardAngle)
	ctx.fillStyle = col
	putPoints(ctx, points, true)
}	

function drawItem(ctx, iData, icols, viewAngle, boardAngle) {
	if (viewAngle != 0) sidePlane(ctx, iData, icols[0], viewAngle, boardAngle, false)
	if (viewAngle>-90 && viewAngle <90) {
		sidePlane(ctx, iData, icols[1], viewAngle, boardAngle, true)
		if (boardAngle != 0) topPlane(ctx, iData, icols[2], viewAngle, boardAngle, boardAngle>0)
	}	
}
	
function drawEric(ctx, cw, ch, xo, yo, viewAngle, boardAngle, spokes, mode) {
// drawEric in window ctx where cw/ch are % of width/height
// draw at position xo,yo, where ERIC is rotated at angle viewAngle; boards at boardAngle
// spokes = angles of [left, right] wheels for 3D or the wheel in 2D
// mode is 	0 if in 3D; 			
// 			1 if 2D and drawing right wheel in front of body. 	
// 			2 if 2D and drawing left wheel behind the body
var motorData = [xo, yo, 0, 19*ch/2, 26*ch, 20*ch]				// coords of motor
var batteryData = [xo, yo, -15*ch, 6*ch, 18*ch, 18*ch] 		// and battery
var boardData = [xo, yo, 10*ch, 1*ch, 16*ch, 16*ch]		// and board

var points = []
var sndx = (viewAngle<=0) ? 0 : 1		// wheel at back is left if viewAngle <=0

	if (mode==0) drawAWheel (ctx, cw, ch, motorData, viewAngle, viewAngle<=0, spokes[sndx], false)
	else if (mode == 2) drawAWheel (ctx, cw, ch, motorData, 90, true, spokes, true)

	if (boardAngle==0) {
		drawItem (ctx, batteryData, batteryCols, viewAngle, boardAngle)
		drawItem (ctx, boardData, boardCols, viewAngle, boardAngle)
		drawItem (ctx, motorData, motorCols, viewAngle, boardAngle)
	}	
	else if (boardAngle<0) {
		drawItem (ctx, boardData, boardCols, viewAngle, boardAngle)
		drawItem (ctx, motorData, motorCols, viewAngle, boardAngle)
		drawItem (ctx, batteryData, batteryCols, viewAngle, boardAngle)
	}	
	else {
		drawItem (ctx, batteryData, batteryCols, viewAngle, boardAngle)
		drawItem (ctx, motorData, motorCols, viewAngle, boardAngle)
		drawItem (ctx, boardData, boardCols, viewAngle, boardAngle)
	}
	
	if (mode == 0) drawAWheel (ctx, cw, ch, motorData, viewAngle, viewAngle>0, spokes[1-sndx], false)
	else if (mode == 1)  drawAWheel (ctx, cw, ch, motorData, -90, false, spokes, true)	
}
	

	
