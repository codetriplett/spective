import { calculateMatrix } from './calculate-matrix';

export function updateItem (render, item, ...parameters) {
	let position = parameters[0];
	const animate = typeof position === 'function';
	let duration = animate ? parameters[1] : undefined;
	let callback = !animate ? parameters[1] : parameters[2];

	if (!animate) {
		const value = position;
		position = () => value;
	}

	if (typeof duration !== 'function') {
		const value = duration || 0;
		duration = iteration => iteration === 0 ? value : 0;
	}

	if (typeof callback !== 'function') {
		callback = () => {};
	} else {
		const action = callback;
		callback = () => action(item.matrix.concat(item.inverse));
	}
	
	let animationCount = 0;
	let animationTimestamp = Date.now();
	let animationDuration = duration(animationCount);
	let animationElapsed;

	function step (timestamp) {
		animationElapsed = timestamp - animationTimestamp;

		while (animationDuration && animationElapsed >= animationDuration) {
			const nextAnimationDuration = duration(++animationCount);

			if (!nextAnimationDuration) {
				animationElapsed = animationDuration;
				item.step = undefined;
			} else {
				animationElapsed -= animationDuration;
				animationTimestamp = Date.now() - animationElapsed;
			}
			
			animationDuration = nextAnimationDuration;
		}

		const elapsedPosition = position(animationDuration ? animationElapsed / animationDuration : 1);

		item.matrix = calculateMatrix(false, elapsedPosition);
		item.inverse = calculateMatrix(true, elapsedPosition);
		callback();
	}

	if (animationDuration) {
		item.step = step;
	} else {
		step();
		render();
	}
}
