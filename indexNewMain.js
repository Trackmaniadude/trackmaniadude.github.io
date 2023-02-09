const options = { dateStyle: "long" };

function handleOnLoad(){
	var date = new Date(document.lastModified);
	document.getElementById("footer-date").innerHTML = "Last updated: " + date.toLocaleDateString(undefined, options)
};