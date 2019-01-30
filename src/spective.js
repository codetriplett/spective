import { createCanvas } from './create-canvas';
import { Scene } from './Scene';

export default function spective (...initializationParameters) {
	let canvas = initializationParameters[0];
	const needsCanvas = !canvas || typeof canvas.getContext !== 'function';

	if (needsCanvas) {
		canvas = createCanvas();
	} else {
		initializationParameters.shift();
	}

	const geometries = {};
	const scene = new Scene(canvas, geometries);
	const { resize, toggle, updateItem, createInstance } = scene;

	if (needsCanvas) {
		window.addEventListener('resize', resize);
	}

	toggle();
	updateItem(scene, ...initializationParameters);
	toggle();

	return (...creationParameters) => {
		if (creationParameters.length === 0) {
			toggle();
		} else if (typeof creationParameters[0] === 'string') {
			return createInstance(...creationParameters);
		} else {
			updateItem(scene, ...creationParameters);
		}
	};
}
