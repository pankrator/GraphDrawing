var BFSIterator = function (graph) {
	this.k = 0;
	this.level = 1;
	this.queue = [];
	this.graph = graph;
	this.used = [];
	this.started = false;
};

BFSIterator.prototype.next = function () {
	if (this.queue.length <= this.k) {
		return;
	}
	var v = this.queue[this.k++];
	var node = this.graph.list[v];
	node.color = "black"; // Magic
	node.fill = true;
	node.radius = 30;
	var neighbours = node.neighbours;

	for(var i = 0; i < neighbours.length; i++) {
		if(!this.used[neighbours[i]]) {
			this.queue.push(neighbours[i]);
			var node = this.graph.list[neighbours[i]];
			node.color = "green"; // Magic
			node.radius = 40;
			node.level = this.used[v] + 1;
			this.used[neighbours[i]] = this.used[v] + 1;
		}
	}
}

BFSIterator.prototype.start = function (startVertex) {
	if (this.started) {
		return;
	}

	this.started = true;
	this.queue.push(startVertex.index);
	this.used[startVertex.index] = this.level;

	// while (this.queue.length > this.k) {
	this.next();
	// }
}

BFSIterator.prototype.reset = function () {
	this.k = 0;
	this.level = 1;
	this.queue = [];
	this.used = [];
	this.started = false;

	var list = this.graph.list;
	for (var i = 0; i < list.length; i++) {
		list[i].color = null;
		list[i].fill = null;
		list[i].level = null;
		list[i].radius = 30; // Magic
	}
}

