import { formatItem } from './format-item';

function isNegative (value) {
	return 1 / value < 0;
}

function constrainValue (value) {
	return Math.min(Math.max(0, value), 1);
}

export class Meter {
	constructor (...parameters) {
		const { resolve } = this;
		const schedule = parameters.shift();
		const actions = [];
		const state = {};

		for (let i = 0; i < 2; i++) {
			if (typeof parameters[0] === 'function') {
				actions.push(parameters.shift());
			} else {
				actions.push(function (item) { return item; });
			}
		}

		const [iterate, transform] = actions;
		const previous = { item: 0 };
		const next = { item: 1 };

		previous.next = next;
		next.previous = previous;
		
		this.resolve = resolve.bind(this);
		this.schedule = schedule.bind(state);
		this.iterate = iterate.bind(state);
		this.transform = transform;
		this.previous = previous;
		this.next = next;
		this.value = 0;
		this.change = 0;
	}

	flatten (objects, index = 0, state = {}, tether) {
		const self = this;
		const length = objects.length;
		let location = index;
		const items = [];
		let branches = [];
		let item;
		let previous;

		state = JSON.parse(JSON.stringify(state));

		[...objects, undefined].forEach((object, i) => {
			if (i < length) {
				if (Array.isArray(object)) {
					object = self.flatten(object, location, state, item);
				} else if (typeof object !== 'number') {
					tether = item === undefined ? tether : item;
					object = self.transform.call(state, object, tether);
				}

				if (Array.isArray(object) || typeof object === 'number') {
					branches.push(object);
					location += Array.isArray(object) ? object.length : 0;

					return;
				} else if (object === undefined) {
					return;
				}
			}

			if (item !== undefined) {
				item = formatItem(item, branches, index);
				items.push(...item);
				
				if (previous !== undefined) {
					item[0].previous = previous;
				}

				if (i < length) {
					item[0].next = location;
				}
				
				previous = index;
				index = location;
			}

			item = object;
			branches = [];
			location += 1;
		});

		return items;
	}

	survey (reversed) {
		const { previous, next } = this;
		const item = reversed ? previous : next;
		const { [reversed ? 'previous' : 'next']: main, branches = [] } = item;

		if (main === undefined) {
			return branches;
		}

		return [main, ...branches];
	}

	populate (objects, index = 0) {
		if (!Array.isArray(objects)) {
			return;
		}

		const items = this.flatten(objects);
		const length = items.length;

		items.forEach(item => {
			const { previous, next, branches } = item;

			Object.assign(item, {
				previous: items[previous],
				next: items[next]
			});

			if (branches) {
				item.branches = branches.map(branch => items[branch]);
			}
		});

		index = Math.min(Math.max(0, index), length);

		const item = items[index];

		this.previous = item;
		this.next = item;

		const previous = this.survey(true)[0];
		const next = this.survey()[0];

		if (next) {
			this.next = next;
		} else if (previous) {
			this.previous = previous;
		}
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

		let remainder = this.complete();
		const { iterate, value, previous, next, continuous } = this;
		const reversed = isNegative(remainder);
		
		remainder = continuous ? 0 : remainder;

		if (value % 1 === 0) {
			const branches = this.survey(reversed);
			const objects = branches.map(branch => branch.item);
			const object = iterate(...objects);
			const index = objects.indexOf(object);
			let item = branches[index];
			const expected = reversed ? previous.previous : next.next;
			const diverted = item !== expected && expected !== undefined;

			if (object === undefined) {
				this.continuous = undefined;
				return;
			} else if (index === -1) {
				item = { previous: reversed ? previous : next, item: object };
			}

			if (reversed && !diverted) {
				this.value = 1;
				this.next = previous;
				this.previous = item;
			} else {
				remainder *= reversed ? -1 : 1;

				this.value = 0;
				this.previous = reversed ? previous : next;
				this.next = item;
			}
		}

		if (remainder || continuous) {
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

		reverse = isNegative(change);
		change = (constrainValue(destination) - value) || (reverse ? -0 : 0);

		const { item, branches = [] } = reverse ? previous : next;
		const main = reverse ? previous.previous : next.next;
		const count = branches.length + (main !== undefined ? 1 : 0);
		const duration = schedule(change, item, count);

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
