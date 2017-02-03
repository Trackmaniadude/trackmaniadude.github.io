var centerOffsetX = 0, centerOffsetY = 0
var xV = 0, yV = 0
var tick = 0
var shootDir = 22.5
var userName = "An Unnamed Drone"
var health = 100
var isPlaying = false
var weapon = "Rapid"
var reload = 0
var skin = 0
var playerSkin = "Blue"
var onGround = false

var inGame = false

var projectiles = []
var particles = []

var chat = []

var seed = Math.random()*1000
var terrain = []
for (var i=0; i<1; i+=0.005){
	terrain.push(Math.round(perlin.Noise(i*10,0.5,seed)*100)/100)
}

var playerX = 4500+(Math.random()*1000), playerY = terrain[Math.round(playerX/50)]*2500, playerR = 0
var camX = playerX, camY = playerY, camShake = 0, zoom = 1, azoom = zoom

setInterval(runStartScreen,20)

function clip(val,mn,mx){
	if(val<mn){return mn}else if(val>mx){return mx}else{return val}
}

function rand(mn,mx){
	return ((Math.random()-0.5)*(mx-mn)) + ((mx+mn)/2)
}

function randInt(mn,mx){
	return Math.round(((Math.random()-0.5)*(mx-mn)) + ((mx+mn)/2))
}

function startGame(){
    document.getElementById("rdt").style.visibility = "hidden"
    document.getElementById("ChangeLog").style.visibility = "hidden"
	xV=0
	yV=0
	playerX = 4500+(Math.random()*1000)
	playerY = terrain[Math.round(playerX/50)]*2500
	tick = 0
	var reload = 0
	weapon = "Rapid"
	isPlaying = false
	health = 100
	//Only start game loop if first time.
	if (inGame==false){
		setInterval(step,20);
		inGame = true
	}
	document.getElementById("BackDrop").style.visibility = "hidden"
	document.getElementById("Start BG").style.visibility = "hidden"
	document.getElementById("Start Screen").style.visibility = "hidden"
	userName = document.getElementById("nameInput").value
	if (userName==undefined || userName==""){
		//Default nickname if none given.
		userName = "An Unnamed Drone"
	}
	//socket.send(userName + " has joined the game.")

	send(userName + " has joined the game!","#FFFF00")
}

function endGame(){
    document.getElementById("ChangeLog").style.visibility = "visible"
    document.getElementById("rdt").style.visibility = "visible"
	health = 0
	isPlaying = true
	document.getElementById("Start BG").style.visibility = "visible"
	document.getElementById("Start Screen").style.visibility = "visible"
}

function runStartScreen(){
	tick++
	tick = tick%65536
	document.getElementById("logo").style.top = "calc(50% - " + ((Math.sin(rad(tick))*25)+350) + "px)"
}

function changeSkin(){
	skin++
	skin = skin%4
	if (skin==0){
		playerSkin = "Blue"
		document.getElementById("Skin").src = "Images/Entities/Drone_Blue.png"
	} else if (skin==1){
		playerSkin = "Red"
		document.getElementById("Skin").src = "Images/Entities/Drone_Red.png"
	} else if (skin==2){
		playerSkin = "Yellow"
		document.getElementById("Skin").src = "Images/Entities/Drone_Yellow.png"
	} else if (skin==3){
		playerSkin = "Green"
		document.getElementById("Skin").src = "Images/Entities/Drone_Green.png"
	}
}

function step(){
	tick++
	tick = tick%65536
	if (isLoaded){
		zoom = (window.innerHeight/window.outerHeight)
		var tmpCX = camX, tmpCY = camY
		camX += rand(-1*camShake,camShake)
		camY += rand(-1*camShake,camShake)
		renderStep()
		camX = tmpCX
		camY = tmpCY
		camShake/=1.1
		handleProjectiles()
		handleParticles()
		if (isPlaying==false){
			if (reload>0){
				reload--
			}
			//Run scripts for when playing.
			//Movement
			azoom = ((azoom-zoom)/1.2)+zoom
			camX = ((camX-playerX)/1.2)+playerX
			camY = ((camY-playerY)/1.2)+playerY
			playerX+=xV
			playerY+=yV
			yV-=0.5
			controls()
			//Regen
			if (health<100){health+=0.025}
			//Keep player within playing area.
			if (playerX<0){playerX=0}
			if (playerX>9999){playerX=9999}
			if (playerY<terrain[Math.floor(playerX/50)]*2500){
				onGround = true
				if(yV<-25){
					health+=(yV+25)*4
					camShake=15
					for (var j=0;j<25;j++){
						makeParticle(playerX,playerY,55,(Math.random()*6)-3,(Math.random()*6)-3,"Smoke",Math.random()*360,1)
					}
				}
				playerY=terrain[Math.floor(playerX/50)]*2500
				yV/=-5
				xV/=2
			} else {
				onGround = false
			}
			if (playerY>4000){playerY=4000;yV=0}
			//End game when dead.
			if(health<1){endGame()}
		} else {
			//Run Scripts for after death.
			playerX+=xV
			playerY+=yV
		}
	}
};

function pointTo(x1,y1,x2,y2){
	return Math.atan2(y2-y1, x2-x1)*(180/Math.PI)
}

function controls(){
	//Show chat if active
	if (document.activeElement.id=="chatInput"){
		document.getElementById("chatInput").style.opacity = 0.5
	} else {
		document.getElementById("chatInput").style.opacity = 0
	}

	//Game Keyboard Controls
	if ((keysPressed[87] || keysPressed[38]) && yV<10){
		yV+=1.2
		if onGround {
			playerY += 2
			yV = 1
		}
	}
	if (keysPressed[68] || keysPressed[39]){			
		xV+=0.8
		playerR = ((playerR-15)/1.5)+15		}
	if (keysPressed[65] || keysPressed[37]){
		xV-=0.8
		playerR = ((playerR+15)/1.5)-15
	}
	xV = xV/1.1
	playerR = playerR/1.1

	//Mouse Controls
	if (weapon=="Rapid" && mouseDown && reload==0){
		var audio = new Audio('Sounds/Shoot.wav');
		audio.play();
			
		var shootDir = pointTo(mouseX,mouseY,centerOffsetX+playerX-camX,centerOffsetY-playerY+camY)
		projectiles.push({x:-playerX,y:playerY,dir:shootDir,time:100,xv:Math.cos(rad(shootDir))*10-xV,yv:yV+Math.sin(rad(shootDir))*10,type:"Rapid"})

		reload = 3
		}
	if (weapon=="Missile" && mouseDown && reload==0){
		var audio = new Audio('Sounds/Missile.mp3');
		audio.play();
			
		var shootDir = pointTo(mouseX,mouseY,centerOffsetX+playerX-camX,centerOffsetY-playerY+camY)
		projectiles.push({x:-playerX,y:playerY,dir:shootDir,time:200,xv:-xV,yv:-5+yV,type:"Missile"})

		reload = 100
		}
}

function swapWeapon(){
	if (weapon=="Rapid"){
		weapon = "Missile"
	} else {
		weapon = "Rapid"
	}
}

function dist(x1,y1,x2,y2){
	return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2))
}

function handleProjectiles(){
	for(var i = 0;i < projectiles.length; i++){
		projectiles[i].x+=projectiles[i].xv
		projectiles[i].y+=projectiles[i].yv
		if (projectiles[i].y<terrain[-1*Math.ceil(projectiles[i].x/50)]*2500){
			projectiles[i].time=0
		}
		if (projectiles[i].type=="Missile"){
			var tx = Math.cos(rad(projectiles[i].dir))*25
			var ty = Math.sin(rad(projectiles[i].dir))*25
			projectiles[i].xv = ((projectiles[i].xv-tx)/1.01)+tx
			projectiles[i].yv = ((projectiles[i].yv-ty)/1.03)+ty
			makeParticle(projectiles[i].x,projectiles[i].y,55,(Math.random()*2)-1,(Math.random()*2)-1,"Smoke",Math.random()*360,1)
		}
		if (projectiles[i].time > 0){
			projectiles[i].time--
		} else {
			if (projectiles[i].type=="Missile"){
				//Explode Missiles
				for (var j=0;j<25;j++){
					makeParticle(projectiles[i].x,projectiles[i].y,55,(Math.random()*6)-3,(Math.random()*6)-3,"Smoke",Math.random()*360,1)
				}
				//BOOM!
				camShake = 500/dist(-1*camX,camY,projectiles[i].x,projectiles[i].y)
				var audio = new Audio('Sounds/Boom.wav');
				audio.volume = clip(1000/dist(-1*camX,camY,projectiles[i].x,projectiles[i].y),0,1)
				audio.play();
			} else if (projectiles[i].type=="Rapid"){
				//Little flash when these die.
				makeParticle(projectiles[i].x,projectiles[i].y,3,0,0,"Flash",0,1)
			}
			projectiles.splice(i,1)
		}
	}
}

function makeParticle(X,Y,Time,xV,yV,Type,rV,Drag){
	particles.push({x:X,y:Y,time:Time,xv:xV,yv:yV,type:Type,rv:rV,drag:Drag})
}

function handleParticles() {
	for(var i = 0;i < particles.length; i++){
		particles[i].rot+=particles[i].rv
		particles[i].x+=particles[i].xv
		particles[i].y+=particles[i].yv
		particles[i].xv=particles[i].xv/1
		particles[i].yv=particles[i].yv/1
		if (particles[i].time > 0){
			particles[i].time--
		} else {
			particles.splice(i,1)
		}
	}
}

var mouseX, mouseY, mouseDown;
var evt = window.event;

var isLoaded = false;

function handleOnLoad(){
	isLoaded = true;
	var blueDrone = document.getElementById("Blue");
	document.getElementById("nameInput").focus()
};

function handleClick(evt){
	
};	

var keysPressed = [];

function sendMSG(){
	var msg = document.getElementById("chatInput").value
	document.getElementById("chatInput").value = ""
	send(userName + ": " + msg,"#FFFFFF")
}

function send(msg,color){
	chat.push({msg:msg,time:1000,color:color})
}

function handleKeyDown(evt){
	keysPressed[evt.keyCode] = true;
	if (evt.keyCode==69 || evt.keyCode==16){
		swapWeapon()
	}
	if (evt.keyCode==13){
		document.getElementById("chatInput").style.visibility = "visible"
		document.getElementById("chatInput").focus();
	}
};	
function handleKeyUp(evt){
	keysPressed[evt.keyCode] = false;
	return evt.keyCode
};	
function handleMouseMove(evt){
	mouseX = evt.clientX;
	mouseY = evt.clientY;
};
function handleMouseDown(){
	mouseDown = true
};
function handleMouseUp(){
	mouseDown = false
};
	
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;
document.onmousemove = handleMouseMove;
document.onmousedown = handleMouseDown;
document.onmouseup = handleMouseUp;
	
function rad(deg){
	return deg * Math.PI / 180
}
