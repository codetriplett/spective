const identityMatrix = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
];

export function buildMatrices (properties = {}, invert, reduce) {
	const {
		positionX, positionY, positionZ,
		angleX, angleY, angleZ,
		offsetX, offsetY, offsetZ,
		scaleX, scaleY, scaleZ
	} = properties;

	const hasPosition = [positionX, positionY, positionZ].some(value => value !== undefined);
	const hasOffset = [offsetX, offsetY, offsetZ].some(value => value !== undefined);
	const hasScale = [scaleX, scaleY, scaleZ].some(value => value !== undefined);

	const sequence = [
		hasPosition ? [positionX, positionY, positionZ] : undefined,
		angleZ, angleX, angleY,
		hasOffset ? [offsetX, offsetY, offsetZ] : undefined,
		hasScale ? [scaleX, scaleY, scaleZ] : undefined
	];

	const matrices = sequence.map((value, index) => {
		const matrix = identityMatrix.slice();

		if (value === undefined) {
			return;
		}

		if (index > 0 && index < 4) {
			const cos = Math.cos(value);
			const sin = Math.sin(invert ? -value : value);
			const start = (index - 1) * 5;
			const step = index === 3 ? -2 : 1;

			[cos, sin, -sin, cos].forEach((item, i) => {
				matrix[start + (i >= 2 ? step << 2 : 0) + (i % 2) * step] = item;
			});
		} else if (invert && reduce) {
			return;
		} else if (index === 5) {
			value.forEach((item = 1, i) => {
				matrix[i * 5] = invert ? 1 / (item || 1) : item;
			});
		} else {
			value.forEach((item = 0, i) => {
				matrix[12 + i] = invert ? -item : item;
			});
		}

		return matrix;
	});

	if (invert && !reduce) {
		const angles = matrices.splice(1, 3);
		matrices.reverse().splice(2, 0, ...angles);
	}

	return matrices.filter(matrix => matrix);
}
