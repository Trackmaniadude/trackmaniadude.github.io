var img = ''
var active = false

function setIMG(source) {
	if (img != '' && source != img && !active) {
		active = true
		img = source
		document.getElementById("img").style.opacity = 0;
		setTimeout(function(){
			document.getElementById("img").src = source
		},1050);
		setTimeout(function(){
			document.getElementById("img").style.opacity = 1;
		},1100);
		setTimeout(function(){
			active = false;
		},2100);
	} else if (img == '') {
		active = true
		img = source
		document.getElementById("img").src = source
		setTimeout(function(){
			document.getElementById("img").style.opacity = 1;
		},100);
		setTimeout(function(){
			active = false;
		},1100);
	}
}