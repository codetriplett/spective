import { organizeAnimations } from './organize-animations';
import { formatProperties } from './format-properties';
import { buildMatrices } from './build-matrices';
import { multiplyMatrices } from './multiply-matrices';
import { Animation } from './Animation';

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
		this.animations = [];

		this.update(...parameters);
	}
	
	calculate () {
		const { properties, inverted, anchor } = this;
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

	animate (timestamp) {
		let { duration } = this;
		let progress = 1;

		if (duration) {
			let elapsed = timestamp - this.timestamp;
			this.timestamp = timestamp;

			while (elapsed >= duration) {
				this.properties = interpolate(progress);

				elapsed -= duration;
				duration = iterate();
			}

			if (!duration) {
				return this.properties;
			}

			progress = elapsed / duration;
		}

		return interpolate(progress);
	}

	update (...parameters) {
		const animations = organizeAnimations(parameters);
		this.animations = animations.map(animation => new Animation(...animation));
	}
}
