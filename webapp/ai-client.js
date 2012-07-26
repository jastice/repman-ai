var myName = "JJM";
var TAU = 2 * Math.PI;
var ANGULAR_EPSILON = Math.PI / 20;

function ai(message) {
	// assess situation ?

	var me = getMe(message);
	var targets = calculateDistance(message);
	var target = selectTarget(targets);
	
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


function selectTarget(targets) {
	return target[0];
};

/**
	Navigation function.
*/
function navigate(me,target) {

	var wasd = {
		w: false,
		a: false,
		d: false
	}

	var myAngle = me.angle % TAU;
	var targetAngle = angle(me.x, me.y, target.x, target.y);

	// super-naive turning algorithm
	if (targetAngle - myAngle > ANGULAR_EPSILON) {
		// TODO determine turn direction
		wasd.d = true; // zoolander style: can't turn left
	} 

	if (targetAngle - myAngle > Math.PI) {
		// move as soon as it doesn't go backwards
		wasd.w = true; 
	}
	
	return wasd;	
}

/**
	Calculate the angle between 2 points.
*/
function angle(x1,y1,x2,y2) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	return Math.atan2(dx,dy);
}


function calculateDistance(message) {
	var a = message.topsFlops.sort(function(a,b){
		return distance(message.players[index],a) > distance(message.players[index],b);
	});
	return a;
}
function distance(o1, o2){
	return distance2(o1.x,o1.y,o2.x,o2.y);
}
function distance2(x1, y1, x2, y2) {
	var d = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
	return d;
}
