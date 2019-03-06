import { organizeSegments } from './organize-segments';

export class Meter {
	constructor (...parameters) {
		const lastParameter = parameters.slice(-1)[0];
		let initialValue = 0;

		if (typeof lastParameter === 'number') {
			initialValue = parameters.pop();
		}

		const segments = organizeSegments(...parameters);
		
		this.value = 0;
		this.index = 0;
		this.segments = segments;
		this.range = segments.slice(-1)[0].threshold;

		this.update = this.update.bind(this);
		this.update(initialValue, true);
	}

	update (value, skipActions) {
		const { duration, timeout, timestamp, segments, range } = this;
		let { fromValue, toValue, index } = this;

		if (typeof value === 'number') {
			clearTimeout(timeout);

			if (value < 0) {
				value = range + value;
			}

			fromValue = this.value;
			toValue = value;

			this.fromValue = undefined;
			this.toValue = undefined;
			this.duration = undefined;
			this.timeout = undefined;
			this.timestamp = undefined;
		} else {
			const progress = duration ? (Date.now() - timestamp) / duration : 1;
			value = fromValue * (1 - progress) + toValue * progress;
		}

		if (isNaN(value) || toValue === fromValue) {
			return this.value;
		}

		const iterator = toValue > fromValue ? 1 : -1;
		const segmentsLength = segments.length;
		let resolved = false;

		while (!resolved) {
			const {
				callback: currentCallback,
				threshold: currentThreshold
			} = segments[index];

			const {
				callback: previousCallback,
				threshold: previousThreshold = 0
			} = segments[index - 1] || {};

			let callback;

			if (value >= currentThreshold) {
				callback = this.value !== currentThreshold && currentCallback;
			} else if (value <= previousThreshold) {
				callback = this.value !== previousThreshold && previousCallback;
			} else {
				resolved = true;
			}

			if (typeof callback === 'function' && !skipActions) {
				callback(iterator);
			}

			if (!resolved) {
				index += iterator;

				if (index < 0 || index >= segmentsLength) {
					index -= iterator;
					break;
				}
			}
		}

		value = Math.min(Math.max(0, value), range);
		this.value = value;
		this.index = index;

		return value;
	}

	schedule (change, duration = 0) {
		const { update, timeout } = this;

		if (timeout) {
			clearTimeout(timeout);
			update();
		}
		
		const  { range, value } = this;
		const totalValue = value + change;
		const toValue = Math.min(Math.max(0, totalValue), range);
		const limitedDuration = Math.round(duration * (toValue - value) / change);

		this.fromValue = value;
		this.toValue = toValue;
		this.duration = limitedDuration;
		this.timeout = setTimeout(() => update(toValue), limitedDuration);
		this.timestamp = Date.now();

		return value;
	}
}
