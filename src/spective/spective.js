import { createCanvas } from './create-canvas';
import { Instance } from '../Instance/Instance';
import { Scene } from '../Scene/Scene';
import { Meter } from '../Meter/Meter';
import { Button } from '../Button/Button';

const assetRegex = /(\.(bmp|gif|jpe?g|png|svg)|#[0-9a-f]{3}|#[0-9a-f]{6}) *$/;

export default function spective (...parameters) {
	const first = parameters[0];
	const firstType = typeof first;

	if (first === undefined) {
		return;
	} else if (firstType === 'function') {
		const meter = new Meter(...parameters);
		return change => meter.update(change);
	} else if (firstType === 'string') {
		new Button(...parameters);
		return;
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
		let geometrySource;
		let assetSource;

		if (!assetRegex.test(parameters[0])) {
			geometrySource = parameters.shift();
		}

		if (assetRegex.test(parameters[0])) {
			assetSource = parameters.shift();
		} else if (!parameters.length) {
			destroyGeometry(geometrySource, anchor);
			return;
		}

		geometrySource = geometrySource || '1 1 1';
		assetSource = assetSource || '#fff';

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
		const children = [];

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

				children.forEach(child => child());
			} else if (typeof parameters[0] === 'string') {
				children.push(creator(instance, ...parameters));
				return children[children.length - 1];
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
