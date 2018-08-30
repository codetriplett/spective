import { attribute } from './attribute';
import { sampler } from './sampler';

export function render ({
	gl,
	instanceLocation,
	colorLocation,
	vertexLocation,
	coordinateLocation,
	geometries,
	state
}) {
	function frame () {
		if (state.needsRender && !state.renderLocked) {
			state.needsRender = false;

			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.clear(gl.DEPTH_BUFFER_BIT);

			geometries.forEach(geometry => {
				const { vertices, assets, vertexBuffer } = geometry;
				const length = vertices.length / 3;

				geometry.vertexBuffer = attribute(gl, vertexLocation, vertices, 3, vertexBuffer);

				assets.forEach(asset => {
					const { coordinates, color, instances, coordinateBuffer, colorTexture } = asset;

					if (color) {
						asset.coordinateBuffer = attribute(gl, coordinateLocation, coordinates, 2, coordinateBuffer);
						asset.colorTexture = sampler(gl, colorLocation, 0, color, colorTexture);

						instances.forEach(({ matrix }) => {
							gl.uniformMatrix4fv(instanceLocation, false, matrix);
							gl.drawArrays(gl.TRIANGLES, 0, length);
						});
					}
				});
			});
		}

		window.requestAnimationFrame(frame);
	}

	frame();
}
