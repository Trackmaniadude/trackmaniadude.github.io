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
    jX = Math.min(Math.max(mX,-20),20);
    jY = Math.min(Math.max(mY,-20),20);
  } else {
    jX/=1.1;
    jY/=1.1;
  }
  document.getElementById("joystick").style.transform = "translate("+(jX-100)+"px,"+(jY-100)+"px)";
},50);
