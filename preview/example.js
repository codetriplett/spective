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
	var cup = scene('24 1', '#f70', {
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

teapot('24 1', {
	scale: [0.6, 0.04, 0.6],
	offset: [1.25, -0.04, 0]
});

scene('-24', 'grid.png', { angleZ: Math.PI });

var meter = spective(
	(change, item) => {
		console.log(!change ? 'stop' : item);
		return Math.abs(change) * 1000;
	},
	'',
	(change, item) => {
		item = 1 / change < 0 ? item.slice(1) : item + item.length;

		if (item !== '' && item.length < 5) {
			return item;
		}
	}
);

meter(2);

setTimeout(() => meter(-0), 2500);
// setTimeout(() => meter(0), 3000);
// setTimeout(() => meter(-0), 6000);
// setTimeout(() => meter(2), 4000);
