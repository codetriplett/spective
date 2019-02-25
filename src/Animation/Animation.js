import { organizeAnimation } from './organize-animation';

export class Animation {
	activate (...parameters) {
		if (parameters.length) {
			this.timestamp = Date.now();
			this.queue = organizeAnimation(...parameters);
		}

		const { queue } = this;
		const isComplete = !queue.length;
		const [changes, iterator] = queue.shift() || [];

		this.changes = changes;
		this.iterator = iterator;
		this.duration = undefined;
		
		if (isComplete) {
			this.timestamp = undefined;
			this.existing = undefined;
			this.looping = undefined;
			this.iteration = undefined;

			return;
		}

		this.looping = typeof iterator === 'function';
		this.iteration = -1;
		this.iterate();
		
		if (parameters.length) {
			this.animate(this.timestamp);
		}
	}

	iterate () {
		this.existing = { ...this.properties };
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
			this.interpolate(1);
		}

		this.activate();
	}

	interpolate (progress) {
		const { existing, changes, properties, looping } = this;
		const remaining = 1 - (looping ? 0 : progress);

		for (const key in changes) {
			const property = existing[key] || 0;
			const change = changes[key] * progress;

			properties[key] = property * remaining + change;
		}
	}

	animate (now) {
		const { timestamp, children = [] } = this;
		let { properties, duration } = this;
		let elapsed = now - timestamp;

		while (elapsed >= duration) {
			this.interpolate(1);
			this.timestamp += duration;

			elapsed -= duration;
			this.iterate();
			duration = this.duration;
		}

		if (duration > 0) {
			const progress = elapsed / duration;
			this.interpolate(progress);
		}

		this.calculate(properties);
		children.forEach(child => child.calculate());
	}
}
