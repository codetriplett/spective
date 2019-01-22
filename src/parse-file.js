function extractArray (file, type, hasIndices) {
	const lines = file.match(new RegExp(`(^|\n)${type} [^\n]+`, 'g'));

	if (!lines) {
		return [];
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
		const value = array[index];

		return value !== undefined ? value : fallback;
	}));
}

export function parseFile (geometry, file) {
	const v = extractArray(file, 'v');

	if (v.length === 0) {
		return;
	}

	const vt = extractArray(file, 'vt');
	const vn = extractArray(file, 'vn');
	const f = extractArray(file, 'f', true);
	const vertices = [];
	const coordinates = [];
	const normals = [];
	const coordinateFallback = [0.5, 0.5];
	const normalFallback = [0.0, 0.0, 0.0];

	f.forEach(face => {
		const divisions = face.length - 1;

		for (let i = 1; i < divisions; i++) {
			const points = [face[0], face[i], face[i + 1]];

			vertices.push(...extractValues(points, 0, v));
			coordinates.push(...extractValues(points, 1, vt, coordinateFallback));
			normals.push(...extractValues(points, 2, vn, normalFallback));
		}
	});

	geometry.vertices = new Float32Array(vertices);
	geometry.coordinates = new Float32Array(coordinates);
	geometry.normals = new Float32Array(normals);
}
