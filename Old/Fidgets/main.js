var mX = 0
var mY = 0
var mD = false
function showCoords(event) {
  mX = event.clientX;
  mY = event.clientY;
}
function Down() {
  mD = true;
}
function Up() {
  mD = false;
}

//Joystick
var jX = 0
var jY = 0
var jH = false

function joyOver() {
  jH = true;
}
function joyOut() {
  jH = false;
}

var joyStick = setInterval(function(){
  if (mD && jH) {
    jX = Math.min(Math.max(mX-380,-15),15);
    jY = Math.min(Math.max(mY-110,-15),15);
  } else {
    jX/=1.3;
    jY/=1.3;
  }
  document.getElementById("joystick").style.transform = "translate("+jX+"px,"+(jY-15)+"px)";
},50);

//Switch
var state = false

function toggleSwitch() {
  state = !state
  if (state) {
    document.getElementById("s1").style.top = "50%";
	document.getElementById("s1").style.backgroundColor = "#FF9900";
	document.getElementById("s2").style.backgroundColor = "#CC6600";
	document.getElementById("s2").style.top = "-12px";
	document.getElementById("s2").style.height = "calc(12px + 50%)";
	
	document.getElementById("switchL1-1").style.backgroundColor = "#00CC00";
	document.getElementById("switchL1-2").style.backgroundColor = "#33FF33";
	document.getElementById("switchL2-1").style.backgroundColor = "#770000";
	document.getElementById("switchL2-2").style.backgroundColor = "#CC0000";
  } else {
    document.getElementById("s1").style.top = "calc(-12px + 50%)";
	document.getElementById("s1").style.backgroundColor = "#CC6600";
	document.getElementById("s2").style.backgroundColor = "#FF9900";
	document.getElementById("s2").style.top = "0%";
	document.getElementById("s2").style.height = "50%";
	
	document.getElementById("switchL1-1").style.backgroundColor = "#004400";
	document.getElementById("switchL1-2").style.backgroundColor = "#008800";
	document.getElementById("switchL2-1").style.backgroundColor = "#CC0000";
	document.getElementById("switchL2-2").style.backgroundColor = "#FF3333";
  }
}
