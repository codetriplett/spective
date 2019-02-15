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

			return value.split('/').map(index => {
				return index > 0 ? index - 1 : Number(index)
			});
		});
	});
}

function extractValues (points, type, array) {
	return [].concat(...points.map(point => {
		const index = point[type];
		return array ? array[index + (index < 0 ? array.length : 0)] : index;
	}));
}

export function parseFile (file) {
	const v = extractArray(file, 'v');

	if (!v) {
		return;
	}

	const vt = extractArray(file, 'vt');
	const vn = extractArray(file, 'vn');
	const f = extractArray(file, 'f', true);
	const faces = [];
	const vertices = [];
	let coordinates = [];
	let normals = [];

	f.forEach(face => {
		const divisions = face.length - 1;

		for (let i = 1; i < divisions; i++) {
			const points = [face[0], face[i], face[i + 1]];

			faces.push(...extractValues(points, 0));
			vertices.push(...extractValues(points, 0, v));

			if (vt) {
				coordinates.push(...extractValues(points, 1, vt));
			}

			if (vn) {
				normals.push(...extractValues(points, 2, vn));
			}
		}
	});

	// TODO: figure this out (should map u and v 0-1 to vertex x and y min/max)
	if (!vt) {
		coordinates = vertices.filter((value, i) => i % 3 !== 2);
	}

	if (!vn) {
		normals = calculateNormals(faces, [].concat(...v));
	}

	const minCoordinate = Math.min(...coordinates);
	const maxCoordinate = Math.max(...coordinates);

	return {
		vertices: new Float32Array(vertices),
		coordinates: new Float32Array(coordinates),
		normals: new Float32Array(normals),
		repeatTexture: minCoordinate < 0 || maxCoordinate > 1
	};
}
