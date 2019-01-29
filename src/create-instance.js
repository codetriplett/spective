import { loadGeometry } from './load-geometry';
import { loadAsset } from './load-asset';
import { updateItem } from './update-item';

export function createInstance (render, geometries, geometrySource, ...creationParameters) {
	let assetSource = creationParameters[0];
	const instance = {};

	if (typeof assetSource !== 'string') {
		assetSource = '#fff';
	} else {
		creationParameters.shift();
	}

	const geometry = loadGeometry(render, geometries, geometrySource);
	const asset = loadAsset(render, geometry.assets, assetSource);

	if (!creationParameters.length) {
		return;
	}
	
	asset.instances.push(instance);
	updateItem(render, instance, ...creationParameters);

	return (...updateParameters) => {
		if (!updateParameters.length) {
			const instances = asset.instances;
			instances.splice(instances.indexOf(instance), 1);
	
			if (!instances.length) {
				const assets = geometry.assets;
				delete assets[assetSource];
	
				if (!Object.keys(assets).length) {
					delete geometries[geometrySource];
				}
			}

			return;
		}

		updateItem(render, instance, ...updateParameters);
	};
}
