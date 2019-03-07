import { createCanvas } from './create-canvas';
import { Instance } from '../Instance/Instance';
import { Scene } from '../Scene/Scene';
import { Meter } from '../Meter/Meter';

export default function spective (...parameters) {
	let first = parameters[0];

	if (/function|number/.test(typeof first)) {
		const meter = new Meter(...parameters);

		return (...parameters) => {
			if (!parameters.length) {
				return meter.measure();
			}
			
			return meter.update(...parameters);
		};
	}

	let canvas = first;
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
		} else if (!parameters.length) {
			destroyGeometry(geometrySource, anchor);
			return;
		} else {
			assetSource = '#fff';
		}

		const geometry = createGeometry(geometrySource, render);

		if (!parameters.length) {
			geometry.destroyAsset(assetSource, anchor);

			if (!Object.keys(geometry.assets).length) {
				destroyGeometry(geometrySource, anchor);
			}

			return;
		}

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
