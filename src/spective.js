import { createCanvas } from './create-canvas';
import { Instance } from './Instance';
import { Scene } from './Scene';

export default function spective (...parameters) {
	let canvas = parameters[0];
	const needsCanvas = !canvas || typeof canvas.getContext !== 'function';

	if (needsCanvas) {
		canvas = createCanvas();
	} else {
		parameters.shift();
	}

	const camera = new Instance(true, ...parameters);
	const scene = new Scene(canvas, camera);
	const { resize, toggle, render, createGeometry, destroyGeometry } = scene;

	resize();

	if (needsCanvas) {
		window.addEventListener('resize', resize);
	}

	function creator (anchor, ...parameters) {
		const geometrySource = parameters.shift();
		let assetSource;

		if (typeof parameters[0] === 'string') {
			assetSource = parameters.shift();
		} else {
			assetSource = '#fff';
		}

		if (!parameters.length) {
			return;
		}

		const geometry = createGeometry(geometrySource, render);
		const asset = geometry.createAsset(assetSource, render);
		const instance = asset.createInstance(anchor, ...parameters);

		return (...parameters) => {
			if (!parameters.length) {
				asset.destroyInstance(instance);

				if (!asset.instances.length) {
					geometry.destroyAsset(assetSource);

					if (!geometry.assets.length) {
						destroyGeometry(geometrySource);
					}
				}
			} else if (typeof parameters[0] === 'string') {
				return creator(instance, ...parameters);
			} else {
				instance.animate(...parameters);
				render();

				return updater[0];
			}
		};
	}

	return (...parameters) => {
		if (parameters.length === 0) {
			toggle();
		} else if (typeof parameters[0] === 'string') {
			return creator(false, ...parameters);
		} else {
			camera.animate(...parameters);
			render();
		}
	};
}
