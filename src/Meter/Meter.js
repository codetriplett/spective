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
		this.resolve = this.resolve.bind(this);
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

	resolve () {
		const {
			update,
			index,
			segments,
			duration,
			iterator,
			fromValue,
			toValue,
			remainingChange,
			remainingDuration
		} = this;
		
		const {
			lowerValue,
			lowerCallback,
			upperValue,
			upperCallback
		} = segments[index];
		
		let nextIndex = index + iterator;
		let callback;

		if (toValue >= upperValue && iterator === 1) {
			callback = upperCallback;
		} else if (toValue <= lowerValue && iterator === -1) {
			callback = lowerCallback;
		} else {
			nextIndex -= iterator;
		}

		this.value = toValue;

		if (callback && fromValue !== toValue && duration !== undefined) {
			callback(iterator);
		}

		if (nextIndex !== index && nextIndex >= 0 && nextIndex < segments.length) {
			this.index = nextIndex;
			update(remainingChange, remainingDuration);
		} else {
			this.fromValue = undefined;
			this.toValue = undefined;
			this.iterator = undefined;
			this.duration = undefined;
			this.timestamp = undefined;
			this.remainingChange = undefined;
			this.remainingDuration = undefined;
		}
	}

	update (change, duration) {
		if (isNaN(change)) {
			return this.value;
		}

		const { measure, resolve, value, index, segments, timeout } = this;
		const { lowerValue, upperValue } = segments[index];
		const isNegative = 1 / change < 0;
		const isAbsolute = duration === undefined;

		clearTimeout(timeout);
		measure();
		
		let totalValue = value + change;

		if (isAbsolute) {
			const range = segments.slice(-1)[0].upperValue;
			totalValue = isNegative ? range + change : change;
		}

		const toValue = Math.min(Math.max(lowerValue, totalValue), upperValue);
		let iterator = 0;
		let limitedDuration;
		let remainingChange = totalValue;
		let remainingDuration;

		if (totalValue !== value) {
			iterator = totalValue < value ? -1 : 1;
		}
			
		if (!isAbsolute) {
			limitedDuration = Math.round(duration * (toValue - value) / change);
			remainingChange -= toValue
			remainingDuration = duration - limitedDuration;
		}

		this.fromValue = value;
		this.toValue = toValue;
		this.duration = limitedDuration;
		this.iterator = iterator;
		this.remainingChange = remainingChange;
		this.remainingDuration = remainingDuration;
		
		if (limitedDuration === undefined) {
			resolve();
		} else {
			this.timestamp = Date.now();
			this.timeout = setTimeout(resolve, limitedDuration);
		}

		return this.value;
	}
}
