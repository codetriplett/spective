export function setSampler (gl, location, unit, image, texture) {
	const { TEXTURE_2D, RGBA, CLAMP_TO_EDGE } = gl;
	const isColor = image instanceof Uint8Array;
	const dimensions = isColor ? [image.length / 4, 1, 0] : [];

	texture = texture || gl.createTexture();

	gl.activeTexture(gl[`TEXTURE${unit}`]);
	gl.bindTexture(TEXTURE_2D, texture);
	gl.texImage2D(TEXTURE_2D, 0, RGBA, ...dimensions, RGBA, gl.UNSIGNED_BYTE, image);

	if (isColor) {
		gl.texParameteri(TEXTURE_2D, gl.TEXTURE_WRAP_S, CLAMP_TO_EDGE);
		gl.texParameteri(TEXTURE_2D, gl.TEXTURE_WRAP_T, CLAMP_TO_EDGE);
		gl.texParameteri(TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	} else {
		gl.generateMipmap(TEXTURE_2D);
	}

	gl.uniform1i(location, unit);
	
	return texture;
}
