import { organizeSegments } from './organize-segments';

export class Meter {
	constructor (...parameters) {
		const trailingNumbers = [];

		while (typeof parameters.slice(-1)[0] === 'number') {
			trailingNumbers.unshift(parameters.pop());
		}

		const segments = organizeSegments(...parameters);
		
		this.value = 0;
		this.index = 0;
		this.segments = segments;
		this.range = segments.slice(-1)[0].upperValue;
		this.reversed = false;

		this.measure = this.measure.bind(this);
		this.resolve = this.resolve.bind(this);
		this.update = this.update.bind(this);

		this.update(...trailingNumbers);
	}

	measure () {
		const now = Date.now();
		let { value } = this;

		const {
			range,
			reversed,
			fromValue,
			toValue,
			duration,
			timestamp = now
		} = this;

		if (fromValue !== undefined && toValue !== undefined) {
			let progress = duration ? (Date.now() - timestamp) / duration : 1;
			progress = Math.min(Math.max(0, progress), 1);

			value = fromValue * (1 - progress) + toValue * progress;
			this.value = value;
		}

		return reversed ? value - range : value;
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
			remainingInput,
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
			callback(iterator, toValue);
		}

		if (nextIndex !== index && nextIndex >= 0 && nextIndex < segments.length) {
			this.index = nextIndex;
			update(remainingInput, remainingDuration);
		} else {
			this.fromValue = undefined;
			this.toValue = undefined;
			this.iterator = undefined;
			this.duration = undefined;
			this.timestamp = undefined;
			this.remainingInput = undefined;
			this.remainingDuration = undefined;
		}
	}

	update (input, duration) {
		if (isNaN(input)) {
			return;
		}

		this.measure();
		clearTimeout(this.timeout);

		const { resolve, value, segments, index, range } = this;
		const { lowerValue, upperValue } = segments[index];
		const isNegative = 1 / input < 0;
		const isAbsolute = duration === undefined;
		let { reversed } = this;
		let totalValue = input;
		let totalChange = input;
		let iterator = 0;

		if (isAbsolute) {
			totalValue += isNegative ? range : 0;
			totalChange = totalValue - value;
		} else {
			totalValue += value;
		}

		if (totalValue !== value) {
			iterator = totalValue < value ? -1 : 1;
			reversed = totalValue < value;
		} else if (!isAbsolute) {
			reversed = isNegative;
		}

		const effectiveValue = Math.min(Math.max(0, totalValue), range);
		const effectiveChange = (effectiveValue - value) || (0 * (reversed ? -1 : 1));
		const effectivePercentage = totalChange ? effectiveChange / totalChange : 1;
		const limitedValue = Math.min(Math.max(lowerValue, totalValue), upperValue);
		const limitedChange = (limitedValue - value) || (0 * (reversed ? -1 : 1));
		const limitedPercentage = totalChange ? limitedChange / totalChange : 1;
		let limitedDuration;
		let remainingInput;
		let remainingDuration;
			
		if (isAbsolute) {
			remainingInput = totalValue;
		} else {
			limitedDuration = Math.round(duration * limitedPercentage);
			remainingInput = effectiveChange ? effectiveChange - limitedChange : effectiveChange;
			remainingDuration = duration - limitedDuration;
		}

		this.reversed = reversed;
		this.fromValue = value;
		this.toValue = limitedValue;
		this.duration = limitedDuration;
		this.iterator = iterator;
		this.remainingInput = remainingInput;
		this.remainingDuration = remainingDuration;
		
		if (isAbsolute) {
			resolve();
			return effectiveChange;
		} else {
			this.timestamp = Date.now();
			this.timeout = setTimeout(resolve, limitedDuration);
		}

		return isNegative ? -effectivePercentage : effectivePercentage;
	}
}
