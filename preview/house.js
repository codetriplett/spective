var scene = window.spective();

scene({
	tilt: Math.PI / 4,
	offset: [0, 0, -6]
});

var geometry = scene([
	0, 1, 2, 3, 2, 1
], [
	-1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, 1
]);

var asset = geometry([
	0, 0, 1, 0, 0, 1, 1, 1
], 'grid.png');

asset({
	position: [0, 0.5, 0],
	rotation: Math.PI / 4
});
