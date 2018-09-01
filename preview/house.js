var camera = {
	tilt: Math.PI / 4,
	position: [0, 0, -6]
};

var scene = window.spective(camera);

var geometry = scene([
	0, 1, 2, 3, 2, 1
], [
	-1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, 1
]);

var asset = geometry('grid.png', [
	0, 0, 4.0625, 0, 0, 4.0625, 4.0625, 4.0625
]);

asset({
	position: [0, 0.5, 0],
	rotation: Math.PI / 4
});

function rotateCamera () {
	camera.rotation = Math.PI * Date.now() / 13000;
	scene(camera);
	requestAnimationFrame(rotateCamera);
}

rotateCamera();
