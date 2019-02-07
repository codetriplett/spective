export function formatProperties (input) {
	const properties = { ...input };
	const { scale } = properties;

	if (!Object.keys(properties).length) {
		return { scaleX: 1, scaleY: 1, scaleZ: 1 };
	} else if (typeof scale === 'number') {
		properties.scale = Array(3).fill(scale);
	}

	const dimensions = 'XYZ';
	const result = {};

	[
		'scale', 'offset', 'angle', 'position'
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
		'offsetX', 'offsetY', 'offsetZ',
		'angleX', 'angleY', 'angleZ',
		'positionX', 'positionY', 'positionZ'
	].forEach(key => {
		const value = properties[key];

		if (typeof value === 'number') {
			result[key] = value;
		}
	});

	return result;
}
