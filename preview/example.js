var scene = spective({
	offset: [0, -0.125, -4],
	tilt: Math.PI / 4
})(progress => progress * 2 * Math.PI, function () {
	return 18000;
});

var cups = [];
var teapotIteration;

var teapot = scene('teapot.obj', '#07f', 0.1)(progress => (teapotIteration + progress) * Math.PI / 3, function (iteration) {
	if (iteration > 5) {
		cups.splice(0, 1)[0]();
	}

	teapotIteration = iteration;
	var cupIteration;

	cups.push(scene('cylinder.obj', '#f70', progress => ({
		scale: [0.2, (cupIteration ? (1 - progress) : progress) * 0.2 + 0.02, 0.2],
		offset: [1.25, 0, 0],
		rotation: iteration * Math.PI / 3
	}), iteration => {
		cupIteration = iteration;
		return [250, 5750][iteration]
	}));

	return 1000;
});

teapot('cylinder.obj', {
	scale: [0.3, -0.02, 0.3],
	offset: [1.25, 0, 0]
});
