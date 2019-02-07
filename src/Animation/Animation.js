export class Animation {
	constructor (changes, iterator) {
		this.changes = changes;
		this.iterator = iterator;

		this.iterate();
	}

	iterate () {
		let { iterator, iteration } = this;
		let duration;

		this.iteration = iteration === undefined ? iteration = 0 : ++iteration;

		if (typeof iterator === 'function') {
			duration = iterator(iteration);
		} else {
			duration = iteration > 0 ? undefined : iterator;
		}

		if (duration > 0) {
			this.duration = duration;
			return duration;
		}

		this.iteration = undefined;
		this.duration = undefined;
	}

	interpolate (properties, progress) {
		const { changes, iterator } = this;
		const remaining = typeof iterator === 'function' ? 1 : 1 - progress;
		const result = { ...properties };

		for (const key in changes) {
			const change = changes[key] * progress;
			let property = properties[key] || 0;

			result[key] = property * remaining + change;
		}

		return result;
	}

	update (properties, timestamp) {
		
	}
}
