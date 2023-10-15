const options = { dateStyle: "long" };

const codingData = [
	{
		header: "Sonic Game (WIP)",
		thumb: "https://tr.rbxcdn.com/a5da0a67a5041b8d9b6e2f7a090d716f/768/432/Image/Png",
		link: "https://www.roblox.com/games/10410749892/Sonic-Game-WIP",
		body: "A currently in progress Sonic fan game, built after making a 3D recreation/extension of the original game's physics."
	},
	{
		header: "Trackmania Roblox: City",
		thumb: "https://tr.rbxcdn.com/b278591804c6e280b62db72966151481/768/432/Image/Png",
		link: "https://www.roblox.com/games/2463985554/Trackmania-Roblox-City",
		body: "Partially finished Trackmania fan game. One of the main features of the game (both this and the original) is the built in track editor, in which all tracks in the game are made. I had to figure out data serialization to make this work (fairly basic though, tracks are stored as JSON objects)."
	},
	{
		header: "Terrain Gen V3",
		thumb: "Images/terrainv3.png",
		link: "https://www.roblox.com/games/6942187484/Trackmaniadudes-Place-Number-74",
		body: "Exactly as titled, my third try at procedurally generated terrain."
	},
	{
		header: "Arctic's Roleplay",
		thumb: "Images/arctics.png",
		link: "https://www.roblox.com/games/394296482/Arctics-Roleplay",
		body: "FNAF Roleplay game built as part of a team, I primarily did coding work. One of the more impressive parts is the in game character creator."
	},
	{
		header: "CONTRAST",
		thumb: "https://tr.rbxcdn.com/ea94e2c1ed1754c5890516d34f9e7c88/768/432/Image/Png",
		link: "https://www.roblox.com/games/13534188441/CONTRAST-WIP",
		body: "Ship racing game that I randomly had the urge to make summer of 2023. Not exactly complete, but works. Roads are generated dynamically, based on splines and some procedural code."
	},
	{
		header: "Roller Coasters",
		thumb: "https://tr.rbxcdn.com/9617ab4ab0eee93feb31000cf41dcf04/768/432/Image/Png",
		link: "https://www.roblox.com/games/1092568012/Roller-Coasters",
		body: "More spline based procedural generation (although this is 2017-2020, not 2023), just a bunch of roller coasters. Never figured out how to get multiple cars in a train."
	},
	// {
		// header: "HEADER",
		// thumb: "bg.png",
		// link: "",
		// body: "BODY TEXT"
	// },
];

const codingTemplate = document.getElementById("codingProjectsList").innerHTML

function handleOnLoad(){
	//Get last date updated
	{
		var date = new Date(document.lastModified);
		document.getElementById("footer-date").innerHTML = "Last updated: " + date.toLocaleDateString(undefined, options);
	}
	
	//Populate Coding Section
	{
		var newInnerHTML = "";
		
		for (const data of codingData) {
			var str = codingTemplate;
			str = str.replace("HEADER", data.header);
			str = str.replace("THUMB", data.thumb);
			str = str.replace("BODY", data.body);
			str = str.replace("LINK", data.link);
			newInnerHTML += str;
		}
		
		document.getElementById("codingProjectsList").innerHTML = newInnerHTML;
	}
};