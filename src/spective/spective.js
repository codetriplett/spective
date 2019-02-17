import { createCanvas } from './create-canvas';
import { Instance } from '../Instance/Instance';
import { Scene } from '../Scene/Scene';

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

		render();

		return (...parameters) => {
			if (!parameters.length) {
				asset.destroyInstance(instance);

				if (!asset.instances.length) {
					geometry.destroyAsset(assetSource);

					if (!Object.keys(geometry.assets).length) {
						destroyGeometry(geometrySource);
					}
				}
			} else if (typeof parameters[0] === 'string') {
				return creator(instance, ...parameters);
			} else {
				instance.activate(...parameters);
				render();
			}
		};
	}

	return (...parameters) => {
		if (parameters.length === 0) {
			toggle();
		} else if (typeof parameters[0] === 'string') {
			return creator(false, ...parameters);
		} else {
			camera.activate(...parameters);
			render();
		}
	};
}
