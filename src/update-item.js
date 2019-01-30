import { calculateMatrix } from './calculate-matrix';

export function updateItem (item, ...parameters) {
	const render = this.render;
	let position = parameters[0];
	const animate = typeof position === 'function';
	let duration = animate ? parameters[1] : undefined;
	const anchor = item.anchor;

	if (!animate) {
		const value = position;
		position = () => value;
	}

	if (typeof duration !== 'function') {
		const value = duration || 0;
		duration = iteration => iteration === 0 ? value : 0;
	}
	
	let iteration = 0;
	let animationTimestamp = Date.now();
	let animationDuration = duration(iteration);
	let animationElapsed;

	function step (timestamp) {
		animationElapsed = timestamp - animationTimestamp;

		while (animationElapsed >= animationDuration && animationDuration > 0) {
			let nextAnimationDuration = duration(++iteration);

			if (nextAnimationDuration > 0) {
				animationElapsed -= animationDuration;
				animationTimestamp = Date.now() - animationElapsed;
			} else {
				animationElapsed = animationDuration;
				item.step = undefined;
			}
			
			animationDuration = nextAnimationDuration;
		}

		const progress = animationDuration ? animationElapsed / animationDuration : 1;
		const animationPosition = { ...item.position, ...position(progress, iteration) };

		item.matrix = calculateMatrix(false, animationPosition, anchor);
		item.inverse = calculateMatrix(true, animationPosition, anchor);
		item.position = animationPosition;

		if (item.children) {
			item.children.forEach(child => {
				if (!child.step) {
					const childPosition = child.position;

					child.matrix = calculateMatrix(false, childPosition, item);
					child.inverse = calculateMatrix(true, childPosition, item);
				}
			});
		}
	}

	if (animationDuration > 0) {
		item.step = step;
	} else {
		step();
	}
	
	render();
}
