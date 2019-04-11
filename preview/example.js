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
	function (change) {
		return Math.abs(change) * 1000;
	},
	function (main, side) {
		var item = main.startsWith('correct ') || !side ? main : side;
		console.log(item);
		return item;
	},
	function (item) {
		return item + '.';
	}
);

meter([
	'incorrect',
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
	'correct (5)',
	'correct (6)'
]);

[
	['fill by 4 (1 2 3)', 4], 3500,
	['reverse (1 0)', -0], 2000,
	['interrupt and fill by 1 (2)', 1], 1000,
	['continue (3 5 6)', 0], 3000,
	['reverse (4)', -0], 1000,
	['stop']
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

spective('space', function () {
	return 200;
}, function (stage) {
	switch (stage) {
		case 2:
			console.log('slip');
			return;
		case -2:
			console.log('tap');
			return;
	}

	if(stage > 0) {
		console.log('hold');
	} else {
		console.log('release');
	}
});
