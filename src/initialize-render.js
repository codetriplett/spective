import { setAttribute } from './set-attribute';
import { setSampler } from './set-sampler';

export function initializeRender ({
	gl,
	instanceLocation,
	colorLocation,
	vertexLocation,
	coordinateLocation,
	beforeRender,
	geometries,
	state
}) {
	function render () {
		if (state.needsRender && !state.renderLocked) {
			const now = Date.now();
			const elapsedTime = (now - state.previousRender) || 0;
			const incompleteRender = beforeRender(elapsedTime);

			state.needsRender = incompleteRender;
			state.previousRender = incompleteRender ? now : undefined;

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

						instances.forEach(instance => {
							gl.uniformMatrix4fv(instanceLocation, false, instance);
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
