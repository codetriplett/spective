import { expandPoints } from './expand-points';
import { createInstance } from './create-instance';

export function createAsset (state, geometry, source, coordinates, callback) {
	const { assets, faces, length } = geometry;
	const instances = [];
	const asset = { instances };
	const reportImage = typeof source === 'string' && typeof callback === 'function';
	let image;

	assets.push(asset);

	function loader (image) {
		const siblingLoaders = state.images[source];
		asset.image = image;

		if (Array.isArray(siblingLoaders)) {
			asset.image = image || new Uint8Array(4).fill(255);
			state.images[source] = image;
			siblingLoaders.forEach(siblingLoader => siblingLoader(image));
		}

		if (reportImage) {
			callback(source, !!image);
		}

		if (instances.length > 0) {
			state.needsRender = true;
		}
	}

	if (typeof source === 'string') {
		image = state.images[source];

		if (!image) {
			image = new window.Image();
			image.src = source;
			image.addEventListener('load', () => loader(image));
			image.addEventListener('error', () => loader());
			state.images[source] = [];
		} else if (Array.isArray(image)) {
			state.images[source].push(loader);
		} else {
			loader(image);
		}
	} else if (Array.isArray(source)) {
		const sourceLength = Math.ceil(source.length / 3);
		const imageLength = sourceLength * 4;
		const values = source.map(value => Math.round(value * 255));

		image = new Uint8Array(imageLength).fill(255);

		for (let i = 0; i < imageLength; i += 4) {
			image.set(values.splice(0, 3), i);
		}

		if (Array.isArray(coordinates)) {
			const coordinateStep = 1 / sourceLength;
			const coordinateStart = coordinateStep / 2;

			coordinates = coordinates.reduce((array, index) => {
				return array.concat(coordinateStart + coordinateStep * index, 0.5);
			}, []);
		} else {
			coordinates = Array(length * 2).fill(0.5);
		}

		loader(image);
	}

	if (!image) {
		return;
	}
	
	asset.coordinates = expandPoints(length, faces, coordinates);

	return (...optionArray) => {
		if (optionArray.length === 0) {
			assets.splice(assets.indexOf(asset), 1);
			state.needsRender = true;

			return;
		}
		
		return createInstance(state, asset, ...optionArray);
	};
}
