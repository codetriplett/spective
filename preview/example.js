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
	'',
	function (change, item) {
		if (item) console.log(item);

		item = 1 / change < 0 ? item.slice(1) : item + item.length;

		if (item !== '' && item.length < 6) {
			return item;
		}
	}
);

[
	['fill by 4 (0 01 012)', 4], 3500,
	['reverse (012 12)', -0], 2000,
	['interrupt and fill by 1 (12)', 1], 1000,
	['continue (122 1223)', 0], 2000,
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

spective('space', function (stage) {
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
