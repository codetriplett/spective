import { organizeSegments } from './organize-segments';

function isNegative (value) {
	return 1 / value < 0;
}

function constrainValue (min, value, max) {
	return Math.min(Math.max(min, value), max);
}

export class Meter {
	constructor (...parameters) {
		const trailingNumbers = [];

		while (typeof parameters.slice(-1)[0] === 'number') {
			trailingNumbers.unshift(parameters.pop());
		}

		this.segments = organizeSegments(...parameters);
		this.index = 0;
		this.value = 0;
		this.change = 0;

		this.resolve = this.resolve.bind(this);

		if (trailingNumbers.length) {
			this.update(...trailingNumbers);
		}
	}

	measure () {
		const { segments, change, duration, timestamp } = this;
		let { value } = this;

		if (duration !== undefined && timestamp !== undefined) {
			const elapsed = Date.now() - timestamp;
			const remaining = 1 - constrainValue(0, elapsed / duration, 1);

			value -= change * (remaining || 0);
		}

		if (change < 0) {
			const { upperValue: range } = segments.slice(-1)[0];
			value -= range;
		}

		return value;
	}

	resolve () {
		const { segments, value, change, duration } = this;
		let { index } = this;
		const { [index]: segment, length } = segments;
		const { lowerValue, lowerCallback, upperValue, upperCallback } = segment;
		let iterator = isNegative(change) ? -1 : 1;
		let callback;

		if (value >= upperValue && iterator > 0) {
			callback = upperCallback;
		} else if (value <= lowerValue && iterator < 0) {
			callback = lowerCallback;
		} else {
			iterator = 0;
		}

		index += iterator;
		const iterate = iterator && index >= 0 && index < length;

		if (iterate) {
			this.index = index;
			this.timeout = undefined;
		}

		if (callback && duration !== undefined) {
			callback(iterator);
		}

		if (!iterate || this.timeout !== undefined) {
			return;
		}

		this.schedule();
	}

	schedule () {
		const { resolve, segments, index, value, change, duration } = this;
		const { lowerValue, upperValue } = segments[index];
		const segmentValue = constrainValue(lowerValue, value, upperValue);

		if (segmentValue !== lowerValue && segmentValue !== upperValue) {
			return;
		}
		
		if (duration === undefined) {
			resolve();
			return;
		}
		
		const original = value - change;
		const segmentOriginal = constrainValue(lowerValue, original, upperValue);
		const beforeOriginal = segmentOriginal - original;
		const afterValue = value - segmentValue;
		const segmentChange = change - (beforeOriginal + afterValue);
		const segmentPercentage = change ? segmentChange / change : 1;
		const segmentDuration = Math.round(duration * segmentPercentage);

		this.timeout = setTimeout(resolve, segmentDuration);
	}

	update (input, duration) {
		if (isNaN(input)) {
			input = 0;
			duration = duration || 0;
		}

		const { segments, timeout } = this;
		const { upperValue: range } = segments.slice(-1)[0];
		const isAbsolute = duration === undefined;
		let value = this.measure();
		let change;

		const wasNegative = isNegative(value);
		value += wasNegative ? range : 0;

		if (isAbsolute) {
			input += isNegative(input) ? range : 0;
			change = input - value;
			value = input;
		} else {
			change = input;
			value += change;
		}

		const effectiveValue = constrainValue(0, value, range);
		let effectiveChange = change - (value - effectiveValue);

		if (!effectiveChange) {
			effectiveChange = wasNegative ? -0 : 0;
		}

		this.value = effectiveValue;
		this.change = effectiveChange;
		this.timeout = clearTimeout(timeout);

		if (!isAbsolute) {
			const percentage = (effectiveChange / change) || 1;

			this.duration = duration * percentage;
			this.timestamp = Date.now();
		} else {
			this.duration = undefined;
			this.timestamp = undefined;
		}

		if (!effectiveChange) {
			return;
		}

		this.schedule();
	}
}
