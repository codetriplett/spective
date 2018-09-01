import { setAttribute } from './set-attribute';
import { setSampler } from './set-sampler';

export function initializeRender ({
	gl,
	instanceLocation,
	colorLocation,
	vertexLocation,
	coordinateLocation,
	geometries,
	state
}) {
	function render () {
		if (state.needsRender && !state.renderLocked) {
			state.needsRender = false;

			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.clear(gl.DEPTH_BUFFER_BIT);

			geometries.forEach(geometry => {
				const { vertices, assets, vertexBuffer } = geometry;
				const length = vertices.length / 3;

				geometry.vertexBuffer = setAttribute(gl, vertexLocation, vertices, 3, vertexBuffer);

				assets.forEach(asset => {
					const { coordinates, color, instances, coordinateBuffer, colorTexture } = asset;

					if (color) {
						asset.coordinateBuffer = setAttribute(gl, coordinateLocation, coordinates, 2, coordinateBuffer);
						asset.colorTexture = setSampler(gl, colorLocation, 0, color, colorTexture);

						instances.forEach(({ matrix }) => {
							gl.uniformMatrix4fv(instanceLocation, false, matrix);
							gl.drawArrays(gl.TRIANGLES, 0, length);
						});
					}
				});
			});
		}

		window.requestAnimationFrame(render);
	}

	render();
}
