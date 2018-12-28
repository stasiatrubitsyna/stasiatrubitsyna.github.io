// Functions which work with the Javascript robot simulations
// these allow keyboard input to work

// assumes that inBoxIds is an array of names of the input boxes whose strings define speeds
// and speeds is an array of the actual speeds

var keySpecial = 0				// this is used to store the value of any keyboard entry
var keySel = 999				// used for selecting a mouse/light
var checkSpeedLims = true		// if true then check that any integer entered is within range -40..40

function addKeySpecial() {		
// call this function to enable the page to listen for keyboard entry
    document.addEventListener('keydown', function(e) {				// define function for key strokes
      keySpecial = e.charCode || e.keyCode    						// it stores key entered in keySpecial
    }, false);
}

function checkBrowser()
// checks Browser is IE v8 or above, or another browser).
{
  var rv = -1; // Return value assumes ok.
  if (navigator.appName == 'Microsoft Internet Explorer')
  {
    var ua = navigator.userAgent;
    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat( RegExp.$1 );
	  if (rv >= 8.0) rv = -1			// IE vs 8 onwards ok
  }
  if (rv >= 0) alert ("You need a browser such as Firefox or Chrome, or a newish Internet Explorer, which supports a canvas")
}

function getSpeed (fitem) {
// return string from input box corresponding to fitem, the active element in a form
// first find the index
// inBoxIds is the array containing names of input boxes
var ndx = 0
var ibl = inBoxIds.length							// get number of strings in inBoxIds
	while (ndx<ibl && fitem.id != inBoxIds[ndx]) ndx++		// search for name fitem.id in inBoxIds
var ans = ""
    if (ndx<ibl) ans = speeds[ndx].toString()				// now find the string associated with the saved speed 
    return ans
}  

function notKeySpecial (ch) {
// checks to see if ch is not the character in KeySpecial
// used when focus on input box where numbers only wanted an user enters a special key
	uch = ch.toUpperCase()
	uks = String.fromCharCode(keySpecial).toUpperCase()
	return (uch != uks)
}


function checkStr (){
// this function deals with the fact that a user may have typed a letter to navigate 
// its aim is to remove that character from the input field
var fstr, nstr = ""
var pos
var ct
var fitem = document.activeElement						// find the current active element
	if (fitem.type == "text") {							// if focus is one of the left / right speed
		fstr = fitem.value    							//get its value
				// now scan and extract the character in keySpecial if it is there
		for (ct = 0; ct<fstr.length; ct++) {
			if (notKeySpecial(fstr.charAt(ct)) ) nstr = nstr.concat(fstr.charAt(ct))
		}	
		if (nstr.length==0) nstr = getSpeed(fitem)  // if string emptied, reload from speeds[n]
		fitem.value = nstr    					//	restore string without letters into inputBox
		fitem.blur()							// ensure inputBox is no longer in focus
	}
}
	
function deFocus() {
// determine any InputBox which is the current Focus, and then point away from it 
var fitem = document.activeElement
	if (fitem.type == "text") {				// if focussed on input box, move away
		fitem.blur()
	}
}

function focusOn (ndx) {
	// set the input focus to be the input box with name in inBoxIds[ndx]
	checkStr()										// first tidy current string
	document.getElementById(inBoxIds[ndx]).focus()	// now focus on element with id inBoxIds[ndx]
}

function robotKeyMove(theRobot, dx, dy) {
// move the robot by dx and dy scaled by a factor
    checkStr()
var fac = 20					// scaling factor
	theRobot.robotDraw(false)							// erase robot from screen
	theRobot.checkMoveRobot(dx*fac, dy*fac)				// try to move robot by set amount
	redrawEnvironment (theRobot.ctx)					// redraw environment behind it
	theRobot.robotDraw(true)							// draw robot in new position
}

function keyRobotMove (dx, dy) {
//move selected robot/light in x,y direction...
var fac = 20
	if (keySel == 999) {							// if only one robot, in variable called robot .. move it
		robotKeyMove(robot, dx, dy)
	}	
	else if (keySel >= 100) {						// if one of the lights has been selected
		lights[keySel-100].lightDraw(false)			// erase from screen
		lights[keySel-100].lightx += dx*fac			// move to new position
		lights[keySel-100].lighty += dy*fac
		lights[keySel-100].lightDraw(true)			// draw there
	}
	else if (keySel >= 0) {							//  one of the robots has been selected
		robotKeyMove(robots[keySel], dx, dy)		// so move it
	}
}
 

function checkInt (str, defndx) {
// parse the string str. If valid, then put answer in speeds[ndx] else return value in speeds[ndx]
var ans = parseInt (str)									// try to turn string to integer equivalent
	if (isNaN(ans))  ans = speeds[defndx]					// if invalid number
	else   {												// have valid number .. is it in range
		if (checkSpeedLims) {								// if there are limits to check
			if (ans > 40) {									// if > 40
				ans = 40									// set to 40
				document.getElementById(inBoxIds[defndx]).value = "40"		// and change input Box
			}	
			else if (ans<-40) {								// similarly check if too negative..
				ans =-40
				document.getElementById(inBoxIds[defndx]).value = "-40"
			}	
		}	
		speeds[defndx] = ans								// store answer in array of speeds
	}														// so have valid speed when not valid string entered
	return ans
}

function checkStrings() {
// look through the all the input fields and update the speeds array accordingly
var dummy
   for (var ct=0; ct<inBoxIds.length; ct++) dummy = checkInt(document.getElementById(inBoxIds[ct]).value, ct)
}	

function checkKeyRest() {
	// checks if keySpecial is IJKM to move robot, then if A..z remove keySpecial from focus
	switch (keySpecial)  {
		case 74 :	//   J = left					// these four move the robot Left/Right/Up/Down
		case 106 :
					keyRobotMove(-1, 0)
					break
		case 73 : 
		case 105 :		// I=Up
					keyRobotMove(0, -1)
					break	
		case 77 :     // M = Dn
		case 109 :
					keyRobotMove(0, 1)
					break
		case 75 :     // K = Right
		case 107 :
					keyRobotMove(1, 0)
					break
		default :	if (keySpecial >= 65 && keySpecial <= 123) checkStr()
	}
}


