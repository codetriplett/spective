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
	const indices = faces.map(index => index < 0 ? vertices.length + index : index);
	const size = Math.max(...indices) + 1;
	const normals = [];
	let points = [];

	for (let i = 0; i < size; i++) {
		points[i] = [];
	}

	for (let i = 0; i < indices.length; i += 3) {
		const aId = indices[i];
		const bId = indices[i + 1];
		const cId = indices[i + 2];
		const aStart = aId * 3;
		const bStart = bId * 3;
		const cStart = cId * 3;
		const a = vertices.slice(aStart, aStart + 3);
		const b = vertices.slice(bStart, bStart + 3);
		const c = vertices.slice(cStart, cStart + 3);
		const normal = calculateNormal(a, b, c);

		points[aId] = points[aId].concat(normal);
		points[bId] = points[bId].concat(normal);
		points[cId] = points[cId].concat(normal);
	}

	points = points.map(calculateAverage);

	for (let i = 0; i < indices.length; i += 3) {
		const aNormal = points[indices[i]];
		const bNormal = points[indices[i + 1]];
		const cNormal = points[indices[i + 2]];

		normals.push(...aNormal, ...bNormal, ...cNormal);
	}
	
	return normals;
}
