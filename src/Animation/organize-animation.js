import { formatProperties } from './format-properties';

export function organizeAnimation (...parameters) {
	const animations = [];
	let animation = [];

	parameters.forEach(value => {
		if (typeof value === 'object') {
			animation = [formatProperties(value)];
			animations.push(animation);
		} else {
			animation.push(value);
		}
	});

	return animations;
}
