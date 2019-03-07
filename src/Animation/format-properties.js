export function formatProperties (input) {
	const properties = { ...input };
	const { scale } = properties;

	if (typeof scale === 'number') {
		properties.scale = Array(3).fill(scale);
	}

	const dimensions = 'XYZ';
	const result = {};

	[
		'scale', 'angle', 'offset', 'heading', 'position'
	].forEach(key => {
		const array = properties[key];

		if (Array.isArray(array)) {
			array.forEach((value, i) => {
				const dimensionedKey = `${key}${dimensions[i]}`;
				const dimensionedValue = properties[dimensionedKey];

				if (typeof dimensionedValue !== 'number') {
					properties[dimensionedKey] = value;
				}
			});
		}
	});

	[
		'scaleX', 'scaleY', 'scaleZ',
		'angleX', 'angleY', 'angleZ',
		'offsetX', 'offsetY', 'offsetZ',
		'headingX', 'headingY', 'headingZ',
		'positionX', 'positionY', 'positionZ'
	].forEach(key => {
		const value = properties[key];

		if (typeof value === 'number') {
			result[key] = value;
		}
	});

	return result;
}
