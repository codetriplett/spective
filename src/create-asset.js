import { expandPoints } from './expand-points';
import { createInstance } from './create-instance';

export function createAsset (state, geometry, color, coordinates, callback) {
	const { assets, faces, length } = geometry;
	const instances = [];
	const asset = { instances };
	let image;

	assets.push(asset);

	function loader () {
		asset.color = image;

		if (typeof color === 'string' && typeof callback === 'function') {
			callback(color);
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
			image.addEventListener('load', loader);
			state.images[color] = image;
		} else {
			loader();
		}
	} else if (Array.isArray(color)) {
		image = new Uint8Array(4).fill(255);
		image.set(color.slice(0, 4));
		coordinates = Array(length * 2).fill(0.5);
		loader();
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
