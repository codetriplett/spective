var scene = spective({
	offset: [0, -0.125, 4],
	headingX: -Math.PI / 4
}, {
	headingY: 2 * Math.PI
}, function () {
	return 18000;
});

var cups = Array(6).fill(function () {});

var teapot = scene('teapot.obj', 'grid.png', {
	angleY: Math.PI / 3
}, function (iteration) {
	var cup = scene('cylinder.obj', '#f70', {
		scale: [0.4, 0.04, 0.4],
		offsetX: 1.25,
		headingY: iteration * Math.PI / 3 + 0.2
	}, {
		scaleY: 0.4
	}, 250, {
		scaleY: 0.04
	}, 5750);

	cups.splice(iteration % 6, 1, cup)[0]();

	return 1000;
});

teapot('cylinder.obj', {
	scale: [0.6, 0.04, 0.6],
	offset: [1.25, -0.04, 0]
});

var meter = spective(
	iterator => console.log('first', iterator),
	iterator => console.log('second', iterator),
	iterator => console.log('third', iterator)
);

meter(2, 2000);
setTimeout(() => meter(-2, 2000), 3000);

setTimeout(() => console.log(meter()), 500);
setTimeout(() => console.log(meter()), 1500);
setTimeout(() => console.log(meter()), 3500);
setTimeout(() => console.log(meter()), 4500);

setTimeout(() => {
	meter(1.5);
	console.log(meter());
}, 6000);
