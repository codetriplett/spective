export function sampler (gl, location, unit, image, texture) {
	const { TEXTURE_2D, RGBA } = gl;
	const dimensions = image instanceof Uint8Array ? [1, 1, 0] : [];

	texture = texture || gl.createTexture();

	gl.activeTexture(gl[`TEXTURE${unit}`]);
	gl.bindTexture(TEXTURE_2D, texture);
	gl.texImage2D(TEXTURE_2D, 0, RGBA, ...dimensions, RGBA, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(TEXTURE_2D);
	gl.uniform1i(location, unit);
	
	return texture;
}
