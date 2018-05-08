function setAvailableTanks() {
	if (makeEntityType == "shape") {
		document.getElementById("text1").innerHTML = "Size:"
		document.getElementById("text4").innerHTML = "Shape:"
		document.getElementById("classInput").innerHTML = '</optgroup><optgroup label="Shapes"><option value="square">Square</option><option value="triangleS">Triangle</option><option value="pentagon">Pentagon</option><option value="apentagon">Alpha Pentagon</option></optgroup><optgroup label="Ammunition"><option value="drone">Drone</option><option value="square">Necro Drone</option><option value="bullet">Bullet</option><option value="trap">Trap</option>'
	} else {
		document.getElementById("text1").innerHTML = "Level:"
		document.getElementById("text4").innerHTML = "Class:"
		document.getElementById("classInput").innerHTML = '</optgroup><optgroup label="Tanks"><option value="basic">Basic Tank</option></optgroup><optgroup label="Twin Tree"><option value="twin">Twin</option><option value="triple">Triple Shot</option><option value="spread">Spreadshot</option><option value="triplet">Triplet</option><option value="penta">Pentashot</option><option value="twinflank">Twin Flank</option><option value="tripletwin">Triple Twin</option></optgroup><optgroup label="Machine Gun Tree"><option value="machine">Machine Gun</option><option value="sprayer">Sprayer</option><option value="destroyer">Destroyer</option><option value="hybrid">Hybrid</option><option value="annihilator">Annihilator</option><option value="gunner">Gunner</option></optgroup><optgroup label="Flank Guard Tree"><option value="flank">Flank Guard</option><option value="triangle">Tri-angle</option><option value="booster">Booster</option><option value="fighter">Fighter</option></optgroup><optgroup label="Sniper Tree"><option value="sniper">Sniper</option><option value="assassin">Assassin</option><option value="hunter">Hunter</option><option value="predator">Predator</option><option value="trapper">Trapper</option><option value="tritrapper">Tri-Trapper</option><option value="autotrapper">Auto Trapper</option><option value="megatrapper">Mega Trapper</option><option value="overlord">Overlord</option><option value="manager">Manager</option><option value="necro">Necromancer</option><option value="factory">Factory</option><option value="master">Master</option></optgroup><optgroup label="Smasher Tree"><option value="smasher">Smasher</option><option value="spike">Spike</option><option value="landmine">Landmine</option><option value="autosmasher">Auto Smasher</option></optgroup><optgroup label="Multiple Tree Tanks"><option value="autogunner">Auto Gunner</option><option value="overtrapper">Overtrapper</option><option value="gunnertrapper">Gunner Trapper</option><option value="quad">Quad Tank</option><option value="octo">Octo Tank</option><option value="streamliner">Streamliner</option></optgroup><optgroup label="Auto Tanks"><option value="autogunner">Auto Gunner</option><option value="autosmasher">Auto Smasher</option><option value="autotrapper">Auto Trapper</option><option value="auto3">Auto 3 (Not Available)</option><option value="auto5">Auto 5 (Not Available)</option></optgroup><optgroup label="Other Tanks"><option value="ac">Arena Closer</option><option value="dom">Dominator</option><option value="ms">Mothership</option><option value="minion">Factory Drone</option></optgroup><optgroup label="Bosses"><option value="guardian">Guardian</option><option value="summoner">Summoner</option><option value="overlord">Fallen Overlord</option><option value="booster">Fallen Booster</option><option value="defender">Defender</option></optgroup><optgroup label="Other"><option value="turret">Auto Turret</option><option value="custom">Custom</option>'
	}
}

function convertFTB(FTBi) {
	Out = new Array(FTBi.length)

	//Loop through all barrels.
	for (var i=0;i<FTBi.length;i++) {
		FTB = FTBi[i]
		//Convert Types
		if (FTB["type"] == 0) {
			FTB["type"] = 0
			//Resize Barrels
			FTB["length"] = FTB["length"] * 0.6923076923076923
			FTB["width"] = FTB["width"] * 0.76
		} else if (FTB["type"] == 1) {
			FTB["type"] = 2
			//Resize Barrels
			FTB["length"] = FTB["length"] * 0.9
			FTB["width"] = FTB["width"] * 1.6
		} else if (FTB["type"] == 2) {
			FTB["type"] = 1
			//Resize Barrels
			FTB["length"] = FTB["length"] * 0.523076923077
			FTB["width"] = FTB["width"] * 0.8
		} else if (FTB["type"] == 3) {
			FTB["type"] = 1
			//Resize Barrels
			FTB["length"] = FTB["length"] * 0.523076923077
			FTB["width"] = FTB["width"] * 0.8
		}
		

		Out[i] = {"barrelType":FTB["type"],"length":FTB["length"],"width":FTB["width"],"angle":FTB["angle"],"offsetX":FTB["xoffset"],"damage":"1","penetration":"1"}
	}
	return Out
}
