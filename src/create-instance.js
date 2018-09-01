import { updateProperties } from './update-properties';
import { calculateMatrix } from './calculate-matrix';

export function createInstance (state, asset, ...optionArray) {
	const { instances } = asset;
	const instance = {};

	function updateInstance (...updateArray) {
		if (updateArray.length === 0) {
			instances.splice(instances.indexOf(instance), 1);
			return;
		}

		const extras = updateProperties(instance, ...updateArray);
		instance.matrix = calculateMatrix(instance, ...extras);
		
		if (asset.color) {
			state.needsRender = true;
		}
	}

	updateProperties(instance);
	updateInstance(...optionArray);
	instances.push(instance);

	return updateInstance;
}
