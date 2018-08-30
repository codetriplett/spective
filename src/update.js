export function update (options, updates) {
	if (typeof updates !== 'object') {
		return;
	}

	for (const key in updates) {
		let value = updates[key];

		switch (key) {
			case 'scale':
			case 'rotation':
			case 'tilt':
			case 'spin':
				if (typeof value === 'number') {
					options[key] = value;
				}
				
				break;
			case 'position':
			case 'offset':
				if (!Array.isArray(value)) {
					break;
				}

				value = value.filter(item => typeof item === 'number');

				if (value.length === 3) {
					options[key] = value;
				}

				break;
		}
	}
}
