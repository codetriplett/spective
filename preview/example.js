/*

var scene = spective(canvas, ...); // create scene
scene(...); // update camera
scene(); // toggle render

var instance = scene('object.obj', 'image.jpg', ...); // create instance
instance(...); // update instance
instance(); // remove instance

var child = instance('object.obj', 'image.jpg', ...); // create chained instance
child(...); // update chained instance
child(); // remove chained instance

*/


var scene = spective(progress => ({
	rotation: progress * 2 * Math.PI,
	tilt: Math.PI / 4,
	position: [0, 0.25, -4]
}), () => 18000);

scene('teapot.obj', '#07f', progress => ({
	rotation: progress * 2 * Math.PI
}), () => 6000);

scene('cube.obj', '#f70', {
	scale: 0.2,
	position: [1.25, 0.5, 0]
});
