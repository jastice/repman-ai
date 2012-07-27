var TAU = 2 * Math.PI;
var ANGULAR_EPSILON = Math.PI / 20;

var debugTarget = {x: 4, y: 4};

function ai(message) {
	// assess situation ?

	var me = getMe(message);
	var targets = calculateDistance(message);
	var target = selectTarget(me, targets);
	// var target = debugTarget;
	
	ws.send(JSON.stringify(navigate(me, target)));

};

function getMe(message) {
	return message.players.filter(function(p) {
		return p.name === myName;
	})[0];
};

function getObstacles(message) {
	return [ ];
};


function selectTarget(me, targets) {
	// TODO smart targeting ..
	var tops = targets.filter(function(t){
		return t.topFlop === "top";
	});
	return tops[0];
};

/**
	Navigation function.
*/
function navigate(me,target) {

	var wasd = {
		msg: "input",
		w: false,
		a: false,
		d: false
	};

	var myAngle = normalizeAngle(me.angle);
	var targetAngle = normalizeAngle(angle(me.x, me.y, target.x, target.y));
	var angleDiff = angleDifference(myAngle, targetAngle);

	console.log("    my: " + myAngle + "\ttarget: " + targetAngle + "\tdiff:" + angleDiff);
	console.log("   pos: " + me.x + ", " + me.y)
	console.log("target: " + target.x + "," + target.y)

	if (angleDiff > ANGULAR_EPSILON*2) {
		wasd.d = true;
	} 
	else if(angleDiff < -ANGULAR_EPSILON*2) {
		wasd.a = true;
	} 

	if (angleDiff < Math.PI/2) {
		// this gives us forwards movement even while turning. also looks cool
		wasd.w = true; 
	}

	if (me.colliding) {
		// Zoolander move: try to break free by turning right and moving forwards
		wasd.a = false;
		wasd.w = true;
		wasd.d = true;
	}
	
	return wasd;	
}

/**
	Signed difference between two angles.
*/
function angleDifference(a1, a2) {
	var a = a2 - a1;
	return a + (a>Math.PI)? -TAU : (a < -Math.PI) ? TAU : 0;
}

function normalizeAngle(angle) {
	var n = angle % TAU 
	return n<0? n+TAU : n;
}

/**
	Calculate the angle between 2 points.
*/
function angle(x1,y1,x2,y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	
	// weird adjustment for angle use in game
	return -Math.atan2(dx,dy) + (Math.PI/2); 
}


function calculateDistance(message) {
	var a = message.topsFlops.sort(function(a,b){
		return distance(message.players[index],a) - distance(message.players[index],b);
	});
	return a;
}
function distance(o1, o2){
	return distance2(o1.x,o1.y,o2.x,o2.y);
}
function distance2(x1, y1, x2, y2) {
	var d = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
	return d;
}
