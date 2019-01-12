import { expandPoints } from './expand-points';
import { calculateNormals } from './calculate-normals';
import { createAsset } from './create-asset';

export function createGeometry (state, geometries, vertices, faces, normals) {
	const assets = [];

	if (faces === undefined) {
		faces = Array(vertices.length / 3).fill(0).map((value, i) => i);
	}

	if (normals === undefined) {
		normals = calculateNormals(faces, vertices);
	} else {
		normals = new Float32Array(normals);
	}

	const length = Math.max(...faces) + 1;

	const geometry = {
		length,
		vertices: expandPoints(length, faces, vertices),
		faces,
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
