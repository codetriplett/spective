import { formatProperties } from './format-properties';
import { organizeAnimation } from './organize-animation';

export class Animation {
	activate (...parameters) {
		if (parameters.length) {
			this.timestamp = Date.now();
			this.queue = organizeAnimation(...parameters);
		}

		const { queue } = this;

		const [changes, iterator] = queue.shift() || [];

		this.changes = changes ? formatProperties(changes) : undefined;
		this.iterator = iterator;
		this.iteration = undefined;
		this.duration = undefined;

		if (!changes) {
			this.timestamp = undefined;
		} else {
			this.iterate();
		}
		
		if (parameters.length) {
			this.animate(this.timestamp);
		}
	}

	iterate () {
		const { iterator = 0 } = this;
		let { iteration, duration } = this;

		iteration = iteration === undefined ? 0 : iteration + 1;
		this.iteration = iteration;
		
		if (typeof iterator === 'function') {
			duration = iterator(iteration);
		} else {
			duration = !iteration ? iterator : 0;
		}

		if (duration > 0) {
			this.duration = duration;
			return;
		}

		if (iteration === 0) {
			this.properties = this.interpolate(1);
		}

		this.activate();
	}

	interpolate (progress) {
		const { properties, changes, iterator } = this;

		if (!changes) {
			return properties;
		}

		const remaining = typeof iterator === 'function' ? 1 : 1 - progress;
		const result = { ...properties };

		for (const key in changes) {
			const change = changes[key] * progress;
			let property = properties[key] || 0;

			result[key] = property * remaining + change;
		}

		return result;
	}

	animate (timestamp) {
		let properties = this.properties;

		if (this.timestamp !== undefined) {
			let { duration } = this;
			let elapsed = timestamp - this.timestamp;

			while (elapsed >= duration) {
				this.properties = this.interpolate(1);
				this.timestamp += duration;

				elapsed -= duration;
				this.iterate();
				duration = this.duration;
			}

			if (duration > 0) {
				const progress = elapsed / duration;
				properties = this.interpolate(progress);
			} else {
				properties = this.properties;
			}
		}

		this.calculate(properties);

		const { children = [] } = this;
		children.forEach(child => child.calculate());
	}
}
