import { buildMatrices } from './build-matrices';
import { multiplyMatrices } from './multiply-matrices';
import { Animation } from '../Animation/Animation';

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

		this.properties = { scaleX: 1, scaleY: 1, scaleZ: 1 };
		this.animations = [];

		if (!parameters.length) {
			parameters = [{}];
		}

		this.activate(...parameters);
	}
	
	calculate (properties) {
		const { inverted, anchor, children = [] } = this;
		let matrices;
		let inverses;

		if (properties) {
			matrices = buildMatrices(properties, inverted);
			inverses = buildMatrices(properties, !inverted, true);

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

			this.absoluteMatrix = multiplyMatrices([matrix, this.relativeMatrix]);
			this.absoluteInverse = multiplyMatrices([inverse, this.relativeInverse]);
		}

		children.forEach(child => child.calculate());
	}
}
