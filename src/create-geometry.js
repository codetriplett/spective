import { expandPoints } from './expand-points';
import { calculateNormals } from './calculate-normals';
import { createAsset } from './create-asset';

export function createGeometry (state, geometries, faces, vertices, normals) {
	const length = Math.max(...faces) + 1;
	const assets = [];

	if (normals === undefined) {
		normals = calculateNormals(faces, vertices);
	}

	const geometry = {
		length,
		faces,
		vertices: expandPoints(length, faces, vertices),
		normals,
		assets
	};

	geometries.push(geometry);

	return (source, coordinates, callback) => {
		if (source === undefined && coordinates === undefined) {
			geometries.splice(geometries.indexOf(geometry), 1);
			state.needsRender = true;

			return;
		}

		return createAsset(state, geometry, source, coordinates, callback);
	};
}
