import { organizeAnimation } from './organize-animation';

export class Animation {
	activate (...parameters) {
		if (parameters.length) {
			this.timestamp = Date.now();
			this.queue = organizeAnimation(...parameters);
		}

		const { queue } = this;

		if (queue.length === 0) {
			this.timestamp = undefined;
			return;
		}

		const [changes, iterator] = queue.shift();

		this.changes = changes;
		this.iterator = iterator;
		this.looping = typeof iterator === 'function';
		this.iteration = -1;
		this.duration = undefined;

		this.iterate();
		
		if (parameters.length) {
			this.animate(this.timestamp);
		}
	}

	iterate () {
		this.iteration++;

		const { looping, iterator } = this;
		let { iteration, duration } = this;	
		
		if (looping) {
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
		const { properties, changes, looping } = this;
		const remaining = 1 - (looping ? 0 : progress);
		const result = { ...properties };

		for (const key in changes) {
			const property = properties[key] || 0;
			const change = changes[key] * progress;

			result[key] = property * remaining + change;
		}

		return result;
	}

	animate (now) {
		const { timestamp, children = [] } = this;
		let { properties, duration } = this;
		let elapsed = now - timestamp;

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

		this.calculate(properties);
		children.forEach(child => child.calculate());
	}
}
