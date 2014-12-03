var context, canvas;

var speed = 20;

var initializeGraphPosition = function (graph) {
	var list = graph.list;
	for(var i = 0; i < list.length; i++) {
		list[i].x = Math.random() * 2400 + 50;
		list[i].y = Math.random() * 2400 + 50;
		// list[i].x = 400;
		// list[i].y = 400;
		list[i].radius = 30;
	}

	graph.initialized = true;
}

var forceOnNeighboursBasedRepresentation = function(graph) {
	if (!graph.initialized) {
		initializeGraphPosition(graph);
	}

	var list = graph.list;
	for(var i = 0; i < list.length; i++) {
		var neighbours = list[i].neighbours;
		for(var j = 0; j < neighbours.length; j++) {
			var dir = {
				x: list[i].x - list[neighbours[j]].x,
				y: list[i].y - list[neighbours[j]].y,
			};

			var len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
			if(len != 0) {
				dir.x /= len;
				dir.y /= len;
			}
			if(dir.x == 0 && dir.y == 0) {
				dir.x = Math.random() - Math.random();
				dir.y = Math.random() - Math.random();
			}

			var minDistance = list[i].radius * 5 + 50;
			var scalenLen = 1/1000;

			if(len >= minDistance) {
				list[i].x -= dir.x * speed * (len * scalenLen || 1);
				list[i].y -= dir.y * speed * (len * scalenLen || 1);
			}
		}
	}
}

var forceOnAllPairsBasedRepresentation = function(graph) {
	if (!graph.initialized) {
		initializeGraphPosition(graph);
	}

	var list = graph.list;
	for (var i = 0; i < list.length; i++) {
		for (var j = 0; j < list.length; j++) {
			if (i == j) {
				continue;
			}

			var dir = {
				x: list[j].x - list[i].x,
				y: list[j].y - list[i].y
			};

			var len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
			if(len != 0) {
				dir.x /= len;
				dir.y /= len;
			}
			if(dir.x == 0 && dir.y == 0) {
				dir.x = Math.random();
				dir.y = Math.random();
			}

			var minDistance = list[i].radius * 4 + 50;
			var scaleLen = 1/8;

			if(len < minDistance) {
				list[i].x -= dir.x * speed / (len * scaleLen || 1);
				list[i].y -= dir.y * speed / (len * scaleLen || 1);
			}
		}
	}
}

var applyBoundaryForce = function(graph) {
	var list = graph.list;

	for(var i = 0; i < list.length; i++) {
		var minDistance = list[i].radius * 2;
		// var len = 
	}
}

var moveNode = function(graph, index) {
	var node = graph.list[index];
	node.x = mouse.x;
	node.y = mouse.y;
}

var initializeGraphNeighbours = function(graph) {
	var list = graph.list;

	for(var i = 0; i < list.length; i++) {
		var neighbours = list[i].neighbours;
		for(var j = 0; j < neighbours.length; j++) {
			var otherNeightbours = list[neighbours[j]].neighbours;
			var addFlag = true;
			for(var k = 0; k < otherNeightbours.length; k++) {
				if(otherNeightbours[k] == i) {
					addFlag = false;
					break;
				}
			}
			if(addFlag) {
				otherNeightbours.push(i);
			}
		}
	}
}

var draw = function(graph, context) {
	var list = graph.list;
	for(var i = 0; i < list.length; i++) {
		context.beginPath();
		context.strokeStyle = "blue";
		context.arc(list[i].x, list[i].y, list[i].radius, 0, Math.PI * 2);
		context.stroke();
		context.fillText(i, list[i].x - 10, list[i].y);

		context.strokeStyle = "red";
		var neighbours = list[i].neighbours;
		for(var j = 0; j < neighbours.length; j++) {
			context.beginPath();
			var other = list[neighbours[j]];
			var dir = {
				x: list[i].x - other.x,
				y: list[i].y - other.y
			};
			var len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
			if (len != 0) {
				dir.x /= len;
				dir.y /= len;
			}

			context.moveTo(list[i].x + (-1) * dir.x * list[i].radius, list[i].y + (-1) * dir.y * list[i].radius);
			context.lineTo(other.x + dir.x * other.radius, other.y + dir.y * other.radius);

			// context.moveTo(list[i].x, list[i].y);
			// context.lineTo(other.x, other.y);
			context.stroke();
		}
	}
}

var connectToEveryNode = function (index) {
	var node = graph.list[index];
	for(var i = 0; i < graph.list.length; i++) {
		node.neighbours.push(i);
	}
	initializeGraphNeighbours(graph);
}

var createNode = function (x, y) {
	var freeIndex = graph.freeIndexes.pop();
	if(freeIndex === undefined) {
		graph.list.push({ x: x, y: y, radius: 30, neighbours: []});		
	} else {
		graph.list[freeIndex] = {
			x: x,
			y: y,
			radius: 30,
			neighbours: []
		};
	}
	// connectToEveryNode(graph.list.length - 1);
	speed = 20;
}

var getGraphNodeByCoordinates = function(x, y) {
	var list = graph.list;
	for(var i = 0; i < list.length; i++) {
		var dir = {
			x: x - list[i].x,
			y: y - list[i].y
		};

		var len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);

		if(len <= list[i].radius) {
			return {
				node: list[i],
				index: i
			};
		}
	}

	return null;
}

var graph = {
	list: [],
	freeIndexes: []
};


var mouse = {
	x: 300,
	y: 300
}

var firstNode = null;

window.onload = function() {	
	window.addEventListener("keydown", keyboardListener);
	window.addEventListener("mousemove", mouseMoveListener);
	window.addEventListener("click", mouseClickListener);
	window.addEventListener("mousedown", mouseDownListener);
	window.addEventListener("mouseup", mouseUpListener);
	window.addEventListener("contextmenu", contextMenuListener);

	canvas = document.getElementById("area");
	context = canvas.getContext("2d");
	context.font = "normal 20px Arial";
	
	initializeGraphNeighbours(graph);
	update();
}

function contextMenuListener(ev) {
	var rect = canvas.getBoundingClientRect();
	event.preventDefault();
	var nodeObject = getGraphNodeByCoordinates(ev.x - rect.left, ev.y - rect.top);
	var node = nodeObject.node;
	var nodeIndex = nodeObject.index;
	var list = graph.list;
	for (var i = 0; i < node.neighbours.length; i++) {
		var removeIndex = list[node.neighbours[i]].neighbours.indexOf(nodeIndex);
		list[node.neighbours[i]].neighbours.splice(removeIndex, 1);
	}
	list[nodeIndex].neighbours = [];
	list[nodeIndex].x = -100;
	list[nodeIndex].y = -100;
	graph.freeIndexes.push(nodeIndex);
}

function mouseUpListener (ev) {
	var rect = canvas.getBoundingClientRect();
	if (firstNode != null) {
		var otherNode = getGraphNodeByCoordinates(ev.x - rect.left, ev.y - rect.top);
		if (otherNode != null) {
			firstNode.neighbours.push(otherNode.index);
			initializeGraphNeighbours(graph);
			speed = 20;
		}
	}
}

function mouseDownListener (ev) {
	if(ev.button == 0) {
		console.log("here");
		var rect = canvas.getBoundingClientRect();
		var result = getGraphNodeByCoordinates(ev.x - rect.left, ev.y - rect.top);
		if(result != null) {
			firstNode = result.node;		
		}		
	}
}

function mouseClickListener (ev) {
	var rect = canvas.getBoundingClientRect();
	if (firstNode === null) {
		createNode(ev.x - rect.left, ev.y - rect.top);		
	}
	firstNode = null;
}

function mouseMoveListener (ev) {
	mouse.x = ev.x;
	mouse.y = ev.y;
}

function keyboardListener(ev) {
	if(ev.keyCode == 37) {

	}
	if(ev.keyCode == 39) {

	}
	if(ev.keyCode == 38) {

	}
	if(ev.keyCode == 40) {
		
	}
}

function update() {
	context.clearRect(0, 0, 3000, 3000);

	forceOnAllPairsBasedRepresentation(graph);
	forceOnNeighboursBasedRepresentation(graph);
	speed *= 0.99;
	// moveNode(graph, 2);

	draw(graph, context);

	setTimeout(update, 30);
}