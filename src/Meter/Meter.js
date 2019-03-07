import { organizeSegments } from './organize-segments';

export class Meter {
	constructor (...parameters) {
		const trailingNumbers = [];

		while (typeof parameters.slice(-1)[0] === 'number') {
			trailingNumbers.unshift(parameters.pop());
		}
		
		this.value = 0;
		this.index = 0;
		this.segments = organizeSegments(...parameters);

		this.measure = this.measure.bind(this);
		this.update = this.update.bind(this);

		this.update(...trailingNumbers);
	}

	measure () {
		const now = Date.now();
		const { fromValue, toValue, duration, timestamp = now } = this;

		if (fromValue === undefined || toValue === undefined) {
			return this.value;
		}

		let progress = duration ? (Date.now() - timestamp) / duration : 1;
		progress = Math.min(Math.max(0, progress), 1);

		const value = fromValue * (1 - progress) + toValue * progress;

		return this.value = value;
	}

	update (change, duration) {
		if (!change || isNaN(change)) {
			return this.value;
		}

		const { measure, update, value, segments, timeout } = this;
		let { index } = this;
		const { lowerValue, lowerCallback, upperValue, upperCallback } = segments[index];
		const isAbsolute = duration === undefined;

		clearTimeout(timeout);
		measure();
		
		const totalValue = isAbsolute ? change : value + change;
		const toValue = Math.min(Math.max(lowerValue, totalValue), upperValue);
		let limitedDuration;
		
		if (!isAbsolute) {
			limitedDuration = Math.round(duration * (toValue - value) / change);
		}

		this.fromValue = value;
		this.toValue = toValue;
		this.duration = limitedDuration;
		this.timestamp = Date.now();

		this.timeout = setTimeout(() => {
			let iterator = 0;
			let callback;

			if (toValue >= upperValue) {
				iterator = 1;
				callback = upperCallback;
			} else if (toValue <= lowerValue) {
				iterator = -1;
				callback = lowerCallback;
			}

			this.value = toValue;
			index += iterator;

			if (callback && toValue !== value && !isAbsolute) {
				callback(iterator);
			}

			if (index !== this.index && index >= 0 && index < segments.length) {
				const remainingChange = totalValue - toValue;
				let remainingDuration;
				
				if (!isAbsolute) {
					remainingDuration = duration - limitedDuration;
				}

				this.index = index;
				update(remainingChange, remainingDuration);
			} else {
				this.fromValue = undefined;
				this.toValue = undefined;
				this.duration = undefined;
				this.timestamp = undefined;
			}
		}, limitedDuration || 0);

		return this.value;
	}
}
