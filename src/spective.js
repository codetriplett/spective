import { createCanvas } from './create-canvas';
import { Scene } from './Scene';
import { updateItem } from './update-item';
import { createInstance } from './create-instance';

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
	const render = scene.render.bind(scene);

	if (needsCanvas) {
		window.addEventListener('resize', scene.resize.bind(scene));
	}

	scene.toggle();
	updateItem(render, scene, ...initializationParameters);
	scene.toggle();

	return (...creationParameters) => {
		if (creationParameters.length === 0) {
			scene.toggle();
		} else if (typeof creationParameters[0] === 'string') {
			return createInstance(render, geometries, ...creationParameters);
		} else {
			updateItem(render, scene, ...creationParameters);
		}
	};
}
