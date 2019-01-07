import { setAttribute } from './set-attribute';
import { setSampler } from './set-sampler';

export function initializeRender ({
	gl,
	instanceLocation,
	inverseLocation,
	imageLocation,
	vertexLocation,
	normalLocation,
	coordinateLocation,
	beforeRender,
	geometries,
	state
}) {
	function render () {
		const { needsRender, renderLocked, previousRender } = state;

		if (needsRender && !renderLocked) {
			const now = Date.now();
			const elapsedTime = (now - previousRender) || 0;
			const needsAnotherRender = beforeRender(elapsedTime);

			state.needsRender = needsAnotherRender;
			state.previousRender = needsAnotherRender ? now : undefined;

			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.clear(gl.DEPTH_BUFFER_BIT);

			geometries.forEach(geometry => {
				const { vertices, normals, assets, vertexBuffer, normalBuffer } = geometry;
				const length = vertices.length / 3;

				geometry.vertexBuffer = setAttribute(gl, vertexLocation, vertices, 3, vertexBuffer);
				geometry.normalBuffer = setAttribute(gl, normalLocation, normals, 3, normalBuffer);

				assets.forEach(asset => {
					const { coordinates, image, instances, coordinateBuffer, imageTexture } = asset;

					if (image) {
						asset.coordinateBuffer = setAttribute(gl, coordinateLocation, coordinates, 2, coordinateBuffer);
						asset.imageTexture = setSampler(gl, imageLocation, 0, image, imageTexture);

						instances.forEach(({ matrix, inverse }) => {
							gl.uniformMatrix4fv(instanceLocation, false, matrix);
							gl.uniformMatrix4fv(inverseLocation, false, inverse);
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
