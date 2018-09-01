export function calculateMatrix (...propertiesArray) {
	let compositeMatrix;

	propertiesArray.forEach(properties => {
		const matrices = Object.keys(properties).map(key => {
			let value = properties[key];

			const matrix = [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			];

			switch (key) {
				case 'scale':
					matrix[0] = value[0];
					matrix[5] = value[1];
					matrix[10] = value[2];

					break;
				case 'rotation':
				case 'tilt':
				case 'spin': {
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

					break;
				}
				case 'position':
					matrix[3] = value[0];
					matrix[7] = value[1];
					matrix[11] = value[2];

					break;
			}

			return matrix;
		});

		if (compositeMatrix) {
			matrices.splice(0, 0, compositeMatrix);
		}

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
	});

	return compositeMatrix;
}
