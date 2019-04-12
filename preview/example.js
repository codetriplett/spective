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
	function (change, item, count) {
		this.count = (this.count || 0) + 1;
		console.log(item, count);
		return Math.abs(change) * 1000;
	},
	function (main, side) {
		if (!main) {
			return 'custom #' + this.count;
		}

		return main.startsWith('correct ') || !side ? main : side;
	},
	function (item) {
		return item + '.';
	}
);

meter([
	'initialized',
	'correct (0)',
	'correct (1)',
	'correct (2)',
	[
		'correct (3)',
		[
			'incorrect'
		],
		8
	],
	'incorrect',
	'correct (4)',
	'correct (5)'
]);

[
	['fill by 4 (0 1 2 3)', 4], 3500,
	['reverse (2 1 0)', -0], 2000,
	['interrupt and fill by 1 (1 2)', 1], 1000,
	['continue (2 3 5 4)', 0], 3000,
	['reverse (5 15 16)', -0], 2000,
	['interrupt and drain by 2 (15 5 4)', -2], 2000,
	['stop (4)']
].reduce(function (delay, options) {
	if (options > 0) {
		return delay + options;
	}

	setTimeout(function () {
		console.log(options[0]);
		meter(options[1]);
	}, delay);

	return delay;
}, 0);

spective('space', function (stage, iteration) {
	switch (stage) {
		case 2:
			console.log('slip');
			return;
		case -2:
			console.log('tap');
			return;
	}

	if (!iteration) {
		return 200;
	} else if (stage > 0) {
		console.log('hold');
	} else {
		console.log('release');
	}
});
