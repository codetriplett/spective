export function sampler (gl, location, unit, image, texture) {
	const { TEXTURE_2D, RGBA, LINEAR, CLAMP_TO_EDGE } = gl;

	texture = texture || gl.createTexture();

	gl.activeTexture(gl[`TEXTURE${unit}`]);
	gl.bindTexture(TEXTURE_2D, texture);
	gl.texImage2D(TEXTURE_2D, 0, RGBA, RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(TEXTURE_2D, gl.TEXTURE_MAG_FILTER, LINEAR);
	gl.texParameteri(TEXTURE_2D, gl.TEXTURE_MIN_FILTER, LINEAR);
	gl.texParameteri(TEXTURE_2D, gl.TEXTURE_WRAP_S, CLAMP_TO_EDGE);
	gl.texParameteri(TEXTURE_2D, gl.TEXTURE_WRAP_T, CLAMP_TO_EDGE);
	gl.uniform1i(location, unit);

	return texture;
}
