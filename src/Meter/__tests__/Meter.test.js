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

	describe('complete', () => {
		const complete = Meter.prototype.complete;
		const now = jest.fn();
		const clearTimeout = jest.fn();
		let context;

		beforeEach(() => {
			window.Date.now = now.mockClear().mockReturnValue(1000);
			window.clearTimeout = clearTimeout.mockClear();

			context = {
				value: 0.5,
				change: 0.4,
				duration: 400,
				timestamp: 900,
				timeout: 'timeout'
			};
		});

		it('should complete a filling update in progress', () => {
			const actual = complete.call(context);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(actual).toBe(0.30000000000000004);

			expect(context).toEqual({
				value: 0.19999999999999996,
				change: 0
			});
		});

		it('should complete a draining update', () => {
			context.change = -0.4;
			const actual = complete.call(context);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(actual).toBe(-0.30000000000000004);

			expect(context).toEqual({
				value: 0.8,
				change: -0
			});
		});

		it('should complete a filling update at end', () => {
			context.value = 1.1;
			const actual = complete.call(context, true);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(actual).toBe(0.10000000000000009);

			expect(context).toEqual({
				value: 1,
				change: 0
			});
		});
		
		it('should complete a draining update at begining', () => {
			Object.assign(context, {
				value: -0.1,
				change: -0.4
			});

			const actual = complete.call(context, true);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(actual).toBe(-0.1);

			expect(context).toEqual({
				value: 0,
				change: -0
			});
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
				value: 1
			};
		});

		it('should resolve a filling update', () => {
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith(true);
			expect(iterate).toHaveBeenCalledWith(0.5, 'next');
			expect(update).toHaveBeenCalledWith(0.5);

			expect(context).toMatchObject({
				previous: 'next',
				next: 'item'
			});
		});

		it('should resolve a draining update', () => {
			complete.mockReturnValue(-0.5);
			context.value = 0;
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith(true);
			expect(iterate).toHaveBeenCalledWith(-0.5, 'previous');
			expect(update).toHaveBeenCalledWith(-0.5);

			expect(context).toMatchObject({
				previous: 'item',
				next: 'previous'
			});
		});

		it('should resolve an update without calling the iterator', () => {
			complete.mockReturnValue(0);
			context.value = 0.5;
			resolve.call(context);

			expect(complete).toHaveBeenCalledWith(true);
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

			expect(update).toHaveBeenCalledWith(0, true);

			expect(context).toMatchObject({
				previous: 'next',
				next: 'item'
			});
		});
	});

	describe('update', () => {
		const update = Meter.prototype.update;
		const now = jest.fn();
		const setTimeout = jest.fn();
		const complete = jest.fn();
		const resolve = jest.fn();
		const schedule = jest.fn();
		let context;

		beforeEach(() => {
			window.Date.now = now.mockClear().mockReturnValue(1000);
			window.setTimeout = setTimeout.mockClear().mockReturnValue('timeout');
			complete.mockClear().mockReturnValue(0.5);
			resolve.mockClear();
			schedule.mockClear().mockReturnValue('duration');

			context = {
				complete,
				resolve,
				schedule,
				value: 0.25,
				next: 'next',
				previous: 'previous'
			};
		});

		it('should update the meter in the positive direction', () => {
			const actual = update.call(context, 1);

			expect(complete).toHaveBeenCalledWith();
			expect(schedule).toHaveBeenCalledWith(0.75, 'next');
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

			expect(complete).toHaveBeenCalledWith();
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous');
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

			expect(complete).toHaveBeenCalledWith();
			expect(schedule).toHaveBeenCalledWith(0.75, 'next');
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
			complete.mockReturnValue(-0);
			const actual = update.call(context, 0);

			expect(complete).toHaveBeenCalledWith();
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous');
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

			expect(complete).toHaveBeenCalledWith();
			expect(schedule).toHaveBeenCalledWith(-0.25, 'previous');
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
			complete.mockReturnValue(-0);
			const actual = update.call(context, -0);

			expect(complete).toHaveBeenCalledWith();
			expect(schedule).toHaveBeenCalledWith(0.75, 'next');
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

		it('should continuously update across iterations', () => {
			const actual = update.call(context, 0.5, true);

			expect(complete).toHaveBeenCalledWith();
			expect(schedule).toHaveBeenCalledWith(0.5, 'next');
			expect(setTimeout).toHaveBeenCalledWith(resolve, 'duration');
			expect(actual).toBe(0.75);

			expect(context).toMatchObject({
				value: 0.75,
				change: 0.5,
				duration: 'duration',
				timestamp: 1000,
				timeout: 'timeout',
				continuous: true
			});
		});

		it('should not update when there is no change', () => {
			const actual = update.call(context);

			expect(complete).toHaveBeenCalledWith();
			expect(schedule).toHaveBeenCalledWith(0, 'next');
			expect(setTimeout).not.toHaveBeenCalled();
			expect(actual).toBe(0.25);

			expect(context).toMatchObject({
				value: 0.25,
				next: 'next',
				previous: 'previous'
			});
		});

		it('should not update when there is no duration', () => {
			schedule.mockReturnValue();
			const actual = update.call(context, 1);

			expect(complete).toHaveBeenCalledWith();
			expect(schedule).toHaveBeenCalledWith(0.75, 'next');
			expect(setTimeout).not.toHaveBeenCalled();
			expect(actual).toBe(0.25);

			expect(context).toMatchObject({
				value: 0.25,
				next: 'next',
				previous: 'previous'
			});
		});
	});
});
