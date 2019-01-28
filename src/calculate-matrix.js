const identityMatrix = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
];

export function calculateMatrix (inverted, properties, anchorMatrix) {
	let matrices = [];

	if (typeof properties === 'number') {
		matrices.push(undefined, properties);
	} else if (typeof properties === 'object') {
		const { scale, rotation, tilt, spin, position } = properties;
		matrices.push(scale, rotation, tilt, spin, position);
	}

	matrices = matrices.map((value, i) => {
		const matrix = [].concat(identityMatrix);
		let isNumber = typeof value === 'number';
		let isNumberArray = Array.isArray(value) && value.length === 3
				&& value.every(item => typeof item === 'number');
		
		if (i === 0) {
			if (isNumber) {
				value = Array(3).fill(value);
				isNumberArray = true;
			}

			if (isNumberArray) {
				if (inverted) {
					if (value.some(item => item === 0)) {
						return;
					}

					value = value.map(item => 1 / item);
				}

				matrix[0] = value[0];
				matrix[5] = value[1];
				matrix[10] = value[2];
				
				return matrix;
			}
		} else if (i < 4 && isNumber) {
			if (inverted) {
				value = -value;
			}

			const cos = Math.cos(value);
			let sin = Math.sin(value);
			let indexStart = 0;
			let indexStep = 1;

			if (i === 1) {
				sin = -sin;
				indexStep = 2;
			} else if (i === 2) {
				indexStart = 5;
			}

			matrix[indexStart] = cos;
			matrix[indexStart + indexStep] = -sin;
			indexStart += indexStep * 4;
			matrix[indexStart] = sin;
			matrix[indexStart + indexStep] = cos;
			
			return matrix;
		} else if (i === 4 && isNumberArray) {
			if (inverted) {
				value = value.map(item => -item);
			}

			matrix[3] = value[0];
			matrix[7] = value[1];
			matrix[11] = value[2];
			
			return matrix;
		}
	});

	if (matrices.every(matrix => !matrix)) {
		return [].concat(identityMatrix);
	}

	if (Array.isArray(anchorMatrix) && anchorMatrix.length >= 32) {
		matrices.push(anchorMatrix.slice(inverted ? 16 : 0));
	}

	return matrices.reduce((previousMatrix, matrix) => {
		if (!matrix) {
			return previousMatrix;
		} else if (!previousMatrix) {
			return matrix;
		}

		const compositeMatrix = [];

		for (let row = 0; row < 4; row++) {
			for (let column = 0; column < 4; column++) {
				const index = row * 4;
				let value = 0;

				for (let cell = 0; cell < 4; cell++) {
					value += matrix[index + cell] * previousMatrix[cell * 4 + column];
				}

				compositeMatrix[index + column] = value;
			}
		}

		return compositeMatrix;
	});
}
