var camera = {
	rotation: 0,
	tilt: Math.PI / 4,
	position: [0, 0, -6]
};

var room = {
	position: [0, 0.5, 0],
	rotation: Math.PI / 4
};

var scene = window.spective(camera, function (elapsedTime) {
	room.rotation += elapsedTime / 1300;

	mainGridFloor(room);
	mainWhiteWalls({ scale: [1, 0.25, 1] }, room);

	return true;
});

var floor = scene([
	0, 1, 2, 3, 2, 1
], [
	-1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, 1
]);

var walls = scene([
	0, 1, 2, 3, 2, 1,
	4, 5, 6, 7, 6, 5,
	8, 9, 10, 11, 10, 9,
	12, 13, 14, 15, 14, 13
], [
	-1, 0, -1, -1, 0, 1, -1, 1, -1, -1, 1, 1,
	-1, 0, 1, 1, 0, 1, -1, 1, 1, 1, 1, 1,
	1, 0, 1, 1, 0, -1, 1, 1, 1, 1, 1, -1,
	1, 0, -1, -1, 0, -1, 1, 1, -1, -1, 1, -1
]);

var gridFloor = floor('grid.png', [
	0, 0, 4.0625, 0, 0, 4.0625, 4.0625, 4.0625
], function (name, loaded) {
	console.log(name + (!loaded ? ' not' : '') + ' loaded');
});

var whiteWalls = walls([1, 1, 1]);

var mainGridFloor = gridFloor(room);
var mainWhiteWalls = whiteWalls({ scale: [1, 0.25, 1] }, room);
