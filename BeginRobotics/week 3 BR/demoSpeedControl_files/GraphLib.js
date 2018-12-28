// RJMs file for graphs .. concept is that an area within a canvas is defined for graph

var defColours = ["blue", "red"]

function log10 (x) {
//  return Math.log(x)/Math.LN10
  return Math.log(x)/2.302585092994046
}

function scalevar (val, imax, imin, omax, omin, islin) {
	// function to scale a value val, between imin..imax to value omin..omax
	// if islin then is linear scale, else is loh
var ans
  if ( val > imax ) {
      val = imax;
  }
  else if ( val < imin ) {
	   val = imin;
  } 	
  if (islin) ans = (val-imin)*(omax-omin)/(imax-imin)
  else  ans = log10(val/imin)*(omax-omin)/log10(imax/imin)
  return ans + omin
}

function myjsGraph (canvas, x, y, w, h, xlin, ylin, cbackcol, fontstr) {
// graph on given canvas, at position x% y%, with width and height w,h
// xlin, ylin are true if scale is linear not logarithmic 
// cbackcol is colour of background, fontstr is string and size used for labels
this.ctx = canvas.getContext("2d");
this.cw = canvas.width / 100;
this.ch = canvas.height / 100;
this.xmin = 0
this.xmax = 1
this.ymin = 0
this.ymax = 1
this.xsmin = this.cw*x
this.xsmax = this.cw*(x+w)
this.ysmax = this.ch*y
this.ysmin = this.ch*(y+h)
this.xlinear = xlin
this.ylinear = ylin
this.drawuntil = 0
this.canvasbackcol = cbackcol
this.ctx.font = fontstr
this.labelx=labelx;					// function to draw box
this.clearAndTitle=clearAndTitle
this.goplotdata=goplotdata
this.setymaxymin=setymaxymin
this.checkymaxymin=checkymaxymin
this.doytick=doytick
this.doxtick=doxtick
this.plottworesponse=plottworesponse
this.putdot=putdot
this.showAngle=showAngle
this.plotPoints=plotPoints

function labelx (lstr) {
 this.ctx.fillStyle = "black"
 this.ctx.textBaseline="top"
 this.ctx.fillText (lstr, this.cw*80, this.ysmin+15)
}

function clearAndTitle (titlenum, titleden) {
	if (this.canvasbackcol!="black") {
		this.ctx.fillStyle = this.canvasbackcol
		this.ctx.fillRect (0, 0, this.cw*100, this.ch*100)
	}
	
	this.ctx.fillStyle = "black"
	this.ctx.lineWidth = 2;
	showaoverb (this.ctx, titlenum, titleden, 50*this.cw, 10*this.ch)
	this.ctx.beginPath();
	this.ctx.strokeStyle = "rgb(128,128,128)"; 
	this.ctx.rect(this.xsmin, this.ysmax, this.xsmax-this.xsmin, this.ysmin-this.ysmax);
	this.ctx.stroke();
}

function goplotdata (col, x, y) {
var penup = true;
var xmaxshow = (this.drawuntil > 0) ? this.drawuntil : x[x.length-1]
var xp, yp
	this.ctx.beginPath();
	this.ctx.strokeStyle=col
	for (var ct=0; ct<x.length; ct++) {
		if (x[ct] <= xmaxshow  || this.drawuntil == 0 ) {
			xp = scalevar(x[ct], this.xmax, this.xmin, this.xsmax-5, this.xsmin+5, this.xlinear);
			yp = scalevar(y[ct], this.ymax, this.ymin, this.ysmax+5, this.ysmin-5, this.ylinear);
			( penup ) ? this.ctx.moveTo(xp, yp) : this.ctx.lineTo(xp, yp);
			penup = false
		}
	}
	this.ctx.stroke()	
}

function putdot (col, x, y) {
var xp = scalevar(x, this.xmax, this.xmin, this.xsmax-5, this.xsmin+5, this.xlinear);
var yp = scalevar(y, this.ymax, this.ymin, this.ysmax+5, this.ysmin-5, this.ylinear);
	this.ctx.beginPath();
	this.ctx.fillStyle = col 
	this.ctx.arc(xp, yp, 4, 2*Math.PI, false);
	this.ctx.fill();
}

function showAngle (col, x, y) {
var xp = scalevar(0, this.xmax, this.xmin, this.xsmax-5, this.xsmin+5, this.xlinear);
var yp = scalevar(0, this.ymax, this.ymin, this.ysmax+5, this.ysmin-5, this.ylinear);
	this.ctx.beginPath();
	this.ctx.arc(xp, yp, 20, 0, Math.atan2(-y, x), y>0);
	this.ctx.stroke();
}

function checkymaxymin (data) {
	for (var ct=1; ct<data.length; ct++) {
		if (data[ct] > this.ymax ) {
			this.ymax = data[ct]
		}
		else if (data[ct] < this.ymin) {
			this.ymin = data[ct]
		}
	}
}

function setymaxymin (data) {
	this.ymax = data[0];
	this.ymin = data[0];
	this.checkymaxymin (data)
	if (this.ymax == this.ymin) this.ymax = this.ymax + 0.1
}

function doytick (y) {
	this.ctx.strokeStyle = "rgb(128,128,128)"; 
	var ysc = scalevar(y, this.ymax, this.ymin, this.ysmax+5, this.ysmin-5, this.ylinear)
	this.ctx.beginPath();
	this.ctx.moveTo(this.xsmin, ysc);
	this.ctx.lineTo(this.xsmin+3, ysc);
	this.ctx.stroke()
	this.ctx.textAlign = "right"
	this.ctx.textBaseline="middle"
	var ystr = (y == 0) ? "0" : y.toFixed(2)
	this.ctx.fillText (ystr, this.xsmin-5, ysc)
}

function doxtick (x) {
	var xsc = scalevar(x, this.xmax, this.xmin, this.xsmax-5, this.xsmin+5, this.xlinear)
	this.ctx.beginPath();
	this.ctx.moveTo(xsc, this.ysmin);
	this.ctx.lineTo(xsc, this.ysmin-3);
	this.ctx.stroke()
	this.ctx.textAlign = "center"
	this.ctx.textBaseline="top"
	var xstr = (x == 0) ? "0" : (x<1) ? x.toFixed(2) : x.toPrecision(1+Math.round(log10(x)))
	this.ctx.fillText (xstr, xsc, this.ysmin+5)
}

function plottworesponse (t, act, sim, addthy, tlab, ylab, titlenum, titleden, xlabel) {
// plot two graphs into canvas of given name, graphs occupying rectangle base x,y, width.height w,h
// nb x,y,w,h are %s.
// graphs are t vs act and t vs sim - t,sim always plotted, t,act plotted if addthy is true
// max t and sim are labelled, and labelled ticks are given (if not 0), at value tlab and ylab
// title at top of graph is titlenum/titleden central, but is just titleden if titlenum is empty

	this.clearAndTitle(titlenum, titleden)
	this.labelx(xlabel)

	this.xmin = t[0]
	this.xmax = t[t.length-1]
	this.setymaxymin(sim)
	if (addthy) this.checkymaxymin(act)
	
	if (addthy) this.goplotdata ( defColours[1],  t, act)
	this.goplotdata (defColours[0], t, sim)

	this.ctx.fillStyle = "black"

	this.doytick(this.ymax)
	this.doytick(this.ymin)
	if (ylab > 0) this.doytick(ylab*this.ymax)

	this.doxtick (this.xmin)
	this.doxtick (this.xmax)
	if ( tlab > 0 && tlab>this.xmin && tlab < this.xmax ) this.doxtick (tlab)
}

function plotPoints (x, y, xr, yr, asPolar, xlab, ylab, titlenum, titleden) {
	this.clearAndTitle(titlenum, titleden)

	this.xmin = -xr
	this.xmax = xr
	this.ymin = -yr
	this.ymax = yr
	
	this.goplotdata("black", [0, 0], [-yr, yr])
	this.goplotdata("black", [-xr, xr], [0, 0])

	for (var ct=0; ct<x.length; ct++) {
		if (asPolar) {
			this.showAngle("blue", x[ct], y[ct])
			this.goplotdata("red", [0, x[ct]], [0, y[ct]])
		}
		else		
			this.goplotdata("blue", [0, x[ct], x[ct]], [0, 0, y[ct]])
			this.putdot("red", x[ct], y[ct])
	}

	this.doytick(this.ymax)
	this.doytick(this.ymin)
	if (ylab > 0) this.doytick(ylab*this.ymax)

	this.doxtick (this.xmin)
	this.doxtick (this.xmax)
	if ( xlab > 0 && xlab>this.xmin && xlab < this.xmax ) this.doxtick (xlab)
}

}


