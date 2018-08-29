var scene = window.spective();

scene({
	rotation: Math.PI / 4,
	tilt: Math.PI / 4,
	offset: [0, 0, -6]
});

var square = scene([
	0, 1, 2,
	3, 2, 1
], [
	-1, 0, -1, 1, 0, -1,
	-1, 0, 1, 1, 0, 1
]);

var gridSquare = square([
	0, 0, 1, 0,
	0, 1, 1, 1
], 'grid.png');

gridSquare({});
