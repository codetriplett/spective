export function updateProperties (options, ...updateArray) {
	let inverted;

	if (typeof updateArray[0] === 'boolean') {
		inverted = updateArray.splice(0, 1);
	}

	if (updateArray.length === 0) {
		updateArray.push({
			scale: [1, 1, 1],
			rotation: 0,
			tilt: 0,
			spin: 0,
			position: [0, 0, 0]
		});
	}

	const cleanUpdates = updateArray.map(updates => {
		const cleanUpdate = {};

		if (typeof updates.scale === 'number') {
			updates.scale = Array(3).fill(updates.scale);
		}

		for (const key in updates) {
			let value = updates[key];
	
			switch (key) {
				case 'scale':
				case 'position':
					if (!Array.isArray(value) || value.length !== 3
							|| value.some(item => typeof item !== 'number')) {
						break;
					} else if (key !== 'scale') {
						cleanUpdate[key] = inverted ? value.map(item => -item) : value;
					} else if (!inverted || !value.some(item => item === 0)) {
						cleanUpdate[key] = inverted ? value.map(item => 1 / item) : value;
					}
	
					break;
				case 'rotation':
				case 'tilt':
				case 'spin':
					if (typeof value !== 'number') {
						break;
					} else {
						cleanUpdate[key] = inverted ? -value : value;
					}
	
					break;
			}
		}

		return cleanUpdate;
	});

	const updates = cleanUpdates.splice(0, 1)[0];

	for (const key in updates) {
		options[key] = updates[key];
	}

	return cleanUpdates;
}
