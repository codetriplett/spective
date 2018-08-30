export function invert (options) {
	const result = {};

	Object.keys(options).forEach(key => {
		const value = options[key];

		switch (key) {
			case 'scale':
				result[key] = 1 / value;
				break;
			case 'rotation':
			case 'tilt':
			case 'spin':
				result[key] = -value;
				break;
			case 'position':
			case 'offset':
				result[key] = value.map(item => -item);
				break;
		}
	});

	return result;
}
