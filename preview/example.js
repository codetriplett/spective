// create a viewport and position the camera
var scene = spective({
	position: [0, 0.4, -3]
});

// update the camera
scene({
	tilt: Math.PI / 4,
	position: [0, 0.25, -3]
});

// load a 3d object
var teapot = scene('teapot.obj');

// wrap 3d object in an image or color
var whiteTeapot = teapot('#fff');

// place an instance of a 3d object into the scene
var mainWhiteTeapot = whiteTeapot({
	rotation: Math.PI / 4
});

// update the instance
mainWhiteTeapot({
	rotation: Math.PI * 3 / 4
});
