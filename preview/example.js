var camera = {
	rotation: 0,
	tilt: Math.PI / 4,
	position: [0, 0.25, -3]
};

var room = {
	position: [0, 0, 0],
	rotation: Math.PI / 4
};

var scene = window.spective(camera);

setInterval(() => {
	camera.rotation -= 0.0025;
	room.rotation -= 0.005;

	scene(camera);
	mainWhiteTeapot(room);
});

var teapot = scene('teapot.obj');
var whiteTeapot = teapot('#fff');
var mainWhiteTeapot = whiteTeapot(room);
