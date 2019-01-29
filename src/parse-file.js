import { calculateNormals } from './calculate-normals';

function extractArray (file, type, hasIndices) {
	const lines = file.match(new RegExp(`(^|\n)${type} [^\n]+`, 'g'));

	if (!lines) {
		return;
	}

	return lines.map(line => {
		const values = line.split(/ +/).slice(1);

		return values.map(value => {
			if (!hasIndices) {
				return Number(value);
			}

			return value.split('/').map(index => index ? Number(index) - 1 : undefined);
		});
	});
}

function extractValues (points, type, array, fallback) {
	return [].concat(...points.map(point => {
		const index = point[type];

		if (!array) {
			return index;
		}

		const value = array[index];
		return value !== undefined ? value : fallback;
	}));
}

export function parseFile (file) {
	const v = extractArray(file, 'v');

	if (!v) {
		return;
	}

	const vt = extractArray(file, 'vt') || [];
	const vn = extractArray(file, 'vn');
	const f = extractArray(file, 'f', true);
	const faces = [];
	const vertices = [];
	const coordinates = [];
	const normals = [];
	const coordinateFallback = [0.5, 0.5];

	f.forEach(face => {
		const divisions = face.length - 1;

		for (let i = 1; i < divisions; i++) {
			const points = [face[0], face[i], face[i + 1]];

			faces.push(...extractValues(points, 0));
			vertices.push(...extractValues(points, 0, v));
			coordinates.push(...extractValues(points, 1, vt, coordinateFallback));

			if (vn) {
				normals.push(...extractValues(points, 2, vn));
			}
		}
	});

	return {
		vertices: new Float32Array(vertices),
		coordinates: new Float32Array(coordinates),
		normals: vn ? new Float32Array(normals) : calculateNormals(faces, [].concat(...v))
	};
}
