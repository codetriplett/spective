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

	loadGeometry(geometries, geometrySource, ({ assets }) => {
		const pending = loadAsset(assets, assetSource, ({ instances }) => {
			instances.push(instance);

			if (pending) {
				render();
			}
		});
	});

	updateItem(render, instance, ...creationParameters);

	return (...updateParameters) => {
		updateItem(render, instance, ...updateParameters);
	};
}
