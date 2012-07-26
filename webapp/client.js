
const pollFreq = 50;

var ws = null
, statusP = null
, setupForm = null
, joinButton = null
, canvas = null;

function status(msg) {
	if (statusP) {
		statusP.textContent = msg;
	}
}

function log(msg) {
	console.log(msg);
	status(msg);
}

window.onload = function() {
	statusP = document.getElementById("status");
	setupForm = document.getElementById("setup");
	joinButton = document.getElementById("join");
	canvas = document.getElementById("canvas");

	joinButton.onclick = function() {
		var host = document.getElementById("host").value
		, port = document.getElementById("port").value
		, name = document.getElementById("name").value;

		joinGame(host, port, name);
	};
};

function joinGame(host, port, name) {
	log("Connecting to " + host + ":" + port + " ...");
	ws = new WebSocket("ws://" + host + ":" + port);

	ws.onopen = function() {
		log("Connection established! Joining as " + name + " ...");
		ws.send(JSON.stringify(
				{
					msg: "join",
					name: name
				}
			));
	};

	ws.onmessage = function(message) {
		message = JSON.parse(message.data);
		switch (message.msg) {

		case "joined":
			log("Joined as player " + message.playerIndex);
			setInterval(sendInput, pollFreq);
			canvas.style.display = "block";
			setupForm.style.display = "none";
			break;
			
		case "state":
			console.log(message);
			drawGame(message);
			break;
			
		default:
			log("Invalid msg");
		}
	};
}

// images

function loadImage(src) {
	var image = new Image();
	image.src = src;
	return image;
}

var playerImgs = [0, 1, 2, 3].map(
	function(playerIndex) {
		return loadImage("img/player-" + playerIndex + ".png");
	}
)
, wallImg = loadImage("img/wall.png")
, topImg = loadImage("img/top.png")
, flopImg = loadImage("img/flop.png");

// drawing

var tileWidth = 32;

function drawGame(state) {
	var canvas = document.getElementById("canvas")
	, context = canvas.getContext("2d");
	
	// fill background
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);

	// draw walls
	state.walls.forEach(
		function(wall) {
			context.drawImage(wallImg, wall.x * tileWidth, wall.y * tileWidth);
		}
	);

	var maxPoints = Math.max.apply(
		{},
		state.players.map(
			function(player) {
				return player.points;
			}
		)
	);
	
	// draw players
	state.players.forEach(
		function(player, playerIndex) {
			var playerImg = playerImgs[playerIndex % playerImgs.length];
			context.save();
			context.translate(player.x * tileWidth + (tileWidth / 2), player.y * tileWidth + (tileWidth / 2));

			context.fillStyle = "rgba(0, 0, 0, 0.5)";
			context.font = player.points == maxPoints ? "bold 14px Ubuntu" : "12px Ubuntu";
			context.textAlign = "center";
			context.fillText(player.name + ": " + player.points, 0, -32);

			context.rotate(player.angle);
			context.drawImage(playerImg, -tileWidth / 2, -tileWidth / 2);
			context.restore();
		}
	);

	// draw tops & flops
	state.topsFlops.forEach(
		function(topFlop) {
			var topFlopImg = topFlop.topFlop == "top" ? topImg : flopImg;
			context.drawImage(topFlopImg, topFlop.x * tileWidth, topFlop.y * tileWidth);
		}
	);

	// show scores
	var scores = state.players.map(
		function(player) {
			return player.name + " (" + player.index + "): " + player.points;
		}
	).join(", ");
	status(scores + " (" + Math.round(state.timer) + "s)");
}

// send input

function sendInput() {
	var wasd = {
		w: !!pressed[87],
		a: !!pressed[65],
		s: !!pressed[83],
		d: !!pressed[68],
		msg: "input"
	};
	ws.send(JSON.stringify(wasd));
}

var pressed = {};

window.onkeydown = function(event) {
	pressed[event.keyCode] = true;
};

window.onkeyup = function(e) {
	delete pressed[event.keyCode];
};