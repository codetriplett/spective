function calculateArea (aH, aV, bH, bV, cH, cV) {
	return -(aH * (bV - cV) + bH * (cV - aV) + cH * (aV - bV)) / 2;
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

export function calculateNormals (faces, vertices) {
	const normals = new Float32Array(faces.length * 3);

	for (let i = 0; i < faces.length; i += 3) {
		const aStart = faces[i] * 3;
		const bStart = faces[i + 1] * 3;
		const cStart = faces[i + 2] * 3;
		const a = vertices.slice(aStart, aStart + 3);
		const b = vertices.slice(bStart, bStart + 3);
		const c = vertices.slice(cStart, cStart + 3);
		const normal = calculateNormal(a, b, c);

		normals.set([...normal, ...normal, ...normal], i * 3);
	}

	return normals;
}
