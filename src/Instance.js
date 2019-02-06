import { organizeAnimations } from './organize-animations';
import { formatProperties } from './format-properties';
import { buildMatrices } from './build-matrices';
import { multiplyMatrices } from './multiply-matrices';

export class Instance {
	constructor (anchor, ...parameters) {
		if (anchor === true) {
			this.inverted = true;
		} else if (anchor instanceof Instance) {
			if (!anchor.children) {
				anchor.children = [];
			}

			anchor.children.push(this);
			this.anchor = anchor;
		}

		this.properties = formatProperties();
		this.animate(...parameters);
	}

	prepare (...parameters) {
		const animations = organizeAnimations(...parameters);
		const self = this;
		let animationIndex = 0;
		let iteration = 0;
		let originalProperties;
		let relativeProperties;
		let duration;
		let callback;

		const interpolate = progress => {
			const { properties } = self;

			for (const key in relativeProperties) {
				const originalValue = originalProperties[key] || 0;
				properties[key] = originalValue + relativeProperties[key] * progress;
			}
		};

		const report = () => {
			if (typeof callback === 'function') {
				callback({ ...self.properties });
			}
		};

		const iterate = () => {
			if (!iteration) {
				const animation = animations[animationIndex];

				relativeProperties = formatProperties(animation[0]);
				duration = animation[1];
				callback = animation[2];
				animationIndex++;
				
				if (typeof duration !== 'function') {
					const value = duration;
					duration = () => !iteration ? value : undefined;
				}
			} else {
				interpolate(1);
			}
			
			const value = duration(iteration);
			
			originalProperties = { ...self.properties };
			iteration++;

			if (value > 0) {
				return value;
			} else {
				if (iteration === 1) {
					interpolate(1);
				}

				report();
				iteration = 0;
				
				if (animationIndex < animations.length) {
					return iterate();
				} else {
					duration = () => {};
					relativeProperties = {};
				}
			}
		};

		return [interpolate, iterate, report];
	}
	
	update (properties) {
		const { inverted, anchor } = this;
		let matrices;
		let inverses;

		if (properties) {
			matrices = buildMatrices(properties, inverted);
			inverses = buildMatrices(properties, !inverted, inverted);

			this.relativeMatrix = multiplyMatrices(matrices);
			this.relativeInverse = multiplyMatrices(inverses);
		}
		
		if (anchor) {
			const {
				relativeMatrix, relativeInverse,
				absoluteMatrix, absoluteInverse
			} = anchor;

			const matrix = absoluteMatrix || relativeMatrix;
			const inverse = absoluteInverse || relativeInverse;

			this.absoluteMatrix = multiplyMatrices([this.relativeMatrix, matrix]);
			this.absoluteInverse = multiplyMatrices([this.relativeInverse, inverse]);
		}
	}

	animate (...parameters) {
		const [interpolate, iterate, report] = this.prepare(...parameters);
		const self = this;
		let loopTimestamp = Date.now();
		let loopDuration = iterate();
		let loopElapsed;

		if (this.step) {
			this.step();
			this.step = undefined;
		}
	
		function step (timestamp) {
			loopElapsed = timestamp - loopTimestamp;
	
			if (timestamp || !self.step) {
				if (loopDuration > 0) {
					while (loopElapsed >= loopDuration) {
						const nextDuration = iterate();
			
						if (nextDuration > 0) {
							loopElapsed -= loopDuration;
							loopTimestamp = Date.now() - loopElapsed;
						} else {
							self.step = undefined;
						}
						
						loopDuration = nextDuration;
					}

					interpolate(loopElapsed / loopDuration);
				}
			
				const { properties, children = [] } = self;

				self.update(properties);
				children.forEach(child => child.update());
			}

			if (timestamp === undefined) {
				report();
			}
		}

		if (loopDuration > 0) {
			this.step = step;
		} else {
			step();
		}
	}
}
