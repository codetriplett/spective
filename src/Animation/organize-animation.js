const propertiesRegex = /^object$/;
const durationRegex = /^(number|function)$/;
const callbackRegex = /^function$/;

export function organizeAnimation (...parameters) {
	const length = parameters.length;
	const animations = [];
	let animation = [];
	let index = 0;
	let animationLength = 0;

	while (index < length) {
		const value = parameters[index];
		const type = typeof value;
		index++;

		if (propertiesRegex.test(type) && animationLength) {
			animations.push(animation);
			animation = [];
		}

		if (propertiesRegex.test(type)
				|| animationLength === 1 && durationRegex.test(type)
				|| animationLength === 2 && callbackRegex.test(type)) {
			animationLength = animation.push(value);
		}
	}

	if (animationLength) {
		animations.push(animation);
	}

	return animations;
}
