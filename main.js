const options = { dateStyle: "long" };

document.addEventListener("DOMContentLoaded", function(){
	//Get last date updated
	var date = new Date(document.lastModified);
	document.getElementById("footer-date").innerHTML = "Last updated: " + date.toLocaleDateString(undefined, options);
}); 