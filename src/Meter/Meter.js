import { linkItems } from './link-items';
import { gatherBranches } from './gather-branches';

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
			} else if (!i) {
				actions.push(item => item);
			} else {
				actions.push((item, previous = -1) => {
					if (item === undefined && typeof previous === 'number') {
						return previous + 1;
					}

					return item;
				});
			}
		}

		const [iterate, transform] = actions;
		
		this.resolve = resolve.bind(this);
		this.schedule = schedule;
		this.iterate = iterate.bind(state);
		this.transform = transform;
		this.state = state;

		this.populate(...parameters);
	}

	create (object, previous, diversion) {
		const { transform } = this;
		const state = {};
		const result = transform.call(state, object, (previous || {}).object);

		object = result !== undefined ? result : object;

		const item = { object, branches: [], state };

		if (previous) {
			item.previous = previous;

			if (!diversion) {
				previous.next = item;
			}
		}

		return item;
	}

	flatten (objects, item = { branches: [] }) {
		const self = this;
		const items = [];

		objects.forEach(object => {
			if (Array.isArray(object)) {
				const branch = self.flatten(object, item);

				if (Array.isArray(branch)) {
					items.push(...branch);
					item.branches.push(branch[0]);
				}
			} else if (typeof object === 'number') {
				item.branches.push(object);
			} else {
				item = self.create(object, item, !items.length);
				items.push(item);
			}
		});

		if (items.length) {
			return items;
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
		let reversed = isNegative(remainder);

		if (value % 1 === 0) {
			const ends = reversed ? [previous, next] : [next, previous];
			const branches = gatherBranches(...ends);
			const objects = branches.map(([branch]) => branch.object);
			const object = iterate(...objects);
			const index = objects.indexOf(object);
			let [item, end] = branches[index] || [];

			if (index === -1 && object !== undefined) {
				end = ends[0];
				item = this.create(object, end);
			}

			if (item === undefined) {
				this.continuous = undefined;
				return;
			}
		
			remainder = Math.abs(remainder);

			if (item === end.previous) {
				remainder *= -1;

				this.value = 1;
				this.change = -0;
				this.previous = item;
				this.next = end;
			} else {
				this.value = 0;
				this.change = 0;
				this.previous = end;
				this.next = item;
			}
		}

		if (continuous) {
			this.update(0);
		} else if (remainder) {
			this.update(remainder);
		}
	}

	populate (objects, index = 0) {
		objects = Array.isArray(objects) ? objects : [undefined];

		const { resolve, schedule } = this;
		const items = this.flatten([undefined, ...objects]);

		if (!items || items.length < 2) {
			return;
		}

		const item = linkItems(items, index);

		this.previous = item;
		this.next = item;
		this.value = 0;
		this.change = 0;

		schedule(0, item.object);
		resolve();
	}

	update (change) {
		const { resolve, schedule, next, previous, timeout } = this;
		let { state } = this;
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
		Object.assign(state, next.state);

		const { object } = reverse ? previous : next;
		const ends = reverse ? [previous, next] : [next, previous];
		const branches = gatherBranches(...ends);
		const count = branches.length;
		const duration = schedule.call(state, change, object, count);

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
