import { organizeActions } from './organize-actions';

function isNegative (value) {
	return 1 / value < 0;
}

function constrainValue (value) {
	return Math.min(Math.max(0, value), 1);
}

export class Meter {
	constructor (...parameters) {
		const { resolve } = this;
		const [schedule, item, iterate] = organizeActions(...parameters);

		this.resolve = resolve.bind(this);
		this.schedule = schedule;
		this.iterate = iterate;
		this.previous = item;
		this.next = iterate(0, item);
		this.value = 0;
		this.change = 0;
	}

	measure () {
		const { change, duration, timestamp } = this;
		let value = constrainValue(this.value);

		if (duration) {
			const percentage = 1 - (Date.now() - timestamp) / duration;
			value -= change * constrainValue(percentage);
		}

		return value;
	}

	complete () {
		const { value, timeout } = this;
		const completion = this.measure();

		clearTimeout(timeout);

		this.value = completion;
		this.change *= 0;
		this.duration = undefined;
		this.timestamp = undefined;
		this.timeout = undefined;

		return (value - completion) || this.change;
	}

	resolve () {
		this.duration = undefined;

		const remainder = this.complete();
		const { iterate, value, previous, next, continuous } = this;

		if (value % 1 === 0) {
			const reversed = isNegative(remainder);
			const items = [next, previous];

			if (reversed) {
				items.reverse();
			}

			const item = iterate(remainder, ...items);

			if (item === undefined) {
				this.continuous = undefined;
				return;
			} else if (reversed) {
				this.value = 1;
				this.next = previous;
				this.previous = item;
			} else {
				this.value = 0;
				this.previous = next;
				this.next = item;
			}
		}

		if (continuous) {
			this.update(0);
		} else if (remainder) {
			this.update(remainder);
		}
	}

	update (change) {
		const { resolve, schedule, next, previous, timeout } = this;
		const value = this.measure();
		const reversed = isNegative(this.change);
		let reverse = isNegative(change);
		let continuous;

		if (typeof change !== 'number') {
			this.complete();
			change = reversed ? -0 : 0;
		} else if (!change) {
			change = (reversed ? -1 : 1) * (reverse ? -1 : 1);
			continuous = true;
		}

		const destination = value + change;
		const items = [next, previous];

		reverse = isNegative(change);
		change = (constrainValue(destination) - value) || (reverse ? -0 : 0);

		if (reverse) {
			items.reverse();
		}

		const duration = schedule(change, ...items);

		if (destination === value || duration === undefined) {
			return value;
		}

		clearTimeout(timeout);

		this.value = destination;
		this.change = change;
		this.duration = duration;
		this.timestamp = Date.now();
		this.timeout = setTimeout(resolve, duration);
		this.continuous = continuous;

		return destination;
	}
}
