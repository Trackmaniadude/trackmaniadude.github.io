var socket = new WebSocket('ws://echo.websocket.org');
socket.onopen = function(event) {
	console.log("Connected!")
}
socket.onerror = function(error) {
	console.log('WebSocket Error: ' + error);
};

socket.onmessage = function(event) {
	console.log(event.data)
};
