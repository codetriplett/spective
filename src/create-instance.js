import { updateProperties } from './update-properties';

export function createInstance (state, asset, ...propertyArray) {
	const { instances } = asset;
	const instance = { matrix: [] };

	function updateInstance (...updateArray) {
		if (asset.color) {
			state.needsRender = true;
		}

		if (updateArray.length === 0) {
			instances.splice(instances.indexOf(instance), 1);
			return;
		}

		updateProperties(state, instance, ...updateArray);
	}

	updateInstance(...propertyArray);
	instances.push(instance);

	return updateInstance;
}
