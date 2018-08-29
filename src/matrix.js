const identityMatrix = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
];

export function matrix (...values) {
	let result = [].concat(identityMatrix);

	values.forEach(value => {
		const composite = [].concat(result);
		let matrix = [].concat(identityMatrix);

		if (!Array.isArray(value)) {
			matrix[0] = value;
			matrix[5] = value;
			matrix[10] = value;
		} else if (value.length === 2) {
			const angle = value[1];
			const cos = Math.cos(angle);
			const sin = Math.sin(angle);

			switch (value[0]) {
				case 0:
					matrix[5] = cos;
					matrix[6] = -sin;
					matrix[9] = sin;
					matrix[10] = cos;
					break;
				case 1:
					matrix[0] = cos;
					matrix[2] = sin;
					matrix[8] = -sin;
					matrix[10] = cos;
					break;
				case 2:
					matrix[0] = cos;
					matrix[1] = -sin;
					matrix[4] = sin;
					matrix[5] = cos;
					break;
			}
		} else if (value.length === 3) {
			matrix[3] = value[0];
			matrix[7] = value[1];
			matrix[11] = value[2];
		} else if (value.length === 16) {
			matrix = value;
		}

		for (let row = 0; row < 4; row++) {
			for (let column = 0; column < 4; column++) {
				const index = row * 4;
				let value = 0;

				for (let cell = 0; cell < 4; cell++) {
					value += matrix[index + cell] * composite[cell * 4 + column];
				}

				result[index + column] = value;
			}
		}
	});

	return result;
}
