var texts = []
//<div class="largetextbodysection">
	//<p class="largetextbodysectionheader">head</p>
	//<p>xd</p>
	//<p>xd</p>
	//<p>xd</p>
	//<p>xd</p>
//</div>
texts[0]=[
	"MUSIC",
	"musicimg.png",
	[
		[
			"",
			"Yes, I got music. Some of it is great, some is good, some is ok. Hava a listen!"
		]
	]
]
texts[1]=[
	"DRONES.IO",
	"dronesgmp.png",
	[
		[
			"",
			"A would be IO game about drone fighting. Never got completed due to a lack of knowledge on how to get a working server end or a server to use."
		]
	]
]
texts[2]=[
	"TUNNEL FLYER",
	"",
	[
		[
			"Fly through enclosed spaces!",
			"Inspired by an old flash game I do not remember the name of, in this game you take control of a space ship. You fly through tunnel, speeding up and dodging obstacles as you go along."
		]
	]
]

var active = false

function setIMG(id) {
	var largetextbody = document.getElementById("largetextbody");
	var largetexthead = document.getElementById("largetextheader");
	var largetextimage = document.getElementById("largetextimg");

	var txt = texts[id];
	var head = txt[0];
	var img = txt[1];
	var body = txt[2];
	
	largetexthead.innerHTML = head;
	largetextimage.src = img;
	
	if (img == "") {
		largetextimage.style.visibility = "hidden";
		largetextimage.style.height = "0";
	}else{
		largetextimage.style.visibility = "visible";
		largetextimage.style.height = "unset";
	}
	
	var fulltext = "";
	for (i=0;i<body.length;i++) {
		var bodytext = '<div class="largetextbodysection">';
		for (j=0;j<body[i].length;j++) {
			if (j==0) {
				if (body[i][j] !== "") {
					bodytext = bodytext + '<p class="largetextbodysectionheader">'+body[i][j]+'</p>';
				}
			}else{
				bodytext = bodytext + '<p>'+body[i][j]+'</p>';
			}
		}
		fulltext = fulltext + bodytext + '</div>';
	}

	largetextbody.innerHTML = fulltext;
}
