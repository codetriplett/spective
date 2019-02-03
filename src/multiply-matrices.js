export function multiplyMatrices (matrices) {
	return matrices.reduce((previous, matrix) => {
		if (!matrix) {
			return previous;
		}

		const composite = [];

		for (let row = 0; row < 4; row++) {
			for (let column = 0; column < 4; column++) {
				const index = row * 4;
				let value = 0;

				for (let cell = 0; cell < 4; cell++) {
					value += matrix[index + cell] * previous[cell * 4 + column];
				}

				composite[index + column] = value;
			}
		}

		return composite;
	});
}
