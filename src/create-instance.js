import { calculateMatrix } from './calculate-matrix';

export function createInstance (state, asset, ...propertyArray) {
	const { instances } = asset;
	const instance = { matrix: [] };

	function updater (...updateArray) {
		if (asset.image) {
			state.needsRender = true;
		}

		if (updateArray.length === 0) {
			instances.splice(instances.indexOf(instance), 1);
			return;
		}

		instance.matrix = calculateMatrix(...updateArray);
		instance.inverse = calculateMatrix(true, ...updateArray);
	}

	updater(...propertyArray);
	instances.push(instance);

	return updater;
}
