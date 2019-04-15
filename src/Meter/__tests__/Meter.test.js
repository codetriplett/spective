import { linkItems } from '../link-items';
import { gatherBranches } from '../gather-branches';
import { Meter } from '../Meter';

jest.mock('../link-items', () => ({ linkItems: jest.fn() }));
jest.mock('../gather-branches', () => ({ gatherBranches: jest.fn() }));

describe('Meter', () => {
	describe('constructor', () => {
		const populate = jest.fn();
		const schedule = jest.fn();
		const iterate = jest.fn();
		const transform = jest.fn();

		beforeEach(() => {
			Meter.prototype.populate = populate.mockClear();
			transform.mockClear().mockReturnValue('transform');

			schedule.mockClear().mockImplementation(function () {
				this.value = 'iterate';
				return 'schedule';
			});

			iterate.mockClear().mockImplementation(function () {
				return this.value;
			});
		});

		it('should initialize', () => {
			const actual = new Meter(schedule, iterate, transform, ['first', 'second'], 1);

			expect(actual).toEqual({
				resolve: expect.any(Function),
				schedule: expect.any(Function),
				iterate: expect.any(Function),
				transform,
				state: {}
			});

			expect(actual.schedule.call(actual.state)).toBe('schedule');
			expect(actual.iterate()).toBe('iterate');
			expect(actual.transform()).toBe('transform');
			expect(populate).toHaveBeenCalledWith(['first', 'second'], 1);
		});

		it('should initialize with default transform functions', () => {
			const actual = new Meter(schedule, iterate, ['first', 'second'], 1);

			expect(actual.transform('item')).toBe('item');
			expect(populate).toHaveBeenCalledWith(['first', 'second'], 1);
		});

		it('should initialize with default iterate and transform functions', () => {
			const actual = new Meter(schedule, ['first', 'second'], 1);
			
			expect(actual.iterate('item')).toBe('item');
			expect(actual.transform('item')).toBe('item');
			expect(populate).toHaveBeenCalledWith(['first', 'second'], 1);
		});
	});

	describe('create', () => {
		const create = Meter.prototype.create;
		const transform = jest.fn();
		let previous;
		let context;

		beforeEach(() => {
			transform.mockClear().mockImplementation(function (object) {
				this.object = object;
				return 'transform';
			});

			previous = { object: 'previous', branches: [], state: {}, depth: 0 };
			context = { transform };
		});

		it('should create initial item', () => {
			const actual = create.call(context, 'object', undefined, false);

			expect(transform).toHaveBeenCalledWith('object', undefined, 0);

			expect(actual).toEqual({
				object: 'transform',
				branches: [],
				state: { object: 'object' },
				depth: 0
			});
		});

		it('should create following item', () => {
			const actual = create.call(context, 'object', previous, true);

			expect(transform).toHaveBeenCalledWith('object', 'previous', 0);
			expect(previous.next).toEqual(actual);
			expect(actual.previous).toEqual(previous);
		});

		it('should create diverted item', () => {
			const actual = create.call(context, 'object', previous, false);

			expect(transform).toHaveBeenCalledWith('object', 'previous', 1);
			expect(previous.next).toBeUndefined();
			expect(actual.previous).toEqual(previous);
		});

		it('should not create empty item', () => {
			transform.mockReturnValue();
			const actual = create.call(context, 'object', previous, true);

			expect(transform).toHaveBeenCalledWith('object', 'previous', 0);

			expect(actual).toEqual({
				object: 'object',
				branches: [],
				state: {},
				depth: 0,
				previous
			});
		});
	});

	describe('flatten', () => {
		const flatten = Meter.prototype.flatten;
		const create = jest.fn();
		let first;
		let second;
		let alpha;
		let beta;
		let other;
		let third;
		let fourth;
		let context;

		beforeEach(() => {
			create.mockClear().mockImplementation(object => ({ object, branches: [] }));

			first = { object: undefined, branches: [] };
			second = { object: 'second', branches: [] };
			alpha = { object: 'alpha', branches: [] };
			beta = { object: 'beta', branches: [] };
			other = { object: 'other', branches: [] };
			third = { object: 'third', branches: [] };
			fourth = { object: 'fourth', branches: [] };

			Object.assign(beta, { branches: [5] });
			Object.assign(other, { branches: [-2] });
			Object.assign(third, { branches: [3] });

			context = { create };
			context.flatten = flatten.bind(context);
		});
		
		it('should flatten array', () => {
			const actual = flatten.call(context, [
				undefined,
				'second',
				['alpha', 'beta', 5],
				['other', -2],
				'third',
				3,
				'fourth'
			]);

			expect(create.mock.calls).toEqual([
				[undefined, { branches: [] }, false],
				['second', first, true],
				['alpha', second, false],
				['beta', alpha, true],
				['other', second, false],
				['third', second, true],
				['fourth', third, true]
			]);

			expect(actual).toEqual([
				first,
				second,
				alpha,
				beta,
				other,
				third,
				fourth
			]);
		});
	});

	describe('measure', () => {
		const measure = Meter.prototype.measure;
		const now = jest.fn();
		let context;

		beforeEach(() => {
			window.Date.now = now.mockClear().mockReturnValue(1000);

			context = {
				value: 0.5,
				change: 0.4,
				duration: 400,
				timestamp: 900
			};
		});

		it('should measure a partial update', () => {
			const actual = measure.call(context);
			expect(actual).toBe(0.19999999999999996);
		});

		it('should measure a completed update', () => {
			const actual = measure.call({ value: 0.5, change: 0 });
			expect(actual).toBe(0.5);
		});

		it('should measure an unresolved update', () => {
			now.mockReturnValue(2000);
			const actual = measure.call({ value: 0.5, change: 0 });
			expect(actual).toBe(0.5);
		});
	});

	describe('complete', () => {
		const complete = Meter.prototype.complete;
		const measure = jest.fn();
		const clearTimeout = jest.fn();
		let context;

		beforeEach(() => {
			window.clearTimeout = clearTimeout.mockClear();
			measure.mockClear().mockReturnValue(0.2);

			context = {
				measure,
				value: 0.5,
				change: 0.4,
				duration: 400,
				timestamp: 900,
				timeout: 'timeout'
			};
		});

		it('should complete a filling update', () => {
			const actual = complete.call(context);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(actual).toBe(0.3);

			expect(context).toMatchObject({
				value: 0.2,
				change: 0,
				duration: undefined,
				timestamp: undefined,
				timeout: undefined
			});
		});

		it('should complete a draining update', () => {
			measure.mockReturnValue(0.8);
			context.change = -0.4;
			const actual = complete.call(context);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(actual).toBe(-0.30000000000000004);

			expect(context).toMatchObject({
				value: 0.8,
				change: -0,
				duration: undefined,
				timestamp: undefined,
				timeout: undefined
			});
		});

		it('should complete a filling update at the end', () => {
			measure.mockReturnValue(1);
			context.value = 1;
			const actual = complete.call(context);

			expect(actual).toBe(0);
		});

		it('should complete a draining update at the beginning', () => {
			measure.mockReturnValue(0);
			
			Object.assign(context, {
				value: 0,
				change: -0.4
			});

			const actual = complete.call(context);

			expect(actual).toBe(-0);
		});
	});

	describe('resolve', () => {
		const resolve = Meter.prototype.resolve;
		const create = jest.fn();
		const complete = jest.fn();
		const update = jest.fn();
		const iterate = jest.fn();
		let previous;
		let next;
		let item;
		let other;
		let end;
		let context;

		beforeEach(() => {
			previous = { object: 'previous' };
			next = { object: 'next' };
			item = { object: 'item' };
			other = { object: 'other' };

			previous.previous = item;
			previous.next = other;
			next.previous = other;
			next.next = item;
			end = next;

			gatherBranches.mockClear().mockImplementation(() => ([
				[item, end],
				[other, end]
			]));

			create.mockClear().mockReturnValue('create');
			complete.mockClear().mockReturnValue(0.5);
			update.mockClear();
			iterate.mockClear().mockReturnValue('item');

			context = {
				create,
				complete,
				update,
				iterate,
				previous,
				next,
				value: 1,
				duration: 200
			};
		});

		it('should resolve a filling update', () => {
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith();
			expect(gatherBranches).toHaveBeenCalledWith(next, previous);
			expect(iterate).toHaveBeenCalledWith('item', 'other');
			expect(update).toHaveBeenCalledWith(0.5);

			expect(context).toMatchObject({
				value: 0,
				change: 0,
				previous: next,
				next: item,
				duration: undefined
			});
		});

		it('should resolve a draining update', () => {
			end = previous;
			complete.mockReturnValue(-0.5);
			context.value = 0;
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith();
			expect(gatherBranches).toHaveBeenCalledWith(previous, next);
			expect(iterate).toHaveBeenCalledWith('item', 'other');
			expect(update).toHaveBeenCalledWith(-0.5);

			expect(context).toMatchObject({
				value: 1,
				change: -0,
				previous: item,
				next: previous,
				duration: undefined
			});
		});

		it('should resolve a filling update that diverts', () => {
			iterate.mockReturnValue('other');
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith();
			expect(gatherBranches).toHaveBeenCalledWith(next, previous);
			expect(iterate).toHaveBeenCalledWith('item', 'other');
			expect(update).toHaveBeenCalledWith(-0.5);

			expect(context).toMatchObject({
				value: 1,
				change: -0,
				previous: other,
				next,
				duration: undefined
			});
		});

		it('should resolve a draining update that diverts', () => {
			end = previous;
			complete.mockReturnValue(-0.5);
			iterate.mockReturnValue('other');
			context.value = 0;
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith();
			expect(gatherBranches).toHaveBeenCalledWith(previous, next);
			expect(iterate).toHaveBeenCalledWith('item', 'other');
			expect(update).toHaveBeenCalledWith(0.5);

			expect(context).toMatchObject({
				value: 0,
				change: 0,
				previous,
				next: other,
				duration: undefined
			});
		});

		it('should resolve an update without calling the iterator', () => {
			complete.mockReturnValue(0);
			context.value = 0.5;
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith();
			expect(gatherBranches).not.toHaveBeenCalled();
			expect(iterate).not.toHaveBeenCalled();
			expect(update).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				previous,
				next
			});
		});
		
		it('should resolve an update without iterating', () => {
			iterate.mockReturnValue();
			create.mockReturnValue();
			resolve.call(context);

			expect(update).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				previous,
				next
			});
		});

		it('should resolve an update without another update', () => {
			complete.mockReturnValue(0);
			resolve.call(context);

			expect(update).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				previous: next,
				next: item
			});
		});

		it('should resolve a continuous update', () => {
			context.continuous = true;
			resolve.call(context);

			expect(update).toHaveBeenCalledWith(0);

			expect(context).toMatchObject({
				previous: next,
				next: item
			});
		});
	});

	describe('populate', () => {
		const populate = Meter.prototype.populate;
		const flatten = jest.fn();
		const resolve = jest.fn();
		const schedule = jest.fn();
		let context;

		beforeEach(() => {
			linkItems.mockClear().mockReturnValue({ object: 'item' });
			flatten.mockClear().mockReturnValue(['first', 'second']);
			resolve.mockClear();
			schedule.mockClear();

			context = {
				flatten,
				resolve,
				schedule
			};
		});

		it('should populate the meter', () => {
			populate.call(context, ['first', 'second']);

			expect(flatten).toHaveBeenCalledWith([undefined, 'first', 'second']);

			expect(linkItems).toHaveBeenCalledWith(['first', 'second'], 0);
			expect(schedule).toHaveBeenCalledWith(0, 'item');
			expect(resolve).toHaveBeenCalled();

			expect(context).toMatchObject({
				previous: { object: 'item' },
				next: { object: 'item' }
			});
		});

		it('should populate the meter and set a position', () => {
			populate.call(context, ['first', 'second'], 3);
			expect(linkItems).toHaveBeenCalledWith(['first', 'second'], 3);
		});

		it('should not populate the meter when there are not enough items', () => {
			flatten.mockReturnValue([{ object: 'only' }]);
			populate.call(context, ['only']);

			expect(context).toEqual({
				flatten,
				resolve,
				schedule
			});
		});
	});

	describe('update', () => {
		const update = Meter.prototype.update;
		const now = jest.fn();
		const clearTimeout = jest.fn();
		const setTimeout = jest.fn();
		const measure = jest.fn();
		const complete = jest.fn();
		const resolve = jest.fn();
		const schedule = jest.fn();
		let state;
		let context;

		beforeEach(() => {
			window.Date.now = now.mockClear().mockReturnValue(1000);
			window.clearTimeout = clearTimeout.mockClear();
			window.setTimeout = setTimeout.mockClear().mockReturnValue('timeout');
			measure.mockClear().mockReturnValue(0.25);
			complete.mockClear();
			resolve.mockClear();
			schedule.mockClear().mockReturnValue('duration');
			
			gatherBranches.mockClear().mockReturnValue([
				['main', 'item'],
				['side', 'item']
			]);

			state = { keep: 'existing', update: 'existing' };

			context = {
				measure,
				complete,
				resolve,
				schedule,
				state,
				change: 0.5,
				previous: { object: 'previous' },
				next: { object: 'next', branches: ['alpha', 'beta'], state: { update: 'update', add: 'update' } },
				timeout: 'timeout'
			};
		});

		it('should update the meter in the positive direction', () => {
			const actual = update.call(context, 1);

			expect(measure).toHaveBeenCalled();
			expect(schedule).toHaveBeenCalledWith(0.75, 'next', 2);
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(setTimeout).toHaveBeenCalledWith(resolve, 'duration');
			expect(actual).toBe(1.25);

			expect(context).toMatchObject({
				state: { keep: 'existing', update: 'update', add: 'update' },
				value: 1.25,
				change: 0.75,
				duration: 'duration',
				timestamp: 1000,
				timeout: 'timeout',
				continuous: undefined
			});
		});

		it('should update the meter in the negative direction', () => {
			const actual = update.call(context, -1);

			expect(measure).toHaveBeenCalled();
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous', 2);
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(setTimeout).toHaveBeenCalledWith(resolve, 'duration');
			expect(actual).toBe(-0.75);

			expect(context).toMatchObject({
				state: { keep: 'existing', update: 'update', add: 'update' },
				value: -0.75,
				change: -0.25,
				duration: 'duration',
				timestamp: 1000,
				timeout: 'timeout',
				continuous: undefined
			});
		});

		it('should maintain a positive update', () => {
			const actual = update.call(context, 0);

			expect(measure).toHaveBeenCalled();
			expect(schedule).toHaveBeenCalledWith(0.75, 'next', 2);
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(setTimeout).toHaveBeenCalledWith(resolve, 'duration');
			expect(actual).toBe(1.25);

			expect(context).toMatchObject({
				state: { keep: 'existing', update: 'update', add: 'update' },
				value: 1.25,
				change: 0.75,
				duration: 'duration',
				timestamp: 1000,
				timeout: 'timeout',
				continuous: true
			});
		});

		it('should maintain a negative update', () => {
			context.change = -0.5;
			const actual = update.call(context, 0);

			expect(measure).toHaveBeenCalled();
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous', 2);
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(setTimeout).toHaveBeenCalledWith(resolve, 'duration');
			expect(actual).toBe(-0.75);

			expect(context).toMatchObject({
				state: { keep: 'existing', update: 'update', add: 'update' },
				value: -0.75,
				change: -0.25,
				duration: 'duration',
				timestamp: 1000,
				timeout: 'timeout',
				continuous: true
			});
		});

		it('should reverse a positive update', () => {
			const actual = update.call(context, -0);

			expect(measure).toHaveBeenCalled();
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous', 2);
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(setTimeout).toHaveBeenCalledWith(resolve, 'duration');
			expect(actual).toBe(-0.75);

			expect(context).toMatchObject({
				state: { keep: 'existing', update: 'update', add: 'update' },
				value: -0.75,
				change: -0.25,
				duration: 'duration',
				timestamp: 1000,
				timeout: 'timeout',
				continuous: true
			});
		});

		it('should reverse a negative update', () => {
			context.change = -0.5;
			const actual = update.call(context, -0);

			expect(measure).toHaveBeenCalled();
			expect(schedule).toHaveBeenCalledWith(0.75, 'next', 2);
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(setTimeout).toHaveBeenCalledWith(resolve, 'duration');
			expect(actual).toBe(1.25);

			expect(context).toMatchObject({
				state: { keep: 'existing', update: 'update', add: 'update' },
				value: 1.25,
				change: 0.75,
				duration: 'duration',
				timestamp: 1000,
				timeout: 'timeout',
				continuous: true
			});
		});

		it('should not update when there is no change', () => {
			const actual = update.call(context);

			expect(measure).toHaveBeenCalled();
			expect(complete).toHaveBeenCalled();
			expect(schedule).toHaveBeenCalledWith(0, 'next', 2);
			expect(clearTimeout).not.toHaveBeenCalled();
			expect(setTimeout).not.toHaveBeenCalled();
			expect(actual).toBe(0.25);

			expect(context.value).toBeUndefined();
		});

		it('should not update when there is no duration', () => {
			schedule.mockReturnValue();
			const actual = update.call(context, 1);

			expect(measure).toHaveBeenCalled();
			expect(schedule).toHaveBeenCalledWith(0.75, 'next', 2);
			expect(setTimeout).not.toHaveBeenCalled();
			expect(actual).toBe(0.25);

			expect(context.value).toBeUndefined();
		});
	});
});
