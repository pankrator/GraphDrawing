var context, canvas;
var canvasBoundaries;

var selectNodeForIteration = false;

var graphManager = new GraphManager();
var graph = graphManager.createNewEmptyGraph(new ForceBasedGraphController());
var iterator = new BFSIterator(graph);

var graphComponents = {
	firstNode: null,
};

var mouse = {
	x: 300,
	y: 300
}

window.onload = function () {
	canvas = document.getElementById("area");
	context = canvas.getContext("2d");

	window.addEventListener("keydown", keyboardListener);
	canvas.addEventListener("mousemove", mouseMoveListener);
	canvas.addEventListener("click", mouseClickListener);
	canvas.addEventListener("mousedown", mouseDownListener);
	canvas.addEventListener("mouseup", mouseUpListener);
	canvas.addEventListener("contextmenu", contextMenuListener);
	
	var bfsButton = document.getElementById("BFS");
	bfsButton.onclick = function () {
		iterator = new BFSIterator(graph);
		selectNodeForIteration = true;
	};

	context.font = "normal 20px Arial";
	canvasBoundaries = canvas.getBoundingClientRect();
	
	update();
}

var contextMenuListener = function (ev) {
	event.preventDefault();
	graphManager.removeNodeOnCoordinates(graph, mouse.x, mouse.y);
}

var mouseUpListener = function(ev) {
	if (graphComponents.firstNode != null) {
		var otherNode = graphManager.getGraphNodeByCoordinates(graph, mouse.x, mouse.y);
		if (otherNode != null) {
			graphManager.connectNodes(graph, graphComponents.firstNode, otherNode);
		}
	}
}

var mouseDownListener = function (ev) {
	if(ev.button == 0) {
		var result = graphManager.getGraphNodeByCoordinates(graph, mouse.x, mouse.y);
		if(result != null) {
			graphComponents.firstNode = result;
		}
	}
}

var mouseClickListener = function (ev) {
	if (selectNodeForIteration === true) {
		var node = graphManager.getGraphNodeByCoordinates(graph, mouse.x, mouse.y);
		if (node != null) {
			selectNodeForIteration = false;
			iterator.start(graphManager.getGraphNodeByCoordinates(graph, mouse.x, mouse.y));
		} else {
			selectNodeForIteration = false;
		}
	}
	if (graphComponents.firstNode === null) {
		graphManager.createNode(graph, mouse.x, mouse.y);
	}
	graphComponents.firstNode = null;
}

var mouseMoveListener = function (ev) {
	mouse.x = ev.x - canvasBoundaries.left;
	mouse.y = ev.y - canvasBoundaries.top;
}

var keyboardListener = function (ev) {
	if (ev.keyCode == 32) {
		iterator.reset();
	}
	if (ev.keyCode == 39) {
		iterator.next();
	}
}

var update = function () {
	context.clearRect(0, 0, 1000, 1000);

	graphManager.simulate(graph);
	graphManager.draw(graph, context);

	if (graphComponents.firstNode != null) {
		var start = graphManager.getNodeCircleCoordinatesFromPosition(graph, 
																	  graphComponents.firstNode,
																	  mouse.x, mouse.y);
		context.strokeStyle = "black";
		context.moveTo(start.x, start.y);
		context.lineTo(mouse.x, mouse.y);
		context.stroke();
	}

	if (selectNodeForIteration) {
		context.fillStyle = "red";
		context.fillText("Choose node for BFS", mouse.x, mouse.y - 10);
	}

	setTimeout(update, 30);
}