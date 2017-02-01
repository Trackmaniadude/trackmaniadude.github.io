var can = document.getElementById("canvas");
var ctx = can.getContext('2d');
ctx.font="bold 20px Ubuntu";

function renderStep(){
	if (isLoaded){
		//Reset Variables
		document.getElementById('canvas').width = window.innerWidth;
		document.getElementById('canvas').height = window.innerHeight;
		centerOffsetX = can.width/2
		centerOffsetY = can.height/2
		
		//Render Game

		//Draw Background
		renderBG()

		//Render Projectiles
		renderProj()

		//Render Particles
		renderParticles()

		//Draw Players
		if (health>0) {renderPlayer(playerX,playerY,playerR,playerSkin,health,userName)}
		
		//Finish Rendering Game

		//Reset Scale For GUI
		ctx.setTransform(1, 0, 0, 1, 0, 0)
		
		//Start Rendering GUI

		//This normally would be unneeded, but other parts of the renderer for some reason require this.	
		renderCursor()

		//Show Position
		drawText("X: "+Math.round(playerX)+" Y: "+Math.round(playerY),10,window.innerHeight-10,"left",12,"#00AAFF")

		//Render MiniMap
		renderMap()

		//Render Chat
		renderChat()
		
		//Show Weapon
		drawText("TEST",window.innerWidth-10,window.innerHeight-10,"right",24,"#FFFFFF")
		
		//Finish GUI
	}
};

function renderPlayer(X,Y,R,Skin,Health,Name){
	ctx.setTransform(azoom, 0, 0, azoom, 0, 0)
	ctx.translate(centerOffsetX/azoom+X-camX,centerOffsetY/azoom-Y+camY)
	ctx.rotate(rad(playerR))
	ctx.drawImage(document.getElementById(Skin),-20,-10)
	ctx.setTransform(azoom, 0, 0, azoom, 0, 0)
	ctx.translate(centerOffsetX/azoom+X-camX,centerOffsetY/azoom-Y+camY)
    
	drawText(Name,25,0,"left",12,"#FFFFFF")	

	bar(-20,-10,Health,100,"#33CC55")
}

function bar(x,y,val,mVal,color){

		ctx.lineWidth = 6
		ctx.strokeStyle = "#000000"

		ctx.beginPath();
		ctx.moveTo(x+2,y-10);
		ctx.lineTo(x+38,y-10);
		ctx.stroke();
		
		if (val>0){
			ctx.lineWidth = 4
			ctx.strokeStyle = color

			ctx.beginPath();
			ctx.moveTo(x+3,y-10);
			ctx.lineTo(x+3+((val/mVal)*34),y-10);
			ctx.stroke();	
		}
}

function renderCursor(){
	ctx.lineWidth = 2
	ctx.strokeStyle = "#FFFFFF"

	ctx.beginPath();
	ctx.moveTo(9999999,9999999);
	ctx.lineTo(9999999,9999999);
	ctx.stroke();
}

function getDistance(ax,ay,bx,by){
	return Math.sqrt(((bx-ax)*(bx-ax))+((by-ay)*(by-ay)));
};

function drawText(text,x,y,align,size,color) {
	ctx.lineJoin = "round";
	ctx.font = size + "px ubuntu"
	
	ctx.save();
	ctx.lineWidth = 2;
	ctx.textAlign = align;
	ctx.translate(x,y);
	ctx.strokeStyle = "#000000";
	ctx.strokeText(text,0,0,2000000);
	ctx.fillStyle = color;
	ctx.fillText(text,0,0,2000000);
	ctx.restore();
};

function drawGrid(x,y,width,height,slotSize,lineColor) {
	ctx.save();
	ctx.translate(x,y);
	ctx.beginPath();
	ctx.strokeColor = lineColor;
	ctx.lineWidth = 0.1;
	
	for(var i = 0; i < width || i < height; i += slotSize) {
		ctx.moveTo(-width,-i-slotSize)
		ctx.lineTo(width,-i-slotSize)
		ctx.moveTo(-i-slotSize,-height)
		ctx.lineTo(-i-slotSize,height)
		ctx.moveTo(-width,i)
		ctx.lineTo(width,i)
		ctx.moveTo(i,-height)
		ctx.lineTo(i,height)
	};
	ctx.strokeStyle = lineColor;
	ctx.stroke();
	ctx.closePath();
	ctx.restore();
};

function renderTerrain(){
    ctx.scale(azoom,azoom)
	ctx.translate(centerOffsetX/azoom-camX,centerOffsetY/azoom+camY)

	ctx.beginPath()
	ctx.moveTo(-1000,1000)
	ctx.lineTo(-1000,(terrain[0]*-250)*10)
	for (var l=0; l<terrain.length; l++){
		ctx.lineTo(l*50,(terrain[l]*-250)*10)
		ctx.lineTo((l+1)*50,(terrain[l]*-250)*10)
	}
	ctx.lineTo((l*50)+1000,(terrain[terrain.length-1]*-250)*10)
	ctx.lineTo((l*50)+1000,1000)
	ctx.fill()
	ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function renderMap(){
	ctx.globalAlpha = 0.5

	ctx.strokeStyle = "#000000"
	ctx.fillStyle = "#FFFFFF"

	ctx.setTransform(1,0,0,1,0,0)
	ctx.fillRect(window.innerWidth-110,10,100,100)
	ctx.globalAlpha = 1
	ctx.strokeRect(window.innerWidth-110,10,100,100)

	//Render Map
	ctx.translate(window.innerWidth-110,110)

	ctx.beginPath()
	ctx.moveTo(0,0)
	for (var k=0; k<terrain.length; k++){
		ctx.lineTo(k/2,(terrain[k]*-60))
	}
	ctx.lineTo(k/2,0)
	ctx.stroke()

	//Render Player
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	ctx.fillStyle = "#0000FF"
	ctx.fillRect(window.innerWidth-111+(playerX/100),109-(playerY/40),2,2)
}

function renderBG(){
	ctx.beginPath();
	ctx.fillStyle = "#84AAE8";

	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(can.width,0);
	ctx.lineTo(can.width,can.height);
	ctx.lineTo(0,can.height);

	ctx.fill();

	ctx.fillStyle = "#33AA66";

	renderTerrain()

    ctx.scale(azoom,azoom)

	drawGrid(centerOffsetX/azoom-(camX%25),centerOffsetY/azoom+(camY%25),can.width/azoom,can.height/azoom,25,"#000000")
}

function renderProj(){
	for(var i = 0;i < projectiles.length; i++){

		ctx.setTransform(azoom,0,0,azoom,0,0)
		var tmpX = centerOffsetX/azoom-projectiles[i].x-camX, tmpY = centerOffsetY/azoom-projectiles[i].y+camY

		if (projectiles[i].type=="Rapid"){
		ctx.lineWidth = 2

		if (playerSkin=="Blue"){
			ctx.strokeStyle = "#3368FF"
		} else if (playerSkin=="Red"){
			ctx.strokeStyle = "#DB3939"
		} else if (playerSkin=="Yellow"){
			ctx.strokeStyle = "#DBD935"
		} else if (playerSkin=="Green"){
			ctx.strokeStyle = "#3DE035"
		}

		ctx.beginPath();
		ctx.moveTo(tmpX,tmpY);
		ctx.lineTo(tmpX+Math.cos(rad(projectiles[i].dir))*15,tmpY+Math.sin(rad(projectiles[i].dir))*15);
		ctx.stroke();
		} else if (projectiles[i].type=="Missile"){
			ctx.translate(tmpX,tmpY)
			ctx.rotate(rad(180+projectiles[i].dir))
			ctx.drawImage(document.getElementById("Missile"),-8,-2.5)
			ctx.setTransform(1, 0, 0, 1, 0, 0);
		}
	}
}

function renderParticles(){
	for(var i = 0;i < particles.length; i++){

		var tmpX = centerOffsetX/azoom-particles[i].x-camX, tmpY = centerOffsetY/azoom-particles[i].y+camY

		ctx.setTransform(azoom,0,0,azoom,0,0)
		ctx.translate(tmpX,tmpY)
		ctx.rotate(rad(particles[i].rot))
		if (particles[i].type=="Smoke"){
			ctx.globalAlpha = particles[i].time/50
			if (particles[i].time<51 && particles[i].time>40){
				ctx.drawImage(document.getElementById("Smoke1"),-8,-2.5)
			} else if (particles[i].time<41 && particles[i].time>30){
				ctx.drawImage(document.getElementById("Smoke2"),-8,-2.5)
			} else if (particles[i].time<31 && particles[i].time>20){
				ctx.drawImage(document.getElementById("Smoke3"),-8,-2.5)
			} else if (particles[i].time<21 && particles[i].time>10){
				ctx.drawImage(document.getElementById("Smoke4"),-8,-2.5)
			} else if (particles[i].time<11){
				ctx.drawImage(document.getElementById("Smoke5"),-8,-2.5)
			}
		} else if(particles[i].type="Flash") {
			ctx.globalAlpha = 0.75
			ctx.drawImage(document.getElementById("Flash"),-6,-6)
		}
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.globalAlpha = 1
	}
}

function renderChat(){
	if (chat.length>Math.floor(window.innerHeight/29)){var len = Math.floor(window.innerHeight/29)} else {var len = chat.length}
	for(var i = 0;i < len; i++){
		y = i*28+10
		var a = chat[i].time/25
		if (a>1){a=1}
		if (a<0){a=0}
		ctx.globalAlpha = a/2
		ctx.fillStyle = "#000000"
		ctx.fillRect(10,y,10+(chat[i].msg.length*10),26)
		ctx.globalAlpha = a
		drawText(chat[i].msg,16,y+18,"left",16,chat[i].color)

		if (chat[i].time > 0){
			chat[i].time--
		} else {
			chat.splice(i,1)
		}
	}
}

setInterval(renderStep,20);
