export function attribute (gl, location, array, size, buffer) {
	const { ARRAY_BUFFER } = gl;

	buffer = buffer || gl.createBuffer();

	gl.bindBuffer(ARRAY_BUFFER, buffer);
	gl.enableVertexAttribArray(location);
	gl.bufferData(ARRAY_BUFFER, array, gl.STATIC_DRAW);
	gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);

	return buffer;
}
