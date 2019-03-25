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

function calculatePartial (points, index, percentage) {
	const partial = [];

	for (let i = 0; i < 3; i++) {
		partial.push(points[index + i] * percentage);
	}

	return partial;
}

function calculateAverage (normals, weight) {
	const length = normals.length / 3;
	const values = [0, 0, 0];
	let remainder = 1;

	if (weight === undefined) {
		weight = 1 / length;
	}

	for (let i = 0; i < length; i++) {
		const percentage = i < length - 1 ? weight : remainder;
		const partial = calculatePartial(normals, i * 3, percentage);

		partial.map((value, i) => values[i] += value);
		remainder -= weight;
	}

	return normalize(values);
}

export function calculateNormals (faces, vertices, sharpness) {
	const indices = faces.map(index => index < 0 ? vertices.length + index : index);
	const size = Math.max(...indices) + 1;
	const faceNormals = [];
	const pointNormals = [];
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
		
		faceNormals.push(normal);

		points[aId] = points[aId].concat(normal);
		points[bId] = points[bId].concat(normal);
		points[cId] = points[cId].concat(normal);
	}

	points = points.map(array => calculateAverage(array));

	for (let i = 0; i < indices.length; i += 3) {
		let aNormal = points[indices[i]];
		let bNormal = points[indices[i + 1]];
		let cNormal = points[indices[i + 2]];

		if (sharpness) {
			const faceNormal = faceNormals.shift();

			aNormal = calculateAverage(faceNormal.concat(aNormal), sharpness);
			bNormal = calculateAverage(faceNormal.concat(bNormal), sharpness);
			cNormal = calculateAverage(faceNormal.concat(cNormal), sharpness);
		}

		pointNormals.push(...aNormal, ...bNormal, ...cNormal);
	}
	
	return pointNormals;
}
