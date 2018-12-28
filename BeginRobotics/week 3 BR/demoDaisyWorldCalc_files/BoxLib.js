
//  ****** Start of Code for handling Boxes for block diagrams

var boxdrawcol = "black"
var boxfillcol = "rgb(220, 220, 220)"
var boxtextcol = "black"

function setboxdrawcol (col){
  boxdrawcol = (col == -1) ? "black" : col
}

function setboxfillcol (col){
  boxfillcol = (col == -1) ? "rgb(220, 220, 220)" : col
}

function setboxtextcol (col){
  boxtextcol = (col == -1) ? "black" : col
}

function setboxcols (drawcol, fillcol, textcol) {
	setboxdrawcol (drawcol)
	setboxfillcol (fillcol)
	setboxtextcol (textcol)
}

function reportString (canvasName, bstr) {
// report string bstr in middle of canvas of given name
var canvas = document.getElementById(canvasName);
var ctx=canvas.getContext("2d");
    ctx.fillStyle = canvasback;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = boxtextcol
//	ctx.font = '12pt Calibri';
	drawText(ctx, bstr, "center", "middle", canvas.width/2, canvas.height/2)
 }
 

function promptforval (promptName, blockName, currval) {
// Prompt the user to enter the gain of the appropriate component
var cstring = currval.toString();
var newval = prompt("Enter "+promptName+" of " +blockName, cstring)
if (newval!=null) {
  currval = parseFloat(newval);
}
return currval;
}

function showaoverb (ctx, numstr, denstr, x, y) {
// on canvas with given context show centralised at position x, y numstr/denstr
// if numstr is empty, just give denstr
var numwidth = ctx.measureText(numstr).width;
var denwidth = ctx.measureText(denstr).width;
var xw = (numwidth > denwidth) ? numwidth/2 : denwidth/2
var strheight = ctx.measureText(denstr).height
var blw = ctx.textBaseline
var lww = ctx.lineWidth;
ctx.lineWidth = 1
ctx.textAlign="center";
if (numstr.length > 0) {
	ctx.beginPath();
	ctx.moveTo (x-xw, y)
	ctx.lineTo (x+xw, y);
	ctx.stroke()
	ctx.textBaseline="bottom"
	ctx.fillText(numstr, x, y-3)
	ctx.textBaseline="top"
	ctx.fillText(denstr, x, y+3)
}
else {
    ctx.textBaseline="middle"
	ctx.fillText(denstr, x, y)
}	
ctx.textBaseline=blw
ctx.lineWidth = lww
}

function sorjw (iss) {
	return (iss) ? "s" : "j"+"\u03A9".toLowerCase()
}
	

function abox (x, y, w, h, blockName, initval, ctx)
// defines a box and its inherent transfer function.
// When clicked on, it will prompt user to enter value for the gain.
{
this.xbase = x;					// store coordinates of middle of box
this.ybase = y;
this.width = w;					// and its size
this.height = h;
this.blockName = blockName;		// and its name
this.boxType = 0;
this.isRecip = false;
this.val = initval;
this.ctx = ctx;					// context (of canva) into which draw box
this.changed = false;
this.draw=draw;					// function to draw box
this.getVal=getVal;				// to return value
this.checkMouse=checkMouse;		// to check if mouse clicked inside box
this.checkChanged=checkChanged;	// to report if value has changed
//this.draw("black");				// draw object
function checkChanged() {
   return this.changed;
}
function checkMouse(mx, my) {	// if mx,my within box, ask user to enter box's gain
	var dx = Math.abs(mx-this.xbase);
	var dy = Math.abs(my-this.ybase);
	var pn = (this.isRecip) ? "value" : "gain";
	this.changed = ( dx<this.width/2 && dy<this.height/2 ) ;	// changed if mx,my in box 
	if (this.boxType >= 0) {
		if (this.changed) {
	      if (this.boxType < 4) this.val = promptforval(pn, this.blockName, this.val);	// ask for new gain
		  else this.val = 1 - this.val				// switch toggles
		  this.draw("black");									// redraw showing new gain
	    }
	}	
}
function getVal() {				// return value of gain
   return this.val;
}
function draw (col) {
    var ylabbase = this.ybase;
	var nstr = (this.isRecip) ? "1" : "";
	var bname = blockName.charAt(0)
	if (blockName.length>1)
      if (blockName.charAt(1) >= "0" && blockName.charAt(1)<="9") bname = bname + blockName.charAt(1)
	var dstr = ( isNaN(this.val) ) ? this.blockName : bname+" = "+this.val.toFixed(2)
	
	this.ctx.fillStyle="rgb(220, 220, 220)";
	this.ctx.fillRect(this.xbase-this.width/2, this.ybase-this.height/2, this.width, this.height)
	this.ctx.fillStyle=col;
	this.ctx.textAlign="center";
	this.ctx.textBaseline="middle"; 

	this.ctx.beginPath();
    this.ctx.strokeStyle = col;
	this.ctx.rect(this.xbase-this.width/2, this.ybase-this.height/2, this.width, this.height);
	this.ctx.lineWidth=2;
	if (this.boxType == 1) {		/// limit
	    var ybase = this.ybase+this.height*0.23;
		var ys = this.height*0.2;
		this.ctx.moveTo (this.xbase-ys*1.5, ybase);
		this.ctx.lineTo (this.xbase+ys*1.5, ybase);
		this.ctx.moveTo (this.xbase, ybase-ys);
		this.ctx.lineTo (this.xbase, ybase+ys);
		this.ctx.moveTo (this.xbase-ys*1.5, ybase+ys)
		this.ctx.lineTo (this.xbase-ys, ybase+ys)
		this.ctx.lineTo (this.xbase+ys, ybase-ys)
		this.ctx.lineTo (this.xbase+1.5*ys, ybase-ys)
	    ylabbase = this.ybase-this.height*0.25
	}
	else if (this.boxType == 2)	{	// integral
	   if (this.blockName.charAt(0) == "d") dstr = "\u222B"
	   else {
	      nstr = "1"
		  dstr =  sorjw(this.blockName.charAt(0) == "s") 
		}  
	}
	else if (this.boxType == 3)	{	// differentiator
	   if (this.blockName.charAt(0) == "d") {
	       nstr = "d"
		   dstr = "dt"
		}
	   else dstr = sorjw (this.blockName.charAt(0) == "s")
	}
	else if (this.boxType == 4) {   // switch
	    if (this.val == 1) {
			this.ctx.moveTo (this.xbase-this.width/3, this.ybase);
			this.ctx.lineTo (this.xbase+this.width/3, this.ybase);
		}
		else {
			this.ctx.moveTo (this.xbase-this.width/3, this.ybase);
			this.ctx.lineTo (this.xbase-this.width/6, this.ybase)
			this.ctx.moveTo (this.xbase-this.width/8, this.ybase-this.height/4);
			this.ctx.lineTo (this.xbase+this.width/6, this.ybase);
			this.ctx.lineTo (this.xbase+this.width/3, this.ybase);
		}
	}
	else if (this.boxType == 5) {   // blocName is abc/def print as abc over def
		nstr = ""
		dstr = ""
		var addToNum = true
		for (var ct = 0; ct < this.blockName.length; ct++) {
			if (this.blockName.charAt(ct) == "/") addToNum = false
			else if (addToNum) nstr = nstr + this.blockName.charAt(ct)
			else dstr = dstr + this.blockName.charAt(ct)
		}
	}
	this.ctx.stroke();
	if (this.boxType < 4 || this.boxType == 5) showaoverb(this.ctx, nstr, dstr, this.xbase, ylabbase)
}

}

// **** End of Box Code

// Now Code for drawing Shapes

	function drawText (ctx, str, halign, valign, x, y) {
		ctx.textAlign=halign
		ctx.textBaseline=valign
		ctx.fillText(str, x, y)
	}

	function drawFilledRect (ctx, x, y, w, h) {
		ctx.fillStyle="rgb(220, 220, 220)";
		ctx.fillRect(x - w/2, y - h/2, w, h)
		ctx.fillStyle=boxfillcol;
		ctx.beginPath();
		ctx.strokeStyle = boxdrawcol
		ctx.rect(x - w/2, y - h/2, w, h)
		ctx.lineWidth=2;
		ctx.stroke()
	}


	function MultiLabeledBox (ctx, xcurr, ycurr, h, lnum, lden, eqstr, rnum, rden) {
	// draw onto context ctx a box, centred on xcurr, ycurr with height h
	// label it as lnum/lden eqstr rnum/rden
	var strwidth = Math.max(ctx.measureText(lnum).width, ctx.measureText(lden).width) + ctx.measureText(eqstr).width+ Math.max(ctx.measureText(rnum).width, ctx.measureText(rden).width)
		drawFilledRect(ctx, xcurr + strwidth*0.7, ycurr, strwidth*1.4, h)
		ctx.textAlign="center";
		ctx.fillStyle="black"
		doShowEqn (ctx, xcurr + strwidth/7 + 0.5*ctx.measureText(lnum).width, ycurr, lnum, lden, eqstr, rnum, rden)
		return xcurr + strwidth*1.4
	}	

	function LabeledBox (ctx, xcurr, ycurr, h, bstr) {
	// draw onto context ctx a box, centred on xcurr, ycurr with height h
	// label it with string bstr
	var strwidth = ctx.measureText(bstr).width
		drawFilledRect(ctx, xcurr + strwidth*0.7, ycurr, strwidth*1.4, h)
		ctx.fillStyle="black"
		drawText(ctx, bstr, "center", "middle", xcurr + strwidth*0.7, ycurr)
		return xcurr + strwidth*1.4
	}	

	function drawLines (ctx, points) {
	var penup = true
	var ct = 0
        ctx.beginPath()
		while ( ct < points.length ) {
			(penup) ? ctx.moveTo(points[ct], points[ct+1]) : ctx.lineTo(points[ct], points[ct+1])
			penup = false
			ct = ct + 2
		}	
		ctx.stroke()
	}
	
	function arrowstr (ctx, x, y, ax, dirn, alabstr) {
		drawArrow (ctx, x, y, x+ax*dirn, y)		// draw arrow of width ax
		if (alabstr.length > 0) drawText(ctx, alabstr, "center", "bottom", x + dirn*ax/2, y - 13)
		return x + ax*dirn				// move x base
	}
	
    function boxarrow (ctx, x, y, ax, box, dirn, alabstr) {
		// draw box, then arrow of size ax, and label arrow if alabstr not empty
	box.xbase = x + dirn*box.width / 2		// set box middle position
	box.ybase = y
	box.draw(boxdrawcol)			// draw it
	return arrowstr (ctx, x + dirn*(box.width), y, ax, dirn, alabstr)			// return position after box
    }
	
    function sumarrow (ctx, x, y, ax, sx, sumstr, mlabstr, alabstr) {
	drawSumJunc(ctx, x + sx, y, sx, sumstr);// draw summing junction
	var asign = (sumstr[2]>" ") ? -1 : 1
	drawArrow (ctx, x+sx, y+2*sx*asign, x+sx, y+sx*asign)
	if (mlabstr.length > 0) drawText(ctx, mlabstr, "right", "bottom", x+sx/2, y+sx*3*asign/2)
	return arrowstr (ctx, x + sx + sx, y, ax, 1, alabstr)			// draw arrow after summer: return position after arrow
    }
	
    function drawfbloop (ctx, xs, ys, xe, ye, yb) {
		// draw feedback connection from xs,ys to xs,yb, xe,yb, xe, ye
	ctx.strokeStyle = boxdrawcol
	drawLine (ctx, xs, ys, xs, yb)
	drawLine (ctx, xs, yb, xe, yb)
	drawArrow (ctx, xe, yb, xe, ye)
    }

    function draw2boxfbloop (ctx, xs, ys, xe, ye, yb, as, box1, box2, dobox2) {
		// draw feedback connection from xs,ys to xs,yb, xe,yb, xe, ye
	var xp = xs
	ctx.strokeStyle = boxdrawcol
	drawLine (ctx, xs, ys, xs, yb)
	xp = arrowbox (ctx, xs, yb, as, box1, -1)
	if (dobox2) xp = arrowbox (ctx, xp, yb, as, box2, -1)
	drawLine (ctx, xp, yb, xe, yb)
	drawArrow (ctx, xe, yb, xe, ye)
    }

    function arrowbox (ctx, x, y, ax, box, dirn) {
		// draw arrow of size ax, then box
	drawArrow (ctx, x, y, x+ax*dirn, y)		// draw arrow of width ax
	x = x + ax*dirn				// move x base
	box.xbase = x + dirn*box.width / 2		// set box middle position
	box.ybase = y
	box.draw(boxdrawcol)			// draw it
	return x + dirn*(box.width)			// return position after box
    }
	
    function arrowsum (ctx, x, y, ax, sx, sumstr) {
	drawArrow (ctx, x, y, x+ax, y)		// draw arrow of width ax
	x = x + ax				// move x base
	drawSumJunc(ctx, x + sx, y, sx, sumstr);// draw summing junction
	return x + sx + sx			// return position after summer
    }
	

    function drawSumJunc(ctx, x,y,rad, labstr) {
        ctx.beginPath()
        ctx.arc(x,y,rad,2*Math.PI,false)
        ctx.moveTo(x-rad*0.707,y-rad*0.707)
        ctx.lineTo(x+rad*0.707,y+rad*0.707)
        ctx.moveTo(x+rad*0.707,y-rad*0.707)
        ctx.lineTo(x-rad*0.707,y+rad*0.707)
        ctx.strokeStyle = boxdrawcol
		ctx.fillStyle = boxfillcol
		ctx.fill();
        ctx.stroke()
		drawPlusMinus(ctx, labstr, 0, x-rad*0.5, y);
		drawPlusMinus(ctx, labstr, 1, x, y+rad/2);
    	drawPlusMinus(ctx, labstr, 2, x, y-rad/2);
    }

	function drawPlusMinus(ctx, labstr, pos, x, y) {
	var pmsize = 5
		if (labstr.charAt(pos) > ' ') 
		{
			drawLine(ctx, x-pmsize, y, x+pmsize, y)
			if (labstr.charAt(pos) == '+') 
			{
				drawLine(ctx, x, y-pmsize, x, y+pmsize)
			}
		}	
	}

	function drawLine (ctx, x1, y1, x2, y2) {
	    ctx.beginPath()
    	ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke()
	}

	function drawArrow (ctx, x1, y1, x2, y2) {
	    var headlen = 10;   // length of head in pixels
		var angle = Math.atan2(y2-y1,x2-x1);
    	ctx.beginPath()
   		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
       	ctx.strokeStyle = boxdrawcol;
		ctx.fillStyle = boxdrawcol;
		ctx.stroke()

    	ctx.beginPath()
		ctx.moveTo(x2, y2);
		ctx.lineTo(x2-headlen*Math.cos(angle-Math.PI/6),y2-headlen*Math.sin(angle-Math.PI/6));
		ctx.lineTo(x2-headlen*Math.cos(angle+Math.PI/6),y2-headlen*Math.sin(angle+Math.PI/6));
		ctx.closePath();
		ctx.fill()
	}

// End of Drawing Code


// Code for showing equation
function sizenumorden (ctx, num, den) {
var numwidth = ctx.measureText(num).width;
var denwidth = ctx.measureText(den).width;
	return (numwidth > denwidth) ? numwidth : denwidth
}

function doShowEqn (ctx, xpos, ypos, lnum, lden, eqstr, rnum, rden) {
    showaoverb(ctx, lnum, lden, xpos, ypos);

	xpos = xpos + 0.5*ctx.measureText(eqstr).width + 0.5 *  sizenumorden (ctx, lnum, lden)   // ( (numwidth > denwidth) ? numwidth : denwidth )
    ctx.textBaseline="middle"
    ctx.fillText(eqstr, xpos, ypos)

	xpos = xpos + 0.5*ctx.measureText(eqstr).width + 0.5 * sizenumorden (ctx, rnum, rden) // ( (numwidth > denwidth) ? numwidth : denwidth )

    showaoverb(ctx, rnum, rden, xpos, ypos);

}

function multiShowText (ctx, xpos, ypos, tstr) {
	if (tstr.length >  0) {
		ctx.textBaseline="middle"
		ctx.textAlign="left";
		ctx.fillText(tstr, xpos, ypos)
		xpos = xpos + ctx.measureText(tstr).width
	}
	return xpos
}

function multiShowEqn (ctx, xpos, ypos, eqstr, num, den) {
// if eqstr specified, put that first
// then show, as part of multiple equations num/den, starting at xpos,ypos, 
// return new xpos
xpos = multiShowText(ctx, xpos, ypos, eqstr)
var halfwidth = 0.5 * sizenumorden(ctx, num, den)
	xpos = xpos + halfwidth
    showaoverb(ctx, num, den, xpos, ypos);
	return xpos + halfwidth
}

//

