const identityMatrix = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
];

export function buildMatrices (properties = {}, invert, reduce) {
	const { scale, offset, rotation, tilt, spin, position } = properties;
	const sequence = [scale, offset, rotation, tilt, spin, position];

	const matrices = sequence.map((value, i) => {
		const matrix = identityMatrix.slice();
		const index = i % 6;

		if (value === undefined) {
			return;
		}

		if (index > 1 && index < 5) {
			const cos = Math.cos(value);
			const sin = Math.sin(invert ? -value : value);
			const start = 10 - (index - 2) * 5;
			const step = index === 2 ? -2 : 1;
			
			[cos, -sin, sin, cos].forEach((item, i) => {
				matrix[start + (i >= 2 ? step << 2 : 0) + (i % 2) * step] = item;
			});
		} else if (invert && reduce) {
			return;
		} else if (index === 0) {
			value.forEach((item, i) => {
				matrix[i * 5] = invert ? 1 / (item || 1) : item;
			});
		} else {
			value.forEach((item, i) => {
				matrix[i * 4 + 3] = invert ? -item : item;
			});
		}

		return matrix;
	});

	if (invert && !reduce) {
		const angles = matrices.splice(2, 3);
		matrices.reverse().splice(1, 0, ...angles);
	}

	return matrices.filter(matrix => matrix);
}
