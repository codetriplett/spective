import { loadGeometry } from './load-geometry';
import { loadAsset } from './load-asset';
import { updateItem } from './update-item';

export function createInstance (render, geometries, geometrySource, ...creationParameters) {
	const instance = {};
	let assetSource = creationParameters[0];

	if (typeof assetSource !== 'string') {
		assetSource = '#fff';
	} else {
		creationParameters.shift();
	}

	const { assets } = loadGeometry(render, geometries, geometrySource);
	const { instances } = loadAsset(render, assets, assetSource);
	
	instances.push(instance);
	updateItem(render, instance, ...creationParameters);

	return (...updateParameters) => {
		updateItem(render, instance, ...updateParameters);
	};
}
