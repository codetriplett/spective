function calculateArea (aH, aV, bH, bV, cH, cV) {
	return (aH * (bV - cV) + bH * (cV - aV) + cH * (aV - bV)) / 2;
}

function normalize (vector) {
	const max = Math.max(...vector.map(value => Math.abs(value)));

	if (max === 0) {
		return vector;
	}

	return vector.map(value => value / max);
}

function calculateNormal (a, b, c) {
	const xArea = calculateArea(a[1], a[2], b[1], b[2], c[1], c[2]);
	const yArea = calculateArea(a[2], a[0], b[2], b[0], c[2], c[0]);
	const zArea = calculateArea(a[0], a[1], b[0], b[1], c[0], c[1]);

	return normalize([xArea, yArea, zArea]);
}

function calculateAverage (normals) {
	const length = normals.length / 3;
	const totals = [0, 0, 0];

	for (let i = 0; i < normals.length; i += 3) {
		totals[0] += normals[i];
		totals[1] += normals[i + 1];
		totals[2] += normals[i + 2];
	}

	return normalize(totals.map(total => total / length));
}

export function calculateNormals (faces, vertices) {
	const size = Math.max(...faces) + 1;
	const normals = [];
	let map = [];

	for (let i = 0; i < size; i++) {
		map[i] = [];
	}

	for (let i = 0; i < faces.length; i += 3) {
		const aId = faces[i];
		const bId = faces[i + 1];
		const cId = faces[i + 2];
		const aStart = aId * 3;
		const bStart = bId * 3;
		const cStart = cId * 3;
		const a = vertices.slice(aStart, aStart + 3);
		const b = vertices.slice(bStart, bStart + 3);
		const c = vertices.slice(cStart, cStart + 3);
		const normal = calculateNormal(a, b, c);

		map[aId] = map[aId].concat(normal);
		map[bId] = map[bId].concat(normal);
		map[cId] = map[cId].concat(normal);
	}

	map = map.map(calculateAverage);

	for (let i = 0; i < faces.length; i += 3) {
		const aNormal = map[faces[i]];
		const bNormal = map[faces[i + 1]];
		const cNormal = map[faces[i + 2]];

		normals.push(...aNormal, ...bNormal, ...cNormal);
	}
	
	return normals;
}
