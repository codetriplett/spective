var scene = spective(function (progress) {
	return {
		rotation: progress * 2 * Math.PI,
		tilt: Math.PI / 4,
		position: [0, -0.125, -4]
	};
}, function () {
	return 18000;
});

var cubes = [];

scene('teapot.obj', '#07f', function (progress, iteration) {
	return { rotation: (iteration + progress) * Math.PI / 3 }
}, function (iteration, frames) {
	if (iteration) {
		document.querySelector('p').innerText = frames + ' fps';
	
		if (iteration > 5) {
			cubes.splice(0, 1)[0]();
		}
	}

	const angle = (iteration + 0.25) * Math.PI / 3;

	cubes.push(scene('cylinder.obj', '#f70', (progress, iteration) => ({
		scale: [0.2, (iteration ? (1 - progress) : progress) * 0.2, 0.2],
		position: [Math.cos(angle) * 1.25, 0, Math.sin(angle) * -1.25]
	}), iteration => [250, 5750][iteration]));

	return 1000;
});
