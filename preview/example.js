var scene = spective({
	offset: [0, -0.125, -4],
	angleX: Math.PI / 4
})(2 * Math.PI, function () {
	return 18000;
});

var cups = [];

var teapot = scene('teapot.obj', '#07f', 0)(Math.PI / 3, function (iteration) {
	if (iteration > 5) {
		cups.splice(0, 1)[0]();
	}

	var cupIteration;

	cups.push(scene('cylinder.obj', '#f70', {
		// TODO: does subtraction or division make more sense for scale
		// - maybe the property function isn't really needed now that changes are relative
		scale: [-0.8, -0.98, -0.8],
		offset: [1.25, 0, 0],
		angleY: iteration * Math.PI / 3
	})(function (progress) {
		return { scaleY: progress * 0.2 * (cupIteration ? -1 : 1) };
	}, function (iteration) {
		cupIteration = iteration;
		return [250, 5750][iteration]
	}));

	return 1000;
});

// TODO: fix the anchor calculation
// teapot('cylinder.obj', '#f00', {
// 	scale: [-0.6, -1.02, -0.6],
// 	offsetX: 1.25
// });
