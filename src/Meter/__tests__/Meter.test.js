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

	describe('update', () => {
		const update = Meter.prototype.update;
		const measure = jest.fn();
		const mockUpdate = jest.fn();
		const clearTimeout = jest.fn();
		const setTimeout = jest.fn();
		const now = jest.fn();
		const first = jest.fn();
		const second = jest.fn();
		const third = jest.fn();
		let context;
		let timeoutCallback;

		beforeEach(() => {
			window.setTimeout = setTimeout.mockClear().mockImplementation(callback => {
				timeoutCallback = callback;
				return 'timeout';
			});

			window.clearTimeout = clearTimeout.mockClear();
			window.Date.now = now.mockClear().mockReturnValue(1000);
			first.mockClear();
			second.mockClear();
			third.mockClear();

			context = {
				measure: measure.mockClear(),
				update: mockUpdate.mockClear(),
				value: 0.5,
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
				timeout: 'timeout'
			};
		});

		it('should update within a segment', () => {
			const actual = update.call(context, 0.25, 2000);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(measure).toHaveBeenCalled();
			expect(setTimeout).toHaveBeenCalledWith(timeoutCallback, 2000);

			expect(context).toMatchObject({
				fromValue: 0.5,
				toValue: 0.75,
				duration: 2000,
				timestamp: 1000
			});

			expect(actual).toBe(0.5);

			timeoutCallback();

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();
			expect(context.value).toBe(0.75);
		});

		it('should update to next segment', () => {
			const actual = update.call(context, 2, 2000);

			expect(setTimeout).toHaveBeenCalledWith(timeoutCallback, 1500);

			expect(context).toMatchObject({
				fromValue: 0.5,
				toValue: 2,
				duration: 1500,
				timestamp: 1000
			});

			expect(actual).toBe(0.5);

			timeoutCallback();

			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(1);
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 2,
				index: 2
			});

			expect(mockUpdate).toHaveBeenCalledWith(0.5, 500);
		});
		
		it('should update to final segment', () => {
			Object.assign(context, {
				value: 2.5,
				index: 2
			});

			update.call(context, 1, 2000);

			timeoutCallback();

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).toHaveBeenCalledWith(1);

			expect(context).toMatchObject({
				value: 3,
				index: 2,
				fromValue: undefined,
				toValue: undefined,
				duration: undefined,
				timestamp: undefined
			});

			expect(mockUpdate).not.toHaveBeenCalled();
		});
		
		it('should update to previous segment', () => {
			Object.assign(context, {
				value: 2.5,
				index: 2
			});

			const actual = update.call(context, -2, 2000);

			expect(setTimeout).toHaveBeenCalledWith(timeoutCallback, 500);

			expect(context).toMatchObject({
				fromValue: 2.5,
				toValue: 2,
				duration: 500,
				timestamp: 1000
			});

			expect(actual).toBe(2.5);

			timeoutCallback();

			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(-1);
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 2,
				index: 1
			});

			expect(mockUpdate).toHaveBeenCalledWith(-1.5, 1500);
		});
		
		it('should update to beginning', () => {
			const zero = jest.fn();
			context.index = 0;

			Object.assign(context.segments[0], {
				lowerCallback: zero,
				upperValue: 1
			});

			update.call(context, -1, 2000);

			timeoutCallback();

			expect(zero).toHaveBeenCalledWith(-1);
			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 0,
				index: 0
			});

			expect(mockUpdate).not.toHaveBeenCalled();
		});

		it('should not fire action it is resting on', () => {
			Object.assign(context, {
				value: 0,
				index: 0
			});

			update.call(context, 1, 2000);

			timeoutCallback();

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();
		});

		it('should only fire action once when it lands on a limit', () => {
			update.call(context, 1.5, 2000);
			
			timeoutCallback();

			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(1);
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 2,
				index: 2
			});

			first.mockClear();
			second.mockClear();
			third.mockClear();
			update.call(context, 0.5, 2000);

			timeoutCallback();

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			first.mockClear();
			second.mockClear();
			third.mockClear();
			update.call(context, -0.5, 2000);

			timeoutCallback();

			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(-1);
			expect(third).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				value: 2,
				index: 1
			});
			
			first.mockClear();
			second.mockClear();
			third.mockClear();
			update.call(context, -0.5, 2000);

			timeoutCallback();

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();
		});

		it('should update to an absolute value', () => {
			update.call(context, 3);
			
			expect(context).toMatchObject({
				fromValue: 0.5,
				toValue: 2,
				duration: undefined,
				timestamp: 1000
			});

			timeoutCallback();
			
			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();
			
			expect(context).toMatchObject({
				value: 2,
				index: 2
			});
		});

		it('should not update when the change is zero', () => {
			const actual = update.call(context);
			
			expect(clearTimeout).not.toHaveBeenCalled();
			expect(measure).not.toHaveBeenCalled();
			expect(setTimeout).not.toHaveBeenCalled();

			expect(context.fromValue).toBeUndefined();
			expect(context.toValue).toBeUndefined();
			expect(context.duration).toBeUndefined();
			expect(context.timestamp).toBeUndefined();

			expect(actual).toBe(0.5);
		});
	});
});
