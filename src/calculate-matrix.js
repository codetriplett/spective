const identityMatrix = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1
];

export function calculateMatrix (...propertiesArray) {
	let compositeMatrix;
	let inverted;

	if (typeof propertiesArray[0] === 'boolean') {
		inverted = propertiesArray.splice(0, 1);
	}

	propertiesArray.forEach(properties => {
		const matrices = [];
		
		Object.keys(properties || {}).forEach(key => {
			const matrix = [].concat(identityMatrix);
			let value = properties[key];
			let isNumber = typeof value === 'number';
			let isNumberArray = Array.isArray(value) && value.length === 3
					&& value.every(item => typeof item === 'number');

			switch (key) {
				case 'scale':
					if (isNumber) {
						value = Array(3).fill(value);
						isNumberArray = true;
					}

					if (isNumberArray) {
						if (inverted) {
							if (value.some(item => item === 0)) {
								break;
							}

							value = value.map(item => 1 / item);
						}

						matrix[0] = value[0];
						matrix[5] = value[1];
						matrix[10] = value[2];
						matrices.push(matrix);
					}

					break;
				case 'rotation':
				case 'tilt':
				case 'spin': {
					if (isNumber) {
						if (inverted) {
							value = -value;
						}

						const cos = Math.cos(value);
						let sin = Math.sin(value);
						let indexStart = 0;
						let indexStep = 1;

						if (key === 'rotation') {
							sin = -sin;
							indexStep = 2;
						} else if (key === 'tilt') {
							indexStart = 5;
						}

						matrix[indexStart] = cos;
						matrix[indexStart + indexStep] = -sin;
						indexStart += indexStep * 4;
						matrix[indexStart] = sin;
						matrix[indexStart + indexStep] = cos;
						matrices.push(matrix);
					}

					break;
				}
				case 'position':
					if (isNumberArray) {
						if (inverted) {
							value = value.map(item => -item);
						}

						matrix[3] = value[0];
						matrix[7] = value[1];
						matrix[11] = value[2];
						matrices.push(matrix);
					}

					break;
			}
		});

		if (compositeMatrix) {
			matrices.splice(0, 0, compositeMatrix);
		}

		if (matrices.length === 1) {
			compositeMatrix = matrices[0];
		} else if (matrices.length > 1) {
			compositeMatrix = matrices.reduce((previousMatrix, matrix) => {
				compositeMatrix = [];

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
	});

	return compositeMatrix ? compositeMatrix : [].concat(identityMatrix);
}
