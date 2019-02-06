export function organizeAnimations (...parameters) {
	const length = parameters.length;
	const animations = [];
	let index = 0;

	while (index < length) {
		const properties = parameters[index];
		const animation = [];
		let duration;
		index++;

		if (typeof properties === 'object') {
			animation.push(properties);

			while (index < length) {
				duration = parameters[index];

				if (typeof duration === 'object') {
					break;
				}

				index++;

				if (typeof duration === 'number' || typeof duration === 'function') {
					animation.push(duration);
					break;
				}
			}

			animations.push(animation);
		}
	}

	return animations;
}
