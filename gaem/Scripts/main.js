var vector2 = []
vector2.new = function(x,y) {
	var v3 = [];
	v3.X = x;
	v3.Y = y;
	return v3;
}

var time = 0;
var timer = setInterval(function() {
	time+=0.1;
},1000/10);

var running = false;

var gameSteps = 0;
var dist = 0;
var speed = 0;
var rotation = 0;
var rotationv = 0;
var playerAlive = true;

var steer = 0;

var keysPressed = [];

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var canvasSize = vector2.new(canvas.width,canvas.height);

function handleKeyDown(evt){
	keysPressed[evt.keyCode] = true;
};	

function handleKeyUp(evt){
	keysPressed[evt.keyCode] = false;
	return evt.keyCode;
};	

document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

engineLoop = new Audio('Sounds/shipEngine.wav');
engineLoop.volume = 0;
engineLoop.play();
window.setInterval(function(){
	engineLoop.currentTime = 0;
	engineLoop.play();
},2267);

//Song :P
var musicTimer = undefined;
var musicLoop = undefined;
var song = undefined;
function startMusic() {
	engineLoop.volume = 0.1;
	song = new Audio('Sounds/songStart.wav');
	song.volume = 1;
	song.play();
	musicTimer = window.setTimeout(function(){
		musicLoop = window.setInterval(function(){
			song = new Audio('Sounds/songLoop.wav');
			song.play();
		},18622);
	},23278-18622);
}
function stopMusic() {
	engineLoop.volume = 0;
	song.pause();
	song.volume = 0;
	song.currentTime = 0;
	clearInterval(musicLoop);
	clearTimeout(musicTimer);
}

//Perlin Function: perlin.Noise(x,y,z)

//Useful Functions
function round(v,m) {
	return Math.floor((v/m)+0.5)*m;
}
function random(min,max) {
	return (Math.random()*(max-min))+min;
}
dist = random(0,65536)
function rad(angle) {
	return angle*(Math.PI/180);
}
function lerp(v0,v1,t,exp) {
	t=Math.pow(t,exp)
	return (1 - t) * v0 + t * v1;
}
function getShipPosition() {
	var airOffset = (air/85)*(canvasSize.Y/5);
	var r = center.Y-12+(Math.sin(rad(gameSteps*5))*2)-airOffset;
	console.log(r);
	var p = vector2.new(Math.sin(rad(rotation))*-r,Math.cos(rad(rotation))*r);
	return [vector2.new(center.X+p.X,center.Y+p.Y),vector2.new(Math.sin(rad(rotation)),Math.cos(rad(rotation)))];
}

var center = vector2.new(canvasSize.X/2,canvasSize.Y/2);
var offset = vector2.new(0,0)

var textures = []
textures.Exhaust = document.getElementById("shipExhaust");
textures.ShipLeft = document.getElementById("shipLeft");
textures.ShipStraight = document.getElementById("shipStraight");
textures.ShipRight = document.getElementById("shipRight");
textures.Shadow = document.getElementById("shipShadow");
textures.ShipFly1 = document.getElementById("shipFly1");
textures.ShipFly2 = document.getElementById("shipFly2");

var currentObstacle = [1,0,1,0,1,0,1,0]

function rgb(r,g,b) {
	return "rgb("+r+","+g+","+b+")"
}
function bw(v) {
	v = Math.max(v,1)
	return rgb(v,v,v)
}

var air = 0;
var airv = 0;

var particles = [];
function newParticle(type,image,x,y) {
	var p = [];
	p.Age = 0;
	p.Type = type;
	p.Image = image;
	p.X = x;
	p.Y = y;
	particles.push(p);
}

function handleParticles() {
	for (i=0;i<particles.length;i++) {
		if (particles[i]!=undefined) {
			particles[i].Age++;
			if (particles[i].Type == "Exhaust") {
				particles[i].X=((particles[i].X-center.X)*random(1.01,1.05))+center.X;
				particles[i].Y=((particles[i].Y-center.Y)*random(1.01,1.05))+center.Y;
			}
			if (particles[i].Age>60) {
				particles.splice(i,1)
			}
		}
	}
}

function renderParticles() {
	for (i=0;i<particles.length;i++) {
		if (particles[i]!=undefined) {
			if (particles[i].Type == "Exhaust") {
				ctx.drawImage(particles[i].Image,particles[i].X,particles[i].Y);
			}
		}
	}
}

//Some render functions
function renderPlayer() {
	var airOffset = (air/85)*(canvasSize.Y/5);
	if (playerAlive) {
		ctx.setTransform(1,0,0,1,0,0);
		ctx.translate(center.X,center.Y);
		ctx.rotate(rad(rotation));
		ctx.translate(-center.X,-center.Y);
		ctx.globalAlpha = Math.max(0,((Math.sin(rad(gameSteps*5))+1)/4)+0.25-(air/100));
		ctx.drawImage(textures.Shadow,center.X-16,canvasSize.Y-32,32,32);
		ctx.globalAlpha = 1;
		if (air>35) {
			if (air>70) {
				ctx.drawImage(textures.ShipFly2,center.X-16,canvasSize.Y-34+(Math.sin(rad(gameSteps*5))*2)-airOffset,32,32);
			} else {
				ctx.drawImage(textures.ShipFly1,center.X-16,canvasSize.Y-34+(Math.sin(rad(gameSteps*5))*2)-airOffset,32,32);				
			}
		} else {
			if (steer==1) {
				ctx.drawImage(textures.ShipLeft,center.X-16,canvasSize.Y-34+(Math.sin(rad(gameSteps*5))*2)-airOffset,32,32);
			} else if (steer==-1) {
				ctx.drawImage(textures.ShipRight,center.X-16,canvasSize.Y-34+(Math.sin(rad(gameSteps*5))*2)-airOffset,32,32);
			} else {
				ctx.drawImage(textures.ShipStraight,center.X-16,canvasSize.Y-34+(Math.sin(rad(gameSteps*5))*2)-airOffset,32,32);
			}
		}
		ctx.setTransform(1,0,0,1,0,0);
	}
}

//Main Code
function hoverSound() {
	var sound = new Audio('Sounds/hover.wav');
	sound.volume = 0.5;
	sound.play();
}
var obChanged = false;
var testCollision = false;
var distDead = 0;
var timeAtDeath = 0;
var obOpen = false;
function renderStep(){
	if (running){
		//Edit canvas resolution in case of resize.
		canvas.width  = window.innerWidth/2;
		canvas.height = window.innerHeight/2;
		canvasSize.X = canvas.width;
		canvasSize.Y = canvas.height;
		center = vector2.new(canvasSize.X/2,canvasSize.Y/2);
		//Draw Tunnel
		ctx.fillStyle="#000";
		ctx.fillRect(0,0,canvasSize.X,canvasSize.Y);
		var offset = vector2.new((perlin.Noise(dist/66,0.25,0.25)-0.5)*1250,(perlin.Noise(0.25,0.25,dist/66)-0.5)*1250);
		var steps = 5;
		
		var oPos = (dist%3)+1;
				
		for (i=0;i<steps;i+=(1/3)) {
			var d = i+(dist%1);
			var fac = Math.pow(2,d*2);
			if (round(oPos,(1/3))==round(d,(1/3))) {
				ctx.fillStyle=bw(Math.floor(lerp(0,88,oPos/steps,1)));	
				ctx.strokeStyle=bw(Math.floor(lerp(0,66,d/steps,1)));	
				ctx.lineWidth=fac/25;		
				ctx.lineJoin = "round";				
				for (j=0;j<8;j++) {
					if (currentObstacle[j]==1) {
						ctx.beginPath();
						var a = j + 1
						if (obOpen) {
							ctx.arc(lerp(center.X-offset.X,center.X,oPos/steps,1/4),lerp(center.Y-offset.Y,center.Y,oPos/steps,1/4),fac,rad(a*45),rad((a+1)*45));
							ctx.arc(lerp(center.X-offset.X,center.X,oPos/steps,1/4),lerp(center.Y-offset.Y,center.Y,oPos/steps,1/4),fac/1.333,rad((a+1)*45),rad(a*45),true);
							ctx.arc(lerp(center.X-offset.X,center.X,oPos/steps,1/4),lerp(center.Y-offset.Y,center.Y,oPos/steps,1/4),fac,rad(a*45),rad((a+1)*45));
						} else {
							ctx.arc(lerp(center.X-offset.X,center.X,oPos/steps,1/4),lerp(center.Y-offset.Y,center.Y,oPos/steps,1/4),fac,rad(a*45),rad((a+1)*45));
							ctx.lineTo(lerp(center.X-offset.X,center.X,oPos/steps,1/4),lerp(center.Y-offset.Y,center.Y,oPos/steps,1/4));
							ctx.arc(lerp(center.X-offset.X,center.X,oPos/steps,1/4),lerp(center.Y-offset.Y,center.Y,oPos/steps,1/4),fac,rad(a*45),rad((a+1)*45));
						}
						ctx.fill();
						ctx.stroke();
					}
				}
			}
			ctx.strokeStyle=bw(Math.floor(lerp(0,66,d/steps,1)));
			ctx.lineWidth=fac/25;
			ctx.fillStyle=bw(Math.floor(lerp(0,127,d/steps,1)));
			ctx.beginPath();
			ctx.arc(lerp(center.X-offset.X,center.X,d/steps,1/4),lerp(center.Y-offset.Y,center.Y,d/steps,1/4),fac,0,rad(360));
			ctx.rect(canvasSize.X,0,-canvasSize.X,canvasSize.Y)
			ctx.fill();
			ctx.beginPath();
			ctx.arc(lerp(center.X-offset.X,center.X,d/steps,1/4),lerp(center.Y-offset.Y,center.Y,d/steps,1/4),fac,0,rad(360));
			ctx.stroke();
		}
		//Render Obstacle
		
		if (Math.floor(oPos+0.35)>=4) {
			renderPlayer();
			if (!(testCollision)&&playerAlive) {
				testCollision = true;
				var playerPos = Math.ceil(rotation/45);
				if (playerPos==8) {
					playerPos=0;
				}
				if (currentObstacle[playerPos]==1 && !(air>0 && obOpen)) {
					playerAlive = false;
					timeAtDeath = time;
					stopMusic();
					var sound = new Audio('Sounds/shipExplosion.wav');
					sound.volume = 1;
					sound.play();
				}
			}
		}
		if (Math.floor(oPos)==1) {
			if (!(obChanged)) {
				currentObstacle = [
					round(random(0,1),1),
					round(random(0,1),1),
					round(random(0,1),1),
					round(random(0,1),1),
					round(random(0,1),1),
					round(random(0,1),1),
					round(random(0,1),1),
					round(random(0,1),1)
				];
				function getClosed() {
					var p = 0;
					for (i=0;i<7;i++) {
						if (currentObstacle[i]==1) {
							p++;
						}
					}
					return p;
				}
				obOpen = getClosed()>4;
				obChanged = true;
			}
		} else {
			obChanged = false;
		}
		
		if (Math.floor(oPos+0.35)<4) {
			renderPlayer();
			testCollision = false;
		}
		
		renderParticles();
	}
};

function smooth(v) {
	return ((-Math.cos(rad(v*180)))+1)/2;
}

var reversing = false;
function runStep() {
	if (running) {
		gameSteps++;
		handleParticles()
		if (playerAlive) {
			var pp = getShipPosition()[0];
			var po = getShipPosition()[1];
			pp.X+=(po.Y)*-5;
			pp.Y+=(po.X)*-5;
			newParticle("Exhaust",textures.Exhaust,pp.X,pp.Y);
			pp.X+=(po.Y)*6;
			pp.Y+=(po.X)*6;
			newParticle("Exhaust",textures.Exhaust,pp.X,pp.Y);
			document.getElementById("timer").innerHTML = Math.trunc(time*10)/10;
			if (keysPressed[65] || keysPressed[37]) {
				rotationv+=1;
				steer = 1;
			} else if (keysPressed[68] || keysPressed[39]) {
				rotationv-=1;
				steer = -1;
			} else {
				steer = 0;
			}
			if ((keysPressed[32]||keysPressed[87]||keysPressed[38]) && air==0) {
				airv = 12.5;
				air = 1;
				var sound = new Audio('Sounds/jump.wav');
				sound.volume = 1;
				sound.play();
			}
			if (air>0) {
				air+=airv;
				airv-=1;
				airv=Math.max(airv,-4);
			} else {
				air = 0;
				airv = 0;
			}
			rotation+=rotationv;
			if (rotation>360) {
				rotation-=360;
			}
			if (rotation<0) {
				rotation+=360;
			}
			rotationv/=1.25;
			if (speed < 1) {
				speed+=0.01;
			} else if (speed < 1.5) {
				speed = speed+=0.0005;
			}
		} else {
			if (speed>0.1) {
				speed/=1.2;
				gameSteps = 0;
				reversing = false;
			} else {
				if (!(reversing)) {
					distDead = dist;
				}
				speed = 0;
				reversing = true;
				dist = lerp(distDead,distDead-1.5,smooth(Math.min(gameSteps,60)/60),1);
				if (gameSteps>70) {
					document.getElementById("Game Screen").style.visibility = "visible";
					document.getElementById("score").innerHTML = "TIME : "+Math.trunc(timeAtDeath*10)/10+" SECONDS"
					document.getElementById("timer").style.visibility = "hidden";
					running = false;
				}
			}
		}
		dist=dist+(speed/20);
		renderStep();
	}
}

var gameTimer = setInterval(runStep,1000/30);

function startGame() {
	//Get game ready and run.
	time = 0;
	speed = 0;
	rotation = 0;
	rotationv = 0;
	playerAlive = true;
	document.getElementById("Start Screen").style.visibility = "hidden";
	document.getElementById("Game Screen").style.visibility = "hidden";
	document.getElementById("timer").style.visibility = "visible";
	startMusic();
	air = 0;
	airv = 0;
	var sound = new Audio('Sounds/start.wav');
	sound.volume = 1;
	sound.play();
	running = true;
}