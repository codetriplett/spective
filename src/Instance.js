import { mergeValues } from './merge-values';
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

		this.properties = {
			scale: [1, 1, 1],
			offset: [0, 0, 0],
			rotation: 0,
			tilt: 0,
			spin: 0,
			position: [0, 0, 0]
		};

		this.animate(...parameters);
	}
	
	update (properties) {
		const { inverted, anchor, relativeMatrix, relativeInverse } = this;
		let matrices;
		let inverses;

		if (properties) {
			matrices = buildMatrices(properties, inverted);
			inverses = buildMatrices(properties, !inverted, inverted);

			this.relativeMatrix = multiplyMatrices(matrices);
			this.relativeInverse = multiplyMatrices(inverses);
			this.properties = properties;
		} else if (anchor) {
			const matrix = anchor.absoluteMatrix || anchor.relativeMatrix;
			const inverse = anchor.absoluteInverse || anchor.relativeInverse;
			
			this.absoluteMatrix = multiplyMatrices([relativeMatrix, matrix]);
			this.absoluteInverse = multiplyMatrices([relativeInverse, inverse]);
		}
	}

	animate (properties, duration) {
		const relative = typeof properties !== 'function';
		const self = this;

		if (relative) {
			const value = properties;
			properties = () => value;
		}
	
		if (typeof duration !== 'function') {
			const value = duration || 0;
			duration = iteration => iteration === 0 ? value : 0;
		}
		
		let iteration = 0;
		let loopTimestamp = Date.now();
		let loopDuration = duration(iteration);
		let loopElapsed;
	
		function step (timestamp) {
			loopElapsed = timestamp - loopTimestamp;
	
			while (loopElapsed >= loopDuration && loopDuration > 0) {
				const nextDuration = duration(++iteration);
	
				if (nextDuration > 0) {
					loopElapsed -= loopDuration;
					loopTimestamp = Date.now() - loopElapsed;
				} else {
					loopElapsed = loopDuration;
					self.step = undefined;
				}
				
				loopDuration = nextDuration;
			}

			const progress = loopDuration ? loopElapsed / loopDuration : 1;
			const { children = [] } = self;

			self.update(mergeValues(self.properties, properties(progress)));
			children.forEach(child => child.update());
		}
	
		if (loopDuration > 0) {
			this.step = step;
		} else {
			step();
		}
	}
}
