import { calculateMatrix } from './calculate-matrix';

export function createInstance (state, asset, ...propertyArray) {
	const { instances } = asset;
	const instance = [];

	function updateInstance (...updateArray) {
		if (updateArray.length === 0) {
			instances.splice(instances.indexOf(instance), 1);
			return;
		}

		instance.splice(0, 16, ...calculateMatrix(...updateArray));
		
		if (asset.color) {
			state.needsRender = true;
		}
	}

	updateInstance(...propertyArray);
	instances.push(instance);

	return updateInstance;
}
