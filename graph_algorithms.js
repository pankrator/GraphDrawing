var GraphManager = function() {};

GraphManager.prototype.createNewEmptyGraph = function (graphController) {
	return {
		list: [],
		freeIndexes: [],
		nodeSpeed: 20,
		drawConnections: true,
		graphController: graphController
	};
}

GraphManager.prototype.setDrawConnections = function(graph, drawConnections) {
	graph.drawConnections = drawConnections;
}

GraphManager.prototype.draw = function (graph, context) {
	var list = graph.list;
	for(var i = 0; i < list.length; i++) {
		context.beginPath();
		if (list[i].fill) {
			context.fillStyle = list[i].color ? list[i].color : "white";
		} else {
			context.strokeStyle = list[i].color ? list[i].color : "blue";
		}
		context.arc(list[i].x, list[i].y, list[i].radius, 0, Math.PI * 2);

		if (list[i].fill) {
			context.fill();
		} else {
			context.stroke();
		}
		context.fillStyle = "red";
		context.fillText(i, list[i].x - 10, list[i].y);
		if(list[i].level) {
			context.fillText(list[i].level, list[i].x - 10, list[i].y + 20);
		}

		if (graph.drawConnections) {
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
				context.stroke();
			}
		}
	}
}

GraphManager.prototype.getGraphNodeByCoordinates = function (graph, x, y) {
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

GraphManager.prototype.getNodeCircleCoordinatesFromPosition = function (graph,
																	    node,
																	    x,
																	    y) {
	var dir = {
		x: x - node.node.x,
		y: y - node.node.y
	};
	var len = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
	if(len != 0) {
		dir.x /= len;
		dir.y /= len;
	}

	var result = {
		x: node.node.x + dir.x * node.node.radius,
		y: node.node.y + dir.y * node.node.radius
	};
	return result;
}

GraphManager.prototype.initializeGraphNeighbours = function (graph) {
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

GraphManager.prototype.removeNodeOnCoordinates = function (graph, x, y) {
	var nodeObject = this.getGraphNodeByCoordinates(graph, x, y);
	if (nodeObject === null) {
		return;
	}

	var node = nodeObject.node;
	var nodeIndex = nodeObject.index;
	var list = graph.list;
	for (var i = 0; i < node.neighbours.length; i++) {
		var removeIndex = list[node.neighbours[i]].neighbours.indexOf(nodeIndex);
		list[node.neighbours[i]].neighbours.splice(removeIndex, 1);
	}
	list[nodeIndex].neighbours = [];
	list[nodeIndex].x = -100; // TODO: Fix this as soon as possible
	list[nodeIndex].y = -100; 
	graph.freeIndexes.push(nodeIndex);
}

GraphManager.prototype.createNode = function (graph, x, y) {
	var controller = graph.graphController;
	controller.createNode(graph, x, y);
}

GraphManager.prototype.connectNodes = function(graph, first, second) {
	first.node.neighbours.push(second.index);
	second.node.neighbours.push(first.index);
	var controller = graph.graphController;
	controller.connectNodes(graph, first, second);
}

GraphManager.prototype.connectNodesByIndex = function (graph, firstIndex, secondIndex) {
	var first = graph.list[firstIndex];
	var second = graph.list[secondIndex];

	first.neighbours.push(firstIndex);
	second.neighbours.push(secondIndex);
}

GraphManager.prototype.simulate = function (graph) {
	var controller = graph.graphController;
	controller.simulate(graph);
}

var ForceBasedGraphController = function () {};

ForceBasedGraphController.prototype.createNode = function (graph, x, y) {
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
	graph.nodeSpeed = 20;
}

ForceBasedGraphController.prototype.connectNodes = function (graph, first, second) {
	graph.nodeSpeed = 20;
}

ForceBasedGraphController.prototype.simulate = function (graph) {
	if (graph.nodeSpeed < 0.5) {
		return;
	}
	this.attractNeighbours(graph);
	this.pushAllPairsAway(graph);
	graph.nodeSpeed *= 0.99;
}

ForceBasedGraphController.prototype.attractNeighbours = function (graph) {
	var list = graph.list

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
				list[i].x -= dir.x * graph.nodeSpeed * (len * scalenLen || 1);
				list[i].y -= dir.y * graph.nodeSpeed * (len * scalenLen || 1);
			}
		}
	}
}

ForceBasedGraphController.prototype.pushAllPairsAway = function (graph) {
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
				list[i].x -= dir.x * graph.nodeSpeed / (len * scaleLen || 1);
				list[i].y -= dir.y * graph.nodeSpeed / (len * scaleLen || 1);
			}
		}
	}
}