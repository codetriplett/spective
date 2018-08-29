export function resize ({ gl, perspectiveLocation, canvas, state }) {
	const { clientWidth: width, clientHeight: height } = canvas;

	canvas.width = width;
	canvas.height = height;
	gl.viewport(0, 0, width, height);

	const max = Math.max(width, height);
	const field = Math.PI / 4;
	const near = 1;
	const far = 1000;
	const fieldScale = Math.tan((Math.PI - field) / 2);
	const inverseRange = -1 / (near - far);

	gl.uniformMatrix4fv(perspectiveLocation, false, [
		fieldScale * max / width, 0, 0, 0,
		0, fieldScale * max / height, 0, 0,
		0, 0, (near + far) * inverseRange, -2,
		0, 0, near * far * inverseRange * 2, 0
	]);

	state.needsRender = true;
}
