import { formatItem } from '../format-item';
import { Meter } from '../Meter';

jest.mock('../format-item', () => ({ formatItem: jest.fn() }));

describe('Meter', () => {
	describe('constructor', () => {
		const populate = jest.fn();
		const schedule = jest.fn();
		const iterate = jest.fn();
		const transform = jest.fn();

		beforeEach(() => {
			populate.mockClear();
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
			const actual = new Meter(schedule, iterate, transform);
			const previous = { item: 0 };
			const next = { item: 1 };

			previous.next = next;
			next.previous = previous;

			expect(actual).toEqual({
				resolve: expect.any(Function),
				schedule: expect.any(Function),
				iterate: expect.any(Function),
				transform,
				previous,
				next,
				value: 0,
				change: 0
			});

			expect(actual.schedule()).toBe('schedule');
			expect(actual.iterate()).toBe('iterate');
		});

		it('should initialize with default transform function', () => {
			const actual = new Meter(schedule, iterate);
			expect(actual.transform('item')).toBe('item');
		});

		it('should initialize with default iterate and transform functions', () => {
			const actual = new Meter(schedule);
			
			expect(actual.iterate('item')).toBe('item');
			expect(actual.transform('item')).toBe('item');
		});
	});

	describe('flatten', () => {
		const flatten = Meter.prototype.flatten;
		const transform = jest.fn();
		let context;

		beforeEach(() => {
			formatItem.mockClear().mockImplementation((item, branches) => {
				return [].concat({ item }, ...branches.reduce((array, branch) => {
					return array.concat(Array.isArray(branch) ? branch : []);
				}, []))
			});

			transform.mockClear().mockImplementation(value => {
				return value !== undefined ? `${value}Item` : undefined;
			});

			context = { transform };
			context.flatten = flatten.bind(context);
		});

		it('should flatten basic array', () => {
			const actual = flatten.call(context, ['first', 'second']);

			expect(transform.mock.calls).toEqual([
				['first', undefined],
				['second', 'firstItem']
			]);

			expect(formatItem.mock.calls).toEqual([
				['firstItem', [], 0],
				['secondItem', [], 1]
			]);

			expect(actual).toEqual([
				{ item: 'firstItem', next: 1 },
				{ previous: 0, item: 'secondItem' }
			]);
		});
		
		it('should flatten with branches', () => {
			const actual = flatten.call(context, [
				'first',
				['alpha', 'beta'],
				2,
				['other'],
				'second'
			]);

			expect(transform.mock.calls).toEqual([
				['first', undefined],
				['alpha', 'firstItem'],
				['beta', 'alphaItem'],
				['other', 'firstItem'],
				['second', 'firstItem']
			]);

			expect(formatItem.mock.calls).toEqual([
				['alphaItem', [], 1],
				['betaItem', [], 2],
				['otherItem', [], 3],
				['firstItem', [
					[
						{ item: 'alphaItem', next: 2 },
						{ previous: 1, item: 'betaItem' }
					],
					2,
					[{ item: 'otherItem' }]
				], 0],
				['secondItem', [], 4]
			]);

			expect(actual).toEqual([
				{ item: 'firstItem', next: 4 },
				{ item: 'alphaItem', next: 2 },
				{ previous: 1, item: 'betaItem' },
				{ item: 'otherItem' },
				{ previous: 0, item: 'secondItem' }
			]);
		});

		it('should ignore undefined items', () => {
			const actual = flatten.call(context, ['first', undefined, 'second']);

			expect(transform.mock.calls).toEqual([
				['first', undefined],
				[undefined, 'firstItem'],
				['second', 'firstItem']
			]);

			expect(formatItem.mock.calls).toEqual([
				['firstItem', [], 0],
				['secondItem', [], 1]
			]);

			expect(actual).toEqual([
				{ item: 'firstItem', next: 1 },
				{ previous: 0, item: 'secondItem' }
			]);
		});

		it('should return undefined if there are no items', () => {
			const actual = flatten.call(context, [undefined]);
			expect(actual).toBeUndefined();
		});

		it('should ignore empty path', () => {
			const actual = flatten.call(context, ['first', [undefined]]);
			expect(actual).toEqual([{ item: 'firstItem' }]);
		});

		it('should ignore branches that occur before any item', () => {
			const actual = flatten.call(context, [
				['alpha', 'beta'],
				'first'
			]);

			expect(transform.mock.calls).toEqual([
				['alpha', undefined],
				['beta', 'alphaItem'],
				['first', undefined]
			]);

			expect(formatItem.mock.calls).toEqual([
				['alphaItem', [], 0],
				['betaItem', [], 1],
				['firstItem', [], 0]
			]);

			expect(actual).toEqual([
				{ item: 'firstItem' }
			]);
		});
	});

	describe('survey', () => {
		const survey = Meter.prototype.survey;
		let first;
		let second;
		let alpha;
		let beta;
		let third;
		let context;

		beforeEach(() => {
			first = { item: 'first' };
			second = { item: 'second' };
			alpha = { item: 'alpha' };
			beta = { item: 'beta' };
			third = { item: 'third' };

			const item = {
				previous: {
					...first,
					next: second
				},
				...second,
				next: {
					previous: second,
					...third
				},
				branches: [alpha, beta]
			};

			context = {
				previous: item,
				next: item
			};
		});

		it('should survey forward items', () => {
			const actual = survey.call(context, false);
			expect(actual).toMatchObject([third, alpha, beta]);
		});

		it('should survey backward items', () => {
			const actual = survey.call(context, true);
			expect(actual).toMatchObject([first, alpha, beta]);
		});

		it('should survey forward items of last item', () => {
			context.next = context.next.next;
			const actual = survey.call(context, false);

			expect(actual).toHaveLength(0);
		});

		it('should survey backward items of first item', () => {
			context.previous = context.previous.previous;
			const actual = survey.call(context, true);
			
			expect(actual).toHaveLength(0);
		});
	});

	describe('populate', () => {
		const populate = Meter.prototype.populate;
		const flatten = jest.fn();
		const survey = jest.fn();
		const schedule = jest.fn();
		const iterate = jest.fn();
		let first;
		let alpha;
		let beta;
		let second;
		let context;

		beforeEach(() => {
			first = { item: 'first' };
			alpha = { item: 'alpha' };
			beta = { item: 'beta' };
			second = { item: 'second' };

			flatten.mockClear().mockReturnValue([
				{
					...first,
					next: 3,
					branches: [1, 2]
				},
				{
					previous: 0,
					...alpha,
					next: 2
				},
				{
					previous: 1,
					...beta
				},
				{
					previous: 0,
					...second
				}
			]);

			survey.mockClear().mockImplementation(function (reversed) {
				return reversed ? [] : [{ item: 'nextItem' }];
			});

			schedule.mockClear();
			iterate.mockClear();

			context = {
				flatten,
				survey,
				schedule,
				iterate,
				value: 0.5,
				change: 0.25
			};
		});

		it('should populate the meter', () => {
			populate.call(context, ['first', 'second']);

			expect(flatten).toHaveBeenCalledWith(['first', 'second']);
			expect(survey).toHaveBeenCalledWith();
			expect(schedule).toHaveBeenCalledWith(0, 'first');
			expect(iterate).toHaveBeenCalledWith('nextItem');

			expect(context).toMatchObject({
				value: 0,
				change: 0,
				previous: {
					...first,
					next: {
						previous: first,
						...second
					},
					branches: [
						{
							previous: first,
							...alpha,
							next: beta
						}, {
							previous: alpha,
							...beta
						}
					]
				},
				next: { item: 'nextItem' },
			});
		});

		it('should populate the meter and set a position', () => {
			survey.mockImplementation(function (reversed) {
				return reversed ? [{ item: 'previousItem' }] : [];
			});

			populate.call(context, ['first', 'second'], 3);

			expect(flatten).toHaveBeenCalledWith(['first', 'second']);
			expect(survey).toHaveBeenCalledWith();
			expect(schedule).toHaveBeenCalledWith(0, 'second');
			expect(iterate).toHaveBeenCalledWith('first');

			expect(context).toMatchObject({
				value: 1,
				change: -0,
				previous: { item: 'first' },
				next: {
					previous: {
						...first,
						next: second,
						branches: [
							{
								previous: first,
								...alpha,
								next: beta
							}, {
								previous: alpha,
								...beta
							}
						]
					},
					...second
				}
			});
		});

		it('should not populate the meter when an array is not provided', () => {
			populate.call(context, 'item');

			expect(flatten).not.toHaveBeenCalled();
			expect(survey).not.toHaveBeenCalled();

			expect(context).toEqual({
				flatten,
				survey,
				schedule,
				iterate,
				value: 0.5,
				change: 0.25
			});
		});

		it('should not populate the meter when there are not enough items', () => {
			flatten.mockReturnValue([{ item: 'only' }]);
			survey.mockReturnValue([]);
			populate.call(context, ['only']);

			expect(context).toEqual({
				flatten,
				survey,
				schedule,
				iterate,
				value: 0.5,
				change: 0.25
			});
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
		const survey = jest.fn();
		const complete = jest.fn();
		const update = jest.fn();
		const iterate = jest.fn();
		let previous;
		let next;
		let item;
		let other;
		let context;

		beforeEach(() => {
			previous = { previous: 0, item: 'previous' };
			next = { item: 'next', next: 0 };
			item = { item: 'item' };
			other = { item: 'other' };

			previous.previous = item;
			next.next = item;

			survey.mockClear().mockReturnValue([item, other]);
			complete.mockClear().mockReturnValue(0.5);
			update.mockClear();
			iterate.mockClear().mockReturnValue('item');

			context = {
				survey,
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
			expect(iterate).toHaveBeenCalledWith('item', 'other');
			expect(update).toHaveBeenCalledWith(0.5);

			expect(context).toMatchObject({
				previous: next,
				next: item,
				duration: undefined
			});
		});

		it('should resolve a draining update', () => {
			complete.mockReturnValue(-0.5);
			context.value = 0;
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith();
			expect(iterate).toHaveBeenCalledWith('item', 'other');
			expect(update).toHaveBeenCalledWith(-0.5);

			expect(context).toMatchObject({
				previous: item,
				next: previous,
				duration: undefined
			});
		});

		it('should resolve a draining update that diverts', () => {
			complete.mockReturnValue(-0.5);
			iterate.mockReturnValue('other');
			context.value = 0;
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith();
			expect(iterate).toHaveBeenCalledWith('item', 'other');
			expect(update).toHaveBeenCalledWith(0.5);

			expect(context).toMatchObject({
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
			expect(iterate).not.toHaveBeenCalled();
			expect(update).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				previous,
				next
			});
		});
		
		it('should resolve an update without iterating', () => {
			iterate.mockReturnValue();
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

	describe('update', () => {
		const update = Meter.prototype.update;
		const now = jest.fn();
		const clearTimeout = jest.fn();
		const setTimeout = jest.fn();
		const measure = jest.fn();
		const complete = jest.fn();
		const resolve = jest.fn();
		const schedule = jest.fn();
		let context;

		beforeEach(() => {
			window.Date.now = now.mockClear().mockReturnValue(1000);
			window.clearTimeout = clearTimeout.mockClear();
			window.setTimeout = setTimeout.mockClear().mockReturnValue('timeout');
			measure.mockClear().mockReturnValue(0.25);
			complete.mockClear();
			resolve.mockClear();
			schedule.mockClear().mockReturnValue('duration');

			context = {
				measure,
				complete,
				resolve,
				schedule,
				change: 0.5,
				previous: { item: 'previous' },
				next: { item: 'next', branches: ['alpha', 'beta'] },
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
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous', 0);
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(setTimeout).toHaveBeenCalledWith(resolve, 'duration');
			expect(actual).toBe(-0.75);

			expect(context).toMatchObject({
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
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous', 0);
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(setTimeout).toHaveBeenCalledWith(resolve, 'duration');
			expect(actual).toBe(-0.75);

			expect(context).toMatchObject({
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
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous', 0);
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(setTimeout).toHaveBeenCalledWith(resolve, 'duration');
			expect(actual).toBe(-0.75);

			expect(context).toMatchObject({
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
