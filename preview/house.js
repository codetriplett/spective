var camera = {
	rotation: 0,
	tilt: Math.PI / 4,
	position: [0, 0, -6]
};

var scene = window.spective(camera, function (elapsedTime) {
	camera.rotation += elapsedTime / 1300;
	scene(camera);

	return true;
});

var geometry = scene([
	0, 1, 2, 3, 2, 1
], [
	-1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, 1
]);

var asset = geometry('grid.png', [
	0, 0, 4.0625, 0, 0, 4.0625, 4.0625, 4.0625
], function (name) {
	console.log(name + ' loaded');
});

asset({
	position: [0, 0.5, 0],
	rotation: Math.PI / 4
});
