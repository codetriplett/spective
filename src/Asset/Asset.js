import { parseColor } from './parse-color';
import { Instance } from '../Instance/Instance';

const hexadecimalRegex = /^(#[0-9a-f]{3}|#[0-9a-f]{6})$/;

export class Asset {
	constructor (source, callback = () => {}) {
		if (hexadecimalRegex.test(source)) {
			this.image = parseColor(source);
		} else {
			const image = new window.Image();
			image.src = source;

			image.addEventListener('load', () => {
				this.image = image;
				callback(source);
			});

			image.addEventListener('error', () => callback(source));
		}

		this.instances = [];
	}

	createInstance (...parameters) {
		const instance = new Instance(...parameters);
		this.instances.push(instance);
		return instance;
	}

	destroyInstance (instance) {
		const instances = this.instances;
		instances.splice(instances.indexOf(instance), 1);
	}
}
