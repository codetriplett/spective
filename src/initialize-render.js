import { setAttribute } from './set-attribute';
import { setSampler } from './set-sampler';

export function initializeRender ({
	gl,
	instanceLocation,
	colorLocation,
	glowLocation,
	vertexLocation,
	normalLocation,
	coordinateLocation,
	beforeRender,
	geometries,
	state
}) {
	function render () {
		const { needsRender, renderLocked, previousRender, useLight } = state;

		if (needsRender && !renderLocked) {
			const now = Date.now();
			const elapsedTime = (now - previousRender) || 0;
			const incompleteRender = beforeRender(elapsedTime);
			const defaultLight = useLight ? [0, 0, 0] : [1, 1, 1];

			state.needsRender = incompleteRender;
			state.previousRender = incompleteRender ? now : undefined;

			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.clear(gl.DEPTH_BUFFER_BIT);

			geometries.forEach(geometry => {
				const { vertices, normals, assets, vertexBuffer, normalBuffer } = geometry;
				const length = vertices.length / 3;

				geometry.vertexBuffer = setAttribute(gl, vertexLocation, vertices, 3, vertexBuffer);
				geometry.normalBuffer = setAttribute(gl, normalLocation, normals, 3, normalBuffer);

				assets.forEach(asset => {
					const { coordinates, color, instances, coordinateBuffer, colorTexture } = asset;

					if (color) {
						asset.coordinateBuffer = setAttribute(gl, coordinateLocation, coordinates, 2, coordinateBuffer);
						asset.colorTexture = setSampler(gl, colorLocation, 0, color, colorTexture);

						instances.forEach(({ matrix, light }) => {
							gl.uniformMatrix4fv(instanceLocation, false, matrix);
							gl.uniform3fv(glowLocation, useLight && light ? light : defaultLight);
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
