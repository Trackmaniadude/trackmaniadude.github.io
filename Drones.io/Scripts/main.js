var centerOffsetX = 0, centerOffsetY = 0;
var xV = 0, yV = 0;
var tick = 0;
var shootDir = 22.5;
var userName = "An Unnamed Drone";
var health = 100;
var isPlaying = false;
var weapon = "Rapid";
var reload = 0, reload2 = [0,3];
var skin = 0;
var playerSkin = "Blue";
var onGround = false;
var Pclass = "General";
var autoFire = false;

var inChat = false

var arenaStatus = "open";

//Used with mobile controls.
var throttle = 0;
var throttleLimit = [50,window.innerHeight-50];

var inGame = false;

var objects = [];
var projectiles = [];
var particles = [];

var chat = [];

var devRot = [0,0,0];

var seed = Math.random()*1000;
var terrain = [];
for (var i=0; i<1; i+=0.005){
	terrain.push(Math.round(perlin.Noise(i*10,0.5,seed)*100)/100);
};

var playerX = Math.random()*10000, playerY = terrain[Math.round(playerX/50)]*2500, playerR = 0;
var camX = playerX, camY = playerY, camShake = 0, zoom = 1, azoom = zoom;

function clip(val,mn,mx){
	if(val<mn){return mn}else if(val>mx){return mx}else{return val};
};

function rand(mn,mx){
	return ((Math.random()-0.5)*(mx-mn)) + ((mx+mn)/2);
};

function randInt(mn,mx){
	return Math.round(((Math.random()-0.5)*(mx-mn)) + ((mx+mn)/2));
};

function getTerrainHeight(x) {
	return terrain[Math.round((x-25)/50)]*2500;
};

function startGame(){
	if (arenaStatus == "open") {
		timer.start("timeAlive");
		document.getElementById("rdt").style.visibility = "hidden";
		document.getElementById("ChangeLog").style.visibility = "hidden";
		xV=0;
		yV=0;
		playerX = 4500+(Math.random()*1000);
		playerY = getTerrainHeight(playerX);
		tick = 0;
		reload = 0;
		reload2 = [0,3];
		weapon = "Rapid";
		isPlaying = false;
		health = 100;
		autoFire = false;
		Pclass = document.getElementById("classInput").value;
		//Only start game loop if first time.
		if (inGame==false){
			setInterval(step,20);;
			inGame = true;
		}
		document.getElementById("BackDrop").style.visibility = "hidden";
		document.getElementById("Start BG").style.visibility = "hidden";
		document.getElementById("Start Screen").style.visibility = "hidden";
		userName = document.getElementById("nameInput").value;
		setCookie("name", userName, 365);
		setCookie("skin", skin-1, 365);
		setCookie("class", Pclass, 365);
		if (userName==undefined || userName==""){
			//Default nickname if none given.
			userName = "An Unnamed Drone";
		}
		//socket.send(userName + " has joined the game.")
	
		send(userName + " has joined the game!","#FFFF00");
	} else {
		alert("Arena Closed")
	};
};

function setDM(msg) {
	document.getElementById("Death Message").innerHTML = msg;
};

function endGame(){
	document.getElementById("Time Alive").innerHTML = "Time Alive: " + Math.round(timer.stop("timeAlive")/100)/10 + " seconds.";
    document.getElementById("ChangeLog").style.visibility = "visible";
    document.getElementById("rdt").style.visibility = "visible";
	health = 0;
	isPlaying = true;
	document.getElementById("Start BG").style.visibility = "visible";
	document.getElementById("Death Screen").style.visibility = "visible";
	
	if (arenaStatus=="closed") {
		document.getElementById("BackDrop").style.visibility = "visible";
	};
};

function endDeathScreen(){
	document.getElementById("Start Screen").style.visibility = "visible";
	document.getElementById("Death Screen").style.visibility = "hidden";
};

function changeSkin(){
	skin++;
	skin = skin%4;
	if (skin==0){
		playerSkin = "Blue";
		document.getElementById("Skin").src = "Images/Entities/Drone_Blue.png";
	} else if (skin==1){
		playerSkin = "Red";
		document.getElementById("Skin").src = "Images/Entities/Drone_Red.png";
	} else if (skin==2){
		playerSkin = "Yellow";
		document.getElementById("Skin").src = "Images/Entities/Drone_Yellow.png";
	} else if (skin==3){
		playerSkin = "Green";
		document.getElementById("Skin").src = "Images/Entities/Drone_Green.png";
	};
};

function step(){
	tick++;
	tick = tick%65536;
	if (isLoaded){
		zoom = (window.innerHeight/window.outerHeight);
		var tmpCX = camX, tmpCY = camY;
		camX += rand(-1*camShake,camShake);
		camY += rand(-1*camShake,camShake);
		renderStep();
		camX = tmpCX;
		camY = tmpCY;
		camShake/=1.1;
		handleObjects();
		handleProjectiles();
		handleParticles();
		if (isPlaying==false){
			if (reload>0){reload--};
			if (reload2[0]>0){reload2[0]--};
			//Run scripts for when playing.
			//Movement
			azoom = ((azoom-zoom)/1.2)+zoom;
			camX = ((camX-playerX)/1.2)+playerX;
			camY = ((camY-playerY)/1.2)+playerY;
			playerX+=xV;
			playerY+=yV;
			yV-=0.5;
			controls();
			//Regen
			if (health<100){health+=0.025};
			//Keep player within playing area.
			if (playerX<0){playerX=0};
			if (playerX>9999){playerX=9999};
			if (playerY<getTerrainHeight(playerX)){
				onGround = true;
				if(yV<-25){
					health+=(yV+25)*4;
					camShake=15;
					if (health<1) {
						send(userName + " crashed into the ground.","#00AAFF");
						num = Math.round(Math.random()*2);
						if (num == 0) {
							setDM("Did you forget how to fly?");
						} else if (num==1) {
							setDM("CRASH");
						} else {
							setDM("Oops. You might need to press the up key next time.");
						};
						for (var j=0;j<25;j++){
							makeParticle(-playerX,playerY,55,(Math.random()*6)-3,(Math.random()*6)-3,"Smoke",Math.random()*360,1);
						};
					};
				};
				playerY=getTerrainHeight(playerX);
				yV/=-5;
				xV/=2;
			} else {
				onGround = false;
			};
			if (playerY>4000){playerY=4000;yV=0};
			//End game when dead.
			if(health<1){endGame()};
		} else {
			//Run Scripts for after death.
			playerX+=xV;
			playerY+=yV;
		};
	};
};

function pointTo(x1,y1,x2,y2){
	return Math.atan2(y2-y1, x2-x1)*(180/Math.PI);
};

function handleObjects() {
	for(var i = 0;i < objects.length; i++){
		if (objects[i].type == "AC") {
			objects[i].ax = playerX;
			objects[i].ay = playerY;
			objects[i].reload--
			
			if (objects[i].reload == 0) {
				objects[i].reload = 20
				var shootDir = rad(180-pointTo(objects[i].x,objects[i].y,objects[i].ax,objects[i].ay));
				projectiles.push({
					x:(-objects[i].x)+Math.cos(shootDir)*64,
					y:(objects[i].y-32)+Math.sin(shootDir)*64,
					dir:0,
					time:1000,
					xv:Math.cos(shootDir)*10,
					yv:Math.sin(shootDir)*10,
					type:"AC"
				});
			};
		};
	};
};

function controls(){
	//Tilt Controls
	if (document.getElementById("controlStyle").value == "tilt") {
		var target = clip(devRot[1]/10,-1,1);
		xV+=target,-0.8,0.8;
		throttle = clip((devRot[2]+45)/10,0,1);
		yV+=throttle*1.2;
		if (onGround && throttle > 0.01) {
			playerY += 2;
			yV = 1;
		};
		playerR = ((target*5)/1.5)+target*5;
	};
	//Show chat if active
	if (document.activeElement.id=="chatInput"){
		document.getElementById("chatInput").style.opacity = 0.5;
	} else {
		document.getElementById("chatInput").style.opacity = 0;
	};

	//Game Keyboard Controls
	if (keysPressed[87] || keysPressed[38]){
		yV+=1.2;
		if (onGround) {
			playerY += 2;
			yV = 1;
		};
	};
	if (keysPressed[68] || keysPressed[39]){			
		xV+=0.8;
		playerR = ((playerR-15)/1.5)+15;		
	};
	if (keysPressed[65] || keysPressed[37]){
		xV-=0.8;
		playerR = ((playerR+15)/1.5)-15;
	};
	if (keysPressed[79]){
		health = 0;
		send(userName + " committed suicide.","#00AAFF");
		num = Math.round(Math.random()*2);
		if (num == 0) {
			setDM("You committed suicide. Why?");
		} else if (num==1) {
			setDM("You set your drone's parent property to null...");
		} else {
			setDM("Ded.");
		};
	};
	if (reload2[2] && keysPressed[16] && reload2[0]==0 && Pclass=="Speeder"){
		reload2[2] = false;
		reload2[1]--;
		if (reload2[1]==0) {
			reload2[1]=3;
			reload2[0] = 200;
		};
		var moveDir = rad(pointTo(mouseX,mouseY,centerOffsetX+playerX-camX,centerOffsetY-playerY+camY));
		playerX+=Math.cos(moveDir)*-50;
		playerY+=Math.sin(moveDir)*50;
		xV = Math.cos(moveDir)*-50;
		yV = Math.sin(moveDir)*20;
	};
	if (keysPressed[16]==false) {
		reload2[2] = true;
	};
	xV = xV/1.1;
	playerR = playerR/1.1;

	//Mouse Controls
	if (weapon=="Rapid" && (mouseDown || autoFire) && reload==0){
		var audio = new Audio('Sounds/Shoot.wav');
		audio.play();
			
		var shootDir = pointTo(mouseX,mouseY,centerOffsetX+playerX-camX,centerOffsetY-playerY+camY);
		projectiles.push({x:-playerX,y:playerY,dir:shootDir,time:100,xv:Math.cos(rad(shootDir))*10-xV,yv:yV+Math.sin(rad(shootDir))*10,type:"Rapid"});

		reload = 3;
	}
	if (weapon=="Missile" && (mouseDown || autoFire) && reload==0){
		var audio = new Audio('Sounds/Missile.mp3');
		audio.play();
			
		var shootDir = pointTo(mouseX,mouseY,centerOffsetX+playerX-camX,centerOffsetY-playerY+camY);
		projectiles.push({x:-playerX,y:playerY,dir:shootDir,time:200,xv:-xV,yv:-5+yV,type:"Missile"});

		reload = 100;
	}
	
	//Clip Y Velocity
	yV = clip(yV,-1000,10);
};

function swapWeapon(){
	if (weapon=="Rapid" && Pclass=="General"){
		weapon = "Missile";
	} else {
		weapon = "Rapid";
	};
};

function dist(x1,y1,x2,y2){
	return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
};

function handleProjectiles(){
	for(var i = 0;i < projectiles.length; i++){
		projectiles[i].x+=projectiles[i].xv;
		projectiles[i].y+=projectiles[i].yv;
		if (projectiles[i].y<terrain[-1*Math.ceil(projectiles[i].x/50)]*2500 && projectiles[i].type!="AC"){
			projectiles[i].time=0;
		}
		if (projectiles[i].type=="AC" && dist(-playerX,playerY,projectiles[i].x-32,projectiles[i].y+32)<20){
			health-=10;
			if (health<1) {
				setDM("You got closed!");
				send(userName + " was closed.","#00AAFF");
			}
		};
		if (projectiles[i].type=="Missile"){
			var tx = Math.cos(rad(projectiles[i].dir))*25;
			var ty = Math.sin(rad(projectiles[i].dir))*25;
			projectiles[i].xv = ((projectiles[i].xv-tx)/1.01)+tx;
			projectiles[i].yv = ((projectiles[i].yv-ty)/1.03)+ty;
			makeParticle(projectiles[i].x,projectiles[i].y,55,(Math.random()*2)-1,(Math.random()*2)-1,"Smoke",Math.random()*360,1);
		}
		if (projectiles[i].time > 0){
			projectiles[i].time--;
		} else {
			if (projectiles[i].type=="Missile"){
				//Explode Missiles
				for (var j=0;j<25;j++){
					makeParticle(projectiles[i].x,projectiles[i].y,55,(Math.random()*6)-3,(Math.random()*6)-3,"Smoke",Math.random()*360,1);
				};
				//BOOM!
				camShake = 500/dist(-1*camX,camY,projectiles[i].x,projectiles[i].y);
				var audio = new Audio('Sounds/Boom.wav');
				audio.volume = clip(1000/dist(-1*camX,camY,projectiles[i].x,projectiles[i].y),0,1);
				audio.play();
			} else if (projectiles[i].type=="Rapid"){
				//Little flash when these die.
				makeParticle(projectiles[i].x,projectiles[i].y,3,0,0,"Flash",0,1);
			};
			projectiles.splice(i,1);
		};
	};
};

function makeParticle(X,Y,Time,xV,yV,Type,rV,Drag){
	particles.push({x:X,y:Y,time:Time,xv:xV,yv:yV,type:Type,rv:rV,drag:Drag});
};

function handleParticles() {
	for(var i = 0;i < particles.length; i++){
		particles[i].rot+=particles[i].rv;
		particles[i].x+=particles[i].xv;
		particles[i].y+=particles[i].yv;
		particles[i].xv=particles[i].xv/1;
		particles[i].yv=particles[i].yv/1;
		if (particles[i].time > 0){
			particles[i].time--;
		} else {
			particles.splice(i,1);
		};
	};
};

var mouseX, mouseY, mouseDown;
var evt = window.event;

var isLoaded = false;

function handleOnLoad(){
	var last = new Date(document.lastModified);
	var now = new Date();
		
	if (last.getDate() == now.getDate() && last.getMonth() == now.getMonth() && last.getFullYear() == now.getFullYear()) {
		document.getElementById("newUpdate").style.color = "#33FF33";
	};
		
	isLoaded = true;
	var blueDrone = document.getElementById("Blue");
	document.getElementById("nameInput").focus();
	document.getElementById("nameInput").value = getCookie("name");
	skin = getCookie("skin");
	if (getCookie("class")!=""){
		document.getElementById("classInput").value = getCookie("class");
	}
	changeSkin();
	document.getElementById("newUpdate").innerHTML = document.getElementsByClassName("CLEntry")[0].innerHTML;
	document.getElementsByClassName("CLEntry")[0].style.boxShadow = "0 5px 0px 0 #333";
};

function handleClick(evt){
	
};	

var keysPressed = [];

function closeArena() {
	send("Arena Closed: No Players Can Join","FF0000");
	arenaStatus = "closed";
	for (var i=125;i<10000;i+=250) {
		objects.push({type:"AC",x:i,y:getTerrainHeight(i),ax:0,ay:0,reload:10});
	};
};

function sendMSG(){
	var msg = document.getElementById("chatInput").value;
	document.getElementById("chatInput").value = "";
	if (msg.charAt(0) != "/" || msg.length != 0) {
		send(userName + ": " + msg,"#FFFFFF");
	} else {
		if (msg == "/close") {
			closeArena();
		};
	};
};

function send(msg,color){
	chat.push({msg:msg,time:1000,color:color});
};

function handleKeyDown(evt){
	if (!inChat) {
		keysPressed[evt.keyCode] = true;
		if (evt.keyCode==81){
			swapWeapon();
		};
		if (evt.keyCode==13){
			document.getElementById("chatInput").style.visibility = "visible";
			document.getElementById("chatInput").focus();
			inChat = true
		};
		if (evt.keyCode==69){
			if (autoFire) {
				autoFire = false;
				send("Auto Fire disabled","#FFDD00");
			} else {
				autoFire = true;
				send("Auto Fire enabled","#00FF00");
			};
		};
	} else {
		if (evt.keyCode==13){
			document.getElementById("chatInput").style.visibility = "hidden";
			inChat = false
		};
	};
};	
function handleKeyUp(evt){
	if (!inChat) {
		keysPressed[evt.keyCode] = false;
		return evt.keyCode;
	}
};	
function handleMouseMove(evt){
	mouseX = evt.clientX;
	mouseY = evt.clientY;
};
function handleMouseDown(){
	mouseDown = true;
};
function handleMouseUp(){
	mouseDown = false;
};
	
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;
document.onmousemove = handleMouseMove;
document.onmousedown = handleMouseDown;
document.onmouseup = handleMouseUp;
	
function rad(deg){
	return deg * Math.PI / 180;
};

//Found some cookie functions on W3Schools
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

//Found a timer on StackOverflow
var timer = (function () {
  var startTimes = {}; // multiple start times will be stored here

  return {
    start: function (id) {
      id = id || 'default'; // set id = 'default' if no valid argument passed
      startTimes[id] = +new Date; // store the current time using the timer id
    },
    stop: function (id) {
      id = id || 'default';
      var diff = (+new Date - startTimes[id]); // get the difference
      delete startTimes[id]; // remove the stored start time
      return diff || undefined; // return the difference in milliseconds
    }
  };
}());

if(window.DeviceOrientationEvent){
	window.addEventListener("deviceorientation", orientation, false);
}else{
	console.log("DeviceOrientationEvent is not supported");
};

function orientation(event){
	devRot = [event.alpha,event.beta,event.gamma]
	console.log("Magnetometer: "
		+ event.alpha + ", "
		+ event.beta + ", "
		+ event.gamma
	);
};
