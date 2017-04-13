var mX = 0
var mY = 0
function showCoords(event) {
    mX = event.clientX;
    mY = event.clientY;
}

//Joystick
var jX = 0
var jY = 0
var jD = false

function joyDown() {
  jD = true;
}
function joyUp() {
  jD = false;
}

setInterval(function(){
  if (jD) {
    document.getElementById("joystick").style.transform = "translate("+jX+"px,"+jY+"px)";
  }
},50);
