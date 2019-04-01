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

	complete (resolved) {
		const { value, change, duration, timestamp, timeout } = this;
		let completion = constrainValue(value);

		if (!resolved && duration) {
			const percentage = (Date.now() - timestamp) / duration;
			completion -= change * constrainValue(percentage);
		}

		this.value = completion;
		this.change *= 0;
		this.duration = undefined;
		this.timestamp = undefined;
		this.timeout = clearTimeout(timeout);
		this.continuous = undefined;

		return value - completion;
	}

	resolve () {
		const remainder = this.complete(true);
		const { iterate, value, previous, next, continuous } = this;

		if (value % 1 === 0) {
			const reversed = isNegative(remainder);
			const item = iterate(remainder, reversed ? previous : next);

			if (item === undefined) {
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

		if (remainder || continuous) {
			this.update(remainder);
		}
	}

	update (change) {
		const remainder = this.complete();
		const reversed = isNegative(remainder);
		let reverse = isNegative(change);
		let continuous = false;

		const { resolve, schedule, value, next, previous } = this;

		if (typeof change !== 'number') {
			change = reversed ? -0 : 0;
		} else if (!change) {
			change = (reversed ? -1 : 1) * (reverse ? -1 : 1);
			continuous = true;
		}

		const destination = value + change;

		reverse = isNegative(change);
		change = (constrainValue(destination) - value) || (reverse ? -0 : 0);

		const item = reverse ? previous : next;
		const duration = schedule(change, item);

		if (destination === value || duration === undefined) {
			return value;
		}

		this.value = destination;
		this.change = change;
		this.duration = duration;
		this.timestamp = Date.now();
		this.timeout = setTimeout(resolve, duration);
		this.continuous = continuous;

		return destination;
	}
}
