import { updateItem } from './update-item';

export function createInstance (geometrySource, ...creationParameters) {
	const { updateItem, loadAsset, geometries } = this;
	let assetSource = creationParameters[0];
	const instance = {};

	if (typeof assetSource !== 'string') {
		assetSource = '#fff';
	} else {
		creationParameters.shift();
	}

	const asset = loadAsset(geometrySource, assetSource);

	if (!creationParameters.length) {
		return;
	}
	
	asset.instances.push(instance);
	updateItem(instance, ...creationParameters);

	return (...updateParameters) => {
		if (!updateParameters.length) {
			const instances = asset.instances;
			instances.splice(instances.indexOf(instance), 1);
	
			if (!instances.length) {
				const assets = geometries[geometrySource].assets;
				delete assets[assetSource];
	
				if (!Object.keys(assets).length) {
					delete geometries[geometrySource];
				}
			}

			return;
		}

		updateItem(instance, ...updateParameters);
	};
}
