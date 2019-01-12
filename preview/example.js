var camera = {
	rotation: 0,
	tilt: Math.PI / 4,
	position: [0, 0.25, -4]
};

var room = {
	position: [0, 0.5, 0],
	rotation: Math.PI / 4
};

var scene = window.spective(camera, function (elapsedTime) {
	camera.rotation += elapsedTime / 2100;
	room.rotation += elapsedTime / 1300;

	scene(camera);
	mainGridFloor(room);
	mainWhiteTeapot(room);

	return true;
});

var floor = scene([
	-1, 0, -1, -1, 0, 1,
	1, 0, -1, 1, 0, 1
], [0, 1, 2, 3, 2, 1]);

var gridFloor = floor('grid.png', [
	0, 0, 0, 4.0625, 4.0625, 0, 4.0625, 4.0625
], function (name, loaded) {
	console.log(name + (!loaded ? ' not' : '') + ' loaded');
});

var mainGridFloor = gridFloor(room);

var teapot = scene(teapotVertices, teapotFaces);
var whiteTeapot = teapot([1, 1, 1]);
var mainWhiteTeapot = whiteTeapot(room);
