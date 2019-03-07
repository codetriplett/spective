import { organizeSegments } from '../organize-segments';
import { Meter } from '../Meter';

jest.mock('../organize-segments', () => ({ organizeSegments: jest.fn() }));

describe('Meter', () => {
	describe('constructor', () => {
		const update = jest.fn();
		let segments;

		beforeEach(() => {
			segments = [{ threshold: 1 }];

			Meter.prototype.update = update.mockClear();
			organizeSegments.mockClear().mockReturnValue(segments);
		});

		it('should initialize', () => {
			const actual = new Meter('action');

			expect(organizeSegments).toHaveBeenCalledWith('action');
			expect(update).toHaveBeenCalledWith();
			
			expect(actual).toEqual({
				value: 0,
				index: 0,
				segments,
				measure: expect.any(Function),
				resolve: expect.any(Function),
				update: expect.any(Function)
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
				fromValue: 0.5,
				toValue: 2.5,
				duration: 200,
				timestamp: 900
			};
		});

		it('should measure the meter', () => {
			const actual = measure.call(context);

			expect(context.value).toBe(1.5);
			expect(actual).toBe(1.5);
		});

		it('should measure the meter without a timestamp', () => {
			context.timestamp = undefined;
			const actual = measure.call(context);

			expect(context.value).toBe(0.5);
			expect(actual).toBe(0.5);
		});

		it('should measure the meter without a duration', () => {
			context.duration = undefined;
			const actual = measure.call(context);

			expect(context.value).toBe(2.5);
			expect(actual).toBe(2.5);
		});

		it('should measure the meter without a from value', () => {
			Object.assign(context, {
				value: 0.5,
				fromValue: undefined
			});

			const actual = measure.call(context);

			expect(context.value).toBe(0.5);
			expect(actual).toBe(0.5);
		});

		it('should measure the meter without a to value', () => {
			Object.assign(context, {
				value: 0.5,
				toValue: undefined
			});

			const actual = measure.call(context);

			expect(context.value).toBe(0.5);
			expect(actual).toBe(0.5);
		});
	});

	describe('resolve', () => {
		const resolve = Meter.prototype.resolve;
		const update = jest.fn();
		const first = jest.fn();
		const second = jest.fn();
		const third = jest.fn();
		let context;

		beforeEach(() => {
			update.mockClear();
			first.mockClear();
			second.mockClear();
			third.mockClear();

			context = {
				update,
				index: 1,
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
				fromValue: 0.5,
				toValue: 1.5,
				iterator: 1,
				duration: 2000,
				remainingChange: 'remainingChange',
				remainingDuration: 'remainingDuration'
			};
		});

		it('should resolve in the middle of a segment', () => {
			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 1.5,
				index: 1
			});
		});

		it('should resolve at the end of a segment', () => {
			context.toValue = 2;
			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(1);
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 2,
				index: 2
			});
		});

		it('should resolve at the end of the last segment', () => {
			Object.assign(context, {
				index: 2,
				fromValue: 2.5,
				toValue: 3
			});

			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).toHaveBeenCalledWith(1);

			expect(context).toMatchObject({
				value: 3,
				index: 2
			});
		});

		it('should resolve at the end from the end of a segment', () => {
			Object.assign(context, {
				index: 1,
				fromValue: 2,
				toValue: 2
			});

			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 2,
				index: 2
			});
		});

		it('should resolve in the middle from the end of a segment', () => {
			Object.assign(context, {
				index: 1,
				fromValue: 2,
				toValue: 1,
				iterator: -1
			});

			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 1,
				index: 1
			});
		});

		it('should resolve at the beginning of a segment', () => {
			Object.assign(context, {
				toValue: 0,
				iterator: -1
			});

			resolve.call(context);

			expect(first).toHaveBeenCalledWith(-1);
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 0,
				index: 0
			});
		});

		it('should resolve at the beginning of the first segment', () => {
			const zero = jest.fn();

			Object.assign(context.segments[0], {
				lowerCallback: zero,
				upperValue: 1
			});

			Object.assign(context, {
				index: 0,
				toValue: 0,
				iterator: -1
			});

			resolve.call(context);

			expect(zero).toHaveBeenCalledWith(-1);
			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 0,
				index: 0
			});
		});

		it('should resolve at the beginning from the beginning of a segment', () => {
			Object.assign(context, {
				index: 2,
				fromValue: 2,
				toValue: 2,
				iterator: -1
			});

			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 2,
				index: 1
			});
		});

		it('should resolve in the middle from the beginning of a segment', () => {
			Object.assign(context, {
				index: 2,
				fromValue: 2,
				toValue: 2.5
			});

			resolve.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 2.5,
				index: 2
			});
		});
	});

	describe('update', () => {
		const update = Meter.prototype.update;
		const measure = jest.fn();
		const resolve = jest.fn();
		const clearTimeout = jest.fn();
		const setTimeout = jest.fn();
		const now = jest.fn();
		const first = jest.fn();
		const second = jest.fn();
		const third = jest.fn();
		let context;

		beforeEach(() => {
			window.clearTimeout = clearTimeout.mockClear();
			window.setTimeout = setTimeout.mockClear().mockReturnValue('timeout');
			window.Date.now = now.mockClear().mockReturnValue(1000);

			measure.mockClear();
			resolve.mockClear();
			first.mockClear();
			second.mockClear();
			third.mockClear();

			context = {
				measure,
				resolve,
				value: 0.5,
				index: 0,
				segments: [
					{
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
				timeout: 'timeout'
			};
		});

		it('should update to an absolute value', () => {
			const actual = update.call(context, 1.25);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(measure).toHaveBeenCalled();
			expect(resolve).toHaveBeenCalled();
			expect(setTimeout).not.toHaveBeenCalled();
			expect(actual).toBe(0.5);

			expect(context).toMatchObject({
				fromValue: 0.5,
				toValue: 1.25,
				iterator: 1,
				duration: undefined,
				remainingChange: 1.25,
				remainingDuration: undefined
			});
		});

		it('should update to an absolute value from the end', () => {
			const actual = update.call(context, -1.25);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(measure).toHaveBeenCalled();
			expect(resolve).toHaveBeenCalled();
			expect(setTimeout).not.toHaveBeenCalled();
			expect(actual).toBe(0.5);

			expect(context).toMatchObject({
				fromValue: 0.5,
				toValue: 1.75,
				iterator: 1,
				duration: undefined,
				remainingChange: 1.75,
				remainingDuration: undefined
			});
		});

		it('should update to the beginning if positive zero is used', () => {
			const actual = update.call(context, 0);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(measure).toHaveBeenCalled();
			expect(resolve).toHaveBeenCalled();
			expect(setTimeout).not.toHaveBeenCalled();
			expect(actual).toBe(0.5);

			expect(context).toMatchObject({
				fromValue: 0.5,
				toValue: 0,
				iterator: -1,
				duration: undefined,
				remainingChange: 0,
				remainingDuration: undefined
			});
		});

		it('should update to the end if negative zero is used', () => {
			Object.assign(context, {
				value: 2.5,
				index: 1
			});

			const actual = update.call(context, -0);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(measure).toHaveBeenCalled();
			expect(resolve).toHaveBeenCalled();
			expect(setTimeout).not.toHaveBeenCalled();
			expect(actual).toBe(2.5);

			expect(context).toMatchObject({
				fromValue: 2.5,
				toValue: 3,
				iterator: 1,
				duration: undefined,
				remainingChange: 3,
				remainingDuration: undefined
			});
		});

		it('should raise the value over time', () => {
			const actual = update.call(context, 1, 2000);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(measure).toHaveBeenCalled();
			expect(resolve).not.toHaveBeenCalled();
			expect(setTimeout).toHaveBeenCalledWith(resolve, 2000);
			expect(actual).toBe(0.5);

			expect(context).toMatchObject({
				fromValue: 0.5,
				toValue: 1.5,
				iterator: 1,
				duration: 2000,
				remainingChange: 0,
				remainingDuration: 0,
				timestamp: 1000,
				timeout: 'timeout'
			});
		});

		it('should lower the value over time', () => {
			Object.assign(context, {
				value: 2.75,
				index: 1
			});

			const actual = update.call(context, -0.5, 2000);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(measure).toHaveBeenCalled();
			expect(resolve).not.toHaveBeenCalled();
			expect(setTimeout).toHaveBeenCalledWith(resolve, 2000);
			expect(actual).toBe(2.75);

			expect(context).toMatchObject({
				fromValue: 2.75,
				toValue: 2.25,
				iterator: -1,
				duration: 2000,
				remainingChange: 0,
				remainingDuration: 0,
				timestamp: 1000,
				timeout: 'timeout'
			});
		});

		it('should update the value beyound the end over time', () => {
			const actual = update.call(context, 2, 2000);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(measure).toHaveBeenCalled();
			expect(resolve).not.toHaveBeenCalled();
			expect(setTimeout).toHaveBeenCalledWith(resolve, 1500);
			expect(actual).toBe(0.5);

			expect(context).toMatchObject({
				fromValue: 0.5,
				toValue: 2,
				iterator: 1,
				duration: 1500,
				remainingChange: 0.5,
				remainingDuration: 500,
				timestamp: 1000,
				timeout: 'timeout'
			});
		});

		it('should update the value beyound the beginning over time', () => {
			const actual = update.call(context, -2, 2000);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(measure).toHaveBeenCalled();
			expect(resolve).not.toHaveBeenCalled();
			expect(setTimeout).toHaveBeenCalledWith(resolve, 500);
			expect(actual).toBe(0.5);

			expect(context).toMatchObject({
				fromValue: 0.5,
				toValue: 0,
				iterator: -1,
				duration: 500,
				remainingChange: -1.5,
				remainingDuration: 1500,
				timestamp: 1000,
				timeout: 'timeout'
			});
		});
	});
});