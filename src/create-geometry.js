import { expandPoints } from './expand-points';
import { calculateNormals } from './calculate-normals';
import { createAsset } from './create-asset';

export function createGeometry (state, geometries, vertices, faces, normals) {
	const assets = [];

	if (faces === undefined) {
		vertices = vertices.slice(0, Math.floor(vertices.length / 9) * 9);
		faces = Array(vertices.length / 3).fill(0).map((value, i) => i);
	}

	if (normals === undefined) {
		normals = calculateNormals(faces, vertices);
	} else {
		normals = new Float32Array(normals);
	}

	const geometry = {
		vertices: expandPoints(3, faces, vertices),
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
