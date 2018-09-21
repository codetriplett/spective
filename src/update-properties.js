import { calculateMatrix } from './calculate-matrix';

export function updateProperties (state, properties, ...propertyArray) {
	const workingArray = [...propertyArray];
	let inverted;

	if (typeof workingArray[0] === 'boolean') {
		inverted = workingArray.shift();
	}

	const updateIntensity = typeof workingArray[0] === 'number';

	if (updateIntensity || Array.isArray(workingArray[0])) {
		if (updateIntensity) {
			properties.intensity = workingArray.shift();
		}

		if (Array.isArray(workingArray[0])) {
			properties.color = workingArray.shift().map(value => value / 255);
		}

		const { intensity = 0, color = [1, 1, 1] } = properties;

		properties.light = color.map(value => value * intensity);
		state.useLight = true;
	}

	if (!updateIntensity || workingArray.length > 0 || !properties.matrix) {
		if (inverted !== undefined) {
			workingArray.unshift(inverted);
		}

		properties.matrix = calculateMatrix(...workingArray);
	}
}
