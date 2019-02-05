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

		this.properties = { scaleX: 1, scaleY: 1, scaleZ: 1 };
		this.animate(...parameters);
	}

	shift (relativeProperties, progress = 1) {
		const { originalProperties, properties } = this;

		for (const key in relativeProperties) {
			const originalValue = originalProperties[key] || 0;
			const change = relativeProperties[key] * progress;

			properties[key] = originalValue + change;
		}
	}

	prepare (change) {
		const self = this;

		if (typeof change === 'function') {
			return progress => self.shift(formatProperties(change(progress)));
		}
	
		const relativeProperties = formatProperties(change);

		return progress => self.shift(relativeProperties, progress);
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
			} = this;

			const matrix = absoluteMatrix || relativeMatrix;
			const inverse = absoluteInverse || relativeInverse;
			
			this.absoluteMatrix = multiplyMatrices([this.relativeMatrix, matrix]);
			this.absoluteInverse = multiplyMatrices([this.relativeInverse, inverse]);
		}
	}

	animate (properties, duration) {
		this.originalProperties = { ...this.properties };

		const interpolate = this.prepare(properties);
	
		if (typeof duration !== 'function') {
			const value = duration || 0;
			duration = iteration => iteration === 0 ? value : 0;
		}
		
		const self = this;
		let iteration = 0;
		let loopTimestamp = Date.now();
		let loopDuration = duration(iteration);
		let loopElapsed;
	
		function step (timestamp) {
			loopElapsed = timestamp - loopTimestamp;
	
			while (loopElapsed >= loopDuration && loopDuration > 0) {
				interpolate(1);

				const nextDuration = duration(++iteration);
	
				if (nextDuration > 0) {
					loopElapsed -= loopDuration;
					loopTimestamp = Date.now() - loopElapsed;
					self.originalProperties = { ...self.properties };
				} else {
					loopElapsed = loopDuration;
					self.step = undefined;
				}
				
				loopDuration = nextDuration;
			}

			const progress = loopDuration ? loopElapsed / loopDuration : 1;
			const { children = [] } = self;

			interpolate(progress);
			self.update(self.properties);
			children.forEach(child => child.update());
		}
	
		if (loopDuration > 0) {
			this.step = step;
		} else {
			step();
		}
	}
}
