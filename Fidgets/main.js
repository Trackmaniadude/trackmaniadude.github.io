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
  jX = mX;
  jY = mY;
  if (mD && jH) {
    document.getElementById("joystick").style.transform = "translate("+(jX-100)+"px,"+(jY-100)+"px)";
  }
},50);
