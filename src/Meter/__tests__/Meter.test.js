import { organizeActions } from '../organize-actions';
import { Meter } from '../Meter';

jest.mock('../organize-actions', () => ({ organizeActions: jest.fn() }));

describe('Meter', () => {
	describe('constructor', () => {
		let iterate = jest.fn();

		beforeEach(() => {
			iterate.mockClear().mockReturnValue('next');

			organizeActions.mockClear().mockReturnValue([
				'schedule',
				'previous',
				iterate
			]);
		});

		it('should initialize', () => {
			const actual = new Meter('parameters');

			expect(organizeActions).toHaveBeenCalledWith('parameters');
			expect(iterate).toHaveBeenCalledWith(0, 'previous');

			expect(actual).toEqual({
				resolve: expect.any(Function),
				schedule: 'schedule',
				iterate,
				previous: 'previous',
				next: 'next',
				value: 0,
				change: 0
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
		const complete = jest.fn();
		const update = jest.fn();
		const iterate = jest.fn();
		let context;

		beforeEach(() => {
			complete.mockClear().mockReturnValue(0.5);
			update.mockClear();
			iterate.mockClear().mockReturnValue('item');

			context = {
				complete,
				update,
				iterate,
				previous: 'previous',
				next: 'next',
				value: 1,
				duration: 200
			};
		});

		it('should resolve a filling update', () => {
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith();
			expect(iterate).toHaveBeenCalledWith(0.5, 'next', 'previous');
			expect(update).toHaveBeenCalledWith(0.5);

			expect(context).toMatchObject({
				previous: 'next',
				next: 'item',
				duration: undefined
			});
		});

		it('should resolve a draining update', () => {
			complete.mockReturnValue(-0.5);
			context.value = 0;
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith();
			expect(iterate).toHaveBeenCalledWith(-0.5, 'previous', 'next');
			expect(update).toHaveBeenCalledWith(-0.5);

			expect(context).toMatchObject({
				previous: 'item',
				next: 'previous',
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
				previous: 'previous',
				next: 'next',
			});
		});
		
		it('should resolve an update without iterating', () => {
			iterate.mockReturnValue();
			resolve.call(context);

			expect(update).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				previous: 'previous',
				next: 'next'
			});
		});

		it('should resolve an update without another update', () => {
			complete.mockReturnValue(0);
			resolve.call(context);

			expect(update).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				previous: 'next',
				next: 'item'
			});
		});

		it('should resolve a continuous update', () => {
			context.continuous = true;
			resolve.call(context);

			expect(update).toHaveBeenCalledWith(0);

			expect(context).toMatchObject({
				previous: 'next',
				next: 'item'
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
				next: 'next',
				previous: 'previous',
				timeout: 'timeout'
			};
		});

		it('should update the meter in the positive direction', () => {
			const actual = update.call(context, 1);

			expect(measure).toHaveBeenCalled();
			expect(schedule).toHaveBeenCalledWith(0.75, 'next', 'previous');
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
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous', 'next');
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
			expect(schedule).toHaveBeenCalledWith(0.75, 'next', 'previous');
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
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous', 'next');
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
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous', 'next');
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
			expect(schedule).toHaveBeenCalledWith(0.75, 'next', 'previous');
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
			expect(schedule).toHaveBeenCalledWith(0, 'next', 'previous');
			expect(clearTimeout).not.toHaveBeenCalled();
			expect(setTimeout).not.toHaveBeenCalled();
			expect(actual).toBe(0.25);

			expect(context.value).toBeUndefined();
		});

		it('should not update when there is no duration', () => {
			schedule.mockReturnValue();
			const actual = update.call(context, 1);

			expect(measure).toHaveBeenCalled();
			expect(schedule).toHaveBeenCalledWith(0.75, 'next', 'previous');
			expect(setTimeout).not.toHaveBeenCalled();
			expect(actual).toBe(0.25);

			expect(context.value).toBeUndefined();
		});
	});
});
