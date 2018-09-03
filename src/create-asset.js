import { expandPoints } from './expand-points';
import { createInstance } from './create-instance';

export function createAsset (state, geometry, color, coordinates, callback) {
	const { assets, faces, length } = geometry;
	const instances = [];
	const asset = { instances };
	const reportImage = typeof color === 'string' && typeof callback === 'function';
	let image;

	assets.push(asset);

	function loader (image) {
		const siblingLoaders = state.images[color];
		asset.color = image;

		if (Array.isArray(siblingLoaders)) {
			asset.color = image || new Uint8Array(4).fill(255);
			state.images[color] = image;
			siblingLoaders.forEach(siblingLoader => siblingLoader(image));
		}

		if (reportImage) {
			callback(color, !!image);
		}

		if (instances.length > 0) {
			state.needsRender = true;
		}
	}

	if (typeof color === 'string') {
		image = state.images[color];

		if (!image) {
			image = new window.Image();
			image.src = color;
			image.addEventListener('load', () => loader(image));
			image.addEventListener('error', () => loader());
			state.images[color] = [];
		} else if (Array.isArray(image)) {
			state.images[color].push(loader);
		} else {
			loader(image);
		}
	} else if (Array.isArray(color)) {
		image = new Uint8Array(4).fill(255);
		image.set(color.slice(0, 4));
		coordinates = Array(length * 2).fill(0.5);
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
