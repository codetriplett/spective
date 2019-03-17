import { organizeSegments } from '../organize-segments';
import { Meter } from '../Meter';

jest.mock('../organize-segments', () => ({ organizeSegments: jest.fn() }));

describe('Meter', () => {
	describe('constructor', () => {
		const update = jest.fn();
		let segments;

		beforeEach(() => {
			segments = [{ upperValue: 1 }];

			Meter.prototype.update = update.mockClear();
			organizeSegments.mockClear().mockReturnValue(segments);
		});

		it('should initialize', () => {
			const actual = new Meter('action');

			expect(organizeSegments).toHaveBeenCalledWith('action');
			expect(update).not.toHaveBeenCalled();
			
			expect(actual).toEqual({
				resolve: expect.any(Function),
				segments,
				index: 0,
				value: 0,
				change: 0
			});
		});

		it('should set a value', () => {
			new Meter('action', 2);

			expect(organizeSegments).toHaveBeenCalledWith('action');
			expect(update).toHaveBeenCalledWith(2);
		});

		it('should set a value and duration', () => {
			new Meter('action', 2, 2000);

			expect(organizeSegments).toHaveBeenCalledWith('action');
			expect(update).toHaveBeenCalledWith(2, 2000);
		});
		
		it('should set a value and duration when there are no actions', () => {
			new Meter(2, 2000);

			expect(organizeSegments).toHaveBeenCalledWith();
			expect(update).toHaveBeenCalledWith(2, 2000);
		});
	});

	describe('measure', () => {
		const measure = Meter.prototype.measure;
		const now = jest.fn();
		let context;

		beforeEach(() => {
			window.Date.now = now.mockClear().mockReturnValue(1000);

			context = {
				segments: [{ upperValue: 1 }],
				value: 0.5,
				change: 0.375,
				duration: 300,
				timestamp: 900
			};
		});

		it('should measure a timed meter', () => {
			const actual = measure.call(context);
			expect(actual).toBe(0.25);
		});

		it('should measure a timed meter when reversed', () => {
			context.change = -0.375;
			const actual = measure.call(context);

			expect(actual).toBe(-0.25);
		});

		it('should measure an instant meter', () => {
			Object.assign(context, {
				duration: undefined,
				timestamp: undefined
			});

			const actual = measure.call(context);

			expect(actual).toBe(0.5);
		});

		it('should measure an instant meter when reversed', () => {
			Object.assign(context, {
				change: -0.375,
				duration: undefined,
				timestamp: undefined
			});

			const actual = measure.call(context);

			expect(actual).toBe(-0.5);
		});
	});

	describe('resolve', () => {
		const resolve = Meter.prototype.resolve;
		const schedule = jest.fn();
		const first = jest.fn();
		const second = jest.fn();
		const third = jest.fn();
		let context;

		beforeEach(() => {
			schedule.mockClear();
			first.mockClear();
			second.mockClear();
			third.mockClear();

			context = {
				schedule,
				segments: [
					{
						lowerValue: 0,
						upperValue: 0,
						upperCallback: first
					}, {
						lowerValue: 0,
						lowerCallback: first,
						upperValue: 2,
						upperCallback: second
					}, {
						lowerValue: 2,
						lowerCallback: second,
						upperValue: 3,
						upperCallback: third
					}
				],
				index: 1,
				value: 1.5,
				change: 1,
				duration: 200
			};
		});

		it('should resolve from the beginning of a segment', () => {
			context.change = 1.5;
			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context.index).toBe(1);
		});

		it('should resolve from the end of a segment', () => {
			context.change = -0.5;
			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context.index).toBe(1);
		});

		it('should resolve within a segment', () => {
			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context.index).toBe(1);
		});

		it('should resolve at the end of a segment', () => {
			context.value = 2;
			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(1, 2);
			expect(third).not.toHaveBeenCalled();

			expect(context.index).toBe(2);
		});

		it('should resolve at the end of the last segment', () => {
			Object.assign(context, {
				index: 2,
				value: 3
			});

			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).toHaveBeenCalledWith(1, 3);

			expect(context.index).toBe(2);
		});

		it('should resolve at the beginning of a segment', () => {
			Object.assign(context, {
				value: 0,
				change: -1
			});

			resolve.call(context);

			expect(first).toHaveBeenCalledWith(-1, 0);
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context.index).toBe(0);
		});

		it('should resolve at the beginning of the first segment', () => {
			const zero = jest.fn();

			Object.assign(context.segments[0], {
				lowerCallback: zero,
				upperValue: 1
			});

			Object.assign(context, {
				index: 0,
				value: 0,
				change: -1
			});

			resolve.call(context);

			expect(zero).toHaveBeenCalledWith(-1, 0);
			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context.index).toBe(0);
		});
	});

	describe('schedule', () => {
		const schedule = Meter.prototype.schedule;
		const resolve = jest.fn();
		const clearTimeout = jest.fn();
		const setTimeout = jest.fn();
		let context;

		beforeEach(() => {
			window.clearTimeout = clearTimeout.mockClear();
			window.setTimeout = setTimeout.mockClear().mockReturnValue('timeout');

			resolve.mockClear().mockReturnValue('resolve');

			context = {
				resolve,
				segments: [
					{ lowerValue: 0, upperValue: 0 },
					{ lowerValue: 0, upperValue: 2 },
					{ lowerValue: 2, upperValue: 3 }
				],
				index: 1,
				value: 1.75,
				change: 0.75,
				duration: 200
			};
		});

		it('should schedule a timed resolution', () => {
			const actual = schedule.call(context);

			expect(setTimeout).not.toHaveBeenCalled();
			expect(context.timeout).toBeUndefined();
			expect(actual).toBeUndefined();
		});

		it('should schedule the beginning of a timed resolution', () => {
			context.value = 2.5;
			const actual = schedule.call(context);

			expect(setTimeout).toHaveBeenCalledWith(resolve, 67);
			expect(context.timeout).toBe('timeout');
			expect(actual).toBe(67);
		});

		it('should schedule a timed resolution that reaches the end of a segment', () => {
			context.value = 2;
			const actual = schedule.call(context);

			expect(setTimeout).toHaveBeenCalledWith(resolve, 200);
			expect(context.timeout).toBe('timeout');
			expect(actual).toBe(200);
		});

		it('should schedule a timed resolution past past the end of a segment', () => {
			Object.assign(context, {
				index: 0,
				value: 1.75
			});

			const actual = schedule.call(context);

			expect(setTimeout).not.toHaveBeenCalled();
			expect(context.timeout).toBeUndefined();
			expect(actual).toBe('resolve');
		});

		it('should schedule the end of a timed resolution', () => {
			Object.assign(context, {
				index: 2,
				value: 2.5
			});

			const actual = schedule.call(context);

			expect(setTimeout).not.toHaveBeenCalled();
			expect(context.timeout).toBeUndefined();
			expect(actual).toBeUndefined();
		});

		it('should schedule an instant resolution', () => {
			context.duration = undefined;
			const actual = schedule.call(context);

			expect(setTimeout).not.toHaveBeenCalled();
			expect(resolve).not.toHaveBeenCalled();
			expect(context.timeout).toBeUndefined();
			expect(actual).toBeUndefined();
		});

		it('should schedule an instant resolution', () => {
			context.duration = undefined;
			const actual = schedule.call(context);

			expect(setTimeout).not.toHaveBeenCalled();
			expect(resolve).not.toHaveBeenCalled();
			expect(context.timeout).toBeUndefined();
			expect(actual).toBeUndefined();
		});
		
		it('should schedule the beginning of an instant resolution', () => {
			Object.assign(context, {
				value: 2.5,
				duration: undefined
			});

			const actual = schedule.call(context);

			expect(setTimeout).not.toHaveBeenCalled();
			expect(context.timeout).toBeUndefined();
			expect(actual).toBe('resolve');
		});
	});

	describe('update', () => {
		const update = Meter.prototype.update;
		const measure = jest.fn();
		const schedule = jest.fn();
		const clearTimeout = jest.fn();
		const now = jest.fn();
		let segments;
		let context;

		beforeEach(() => {
			window.clearTimeout = clearTimeout.mockClear();
			window.Date.now = now.mockClear().mockReturnValue('timestamp');

			measure.mockClear().mockReturnValue(0.75);
			schedule.mockClear().mockReturnValue('schedule');

			segments = [{ upperValue: 2 }];

			context = {
				measure,
				schedule,
				segments,
				timeout: 'timeout'
			};
		});

		it('should update to an absolute value', () => {
			const actual = update.call(context, 1.5);

			expect(measure).toHaveBeenCalled();
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(schedule).toHaveBeenCalled();
			expect(actual).toBe('schedule');

			expect(context).toEqual({
				measure,
				schedule,
				segments,
				value: 1.5,
				change: 0.75
			});
		});

		it('should update to an absolute value from the end', () => {
			const actual = update.call(context, -1.5);

			expect(measure).toHaveBeenCalled();
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(schedule).toHaveBeenCalled();
			expect(actual).toBe('schedule');

			expect(context).toEqual({
				measure,
				schedule,
				segments,
				value: 0.5,
				change: -0.25,
				duration: undefined,
				timestamp: undefined
			});
		});

		it('should set a relative value', () => {
			const actual = update.call(context, 0.5, 2000);

			expect(measure).toHaveBeenCalled();
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(schedule).toHaveBeenCalled();
			expect(actual).toBe('schedule');

			expect(context).toEqual({
				measure,
				schedule,
				segments,
				value: 1.25,
				change: 0.5,
				duration: 2000,
				timestamp: 'timestamp'
			});
		});

		it('should set a negative relative value', () => {
			const actual = update.call(context, -0.5, 2000);

			expect(measure).toHaveBeenCalled();
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(schedule).toHaveBeenCalled();
			expect(actual).toBe('schedule');

			expect(context).toEqual({
				measure,
				schedule,
				segments,
				value: 0.25,
				change: -0.5,
				duration: 2000,
				timestamp: 'timestamp'
			});
		});
	});
});
