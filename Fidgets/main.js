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
