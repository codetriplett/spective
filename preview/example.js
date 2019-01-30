var scene = spective({
	tilt: Math.PI / 4,
	position: [0, -0.125, -4]
});

scene(function (progress) {
	return progress * 2 * Math.PI
}, function () {
	return 18000;
});

var cubes = [];
var frames = 0;

var teapot = scene('teapot.obj', '#07f', function (progress, iteration) {
	frames++;
	return { rotation: (iteration + progress) * Math.PI / 3 }
}, function (iteration) {
	if (iteration) {
		document.querySelector('p').innerText = frames + ' fps';
		frames = 0;
	
		if (iteration > 5) {
			cubes.splice(0, 1)[0]();
		}
	}

	const angle = (iteration + 0.25) * Math.PI / 3;

	cubes.push(scene('cylinder.obj', '#f70', (progress, iteration) => ({
		scale: [0.2, (iteration ? (1 - progress) : progress) * 0.2 + 0.02, 0.2],
		position: [Math.cos(angle) * 1.25, 0, Math.sin(angle) * -1.25]
	}), iteration => [250, 5750][iteration]));

	return 1000;
});

teapot('cylinder.obj', '#373', {
	scale: [0.3, -0.02, 0.3],
	position: [1.25, 0, 0]
});
