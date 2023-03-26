export function addMatrices (...matrices) {
	return matrices.reduce((a, b) => [a[0] + b[0], a[1] + b[1]]);
}

export function multiplyMatrices (...matrices) {
	return matrices.reduce((a, b) => {
		const matrix = [];

		for (let i = 0; i < a.length; i += 2) {
			matrix.push(a[i] * b[0] + a[i + 1] * b[1], a[i] * b[2] + a[i + 1] * b[3]);
		}

		return matrix;
	});
}
