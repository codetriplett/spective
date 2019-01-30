import { calculateMatrix } from './calculate-matrix';

export function updateItem (item, ...parameters) {
	const render = this.render;
	let position = parameters[0];
	const animate = typeof position === 'function';
	let duration = animate ? parameters[1] : undefined;

	if (!animate) {
		const value = position;
		position = () => value;
	}

	if (typeof duration !== 'function') {
		const value = duration || 0;
		duration = iteration => iteration === 0 ? value : 0;
	}
	
	let iteration = 0;
	let frames = 0;
	let animationTimestamp = Date.now();
	let animationDuration = duration(iteration);
	let animationElapsed;

	function step (timestamp) {
		animationElapsed = timestamp - animationTimestamp;

		while (animationElapsed >= animationDuration && animationDuration > 0) {
			let nextAnimationDuration = duration(++iteration, frames);

			if (nextAnimationDuration > 0) {
				animationElapsed -= animationDuration;
				animationTimestamp = Date.now() - animationElapsed;
			} else {
				animationElapsed = animationDuration;
				item.step = undefined;
			}
			
			animationDuration = nextAnimationDuration;
			frames = 0;
		}

		const progress = animationDuration ? animationElapsed / animationDuration : 1;
		const animationPosition = position(progress, iteration);

		item.matrix = calculateMatrix(false, animationPosition);
		item.inverse = calculateMatrix(true, animationPosition);
		frames++;
	}

	if (animationDuration > 0) {
		item.step = step;
	} else {
		step();
	}
	
	render();
}
