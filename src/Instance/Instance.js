import { formatProperties } from './format-properties';
import { buildMatrices } from './build-matrices';
import { multiplyMatrices } from './multiply-matrices';
import { Animation } from './Animation';

export class Instance extends Animation {
	constructor (anchor, ...parameters) {
		super();
		
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

		this.activate(...parameters);
	}
	
	calculate (properties) {
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
}
