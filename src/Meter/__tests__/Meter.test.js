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
			expect(update).toHaveBeenCalledWith(0, true);
			
			expect(actual).toEqual({
				value: 0,
				index: 0,
				segments,
				range: 1,
				update: expect.any(Function)
			});
		});

		it('should set a custom initial value', () => {
			new Meter('action', 2);

			expect(organizeSegments).toHaveBeenCalledWith('action');
			expect(update).toHaveBeenCalledWith(2, true);
		});
		
		it('should set a custom initial when there are no actions', () => {
			new Meter(2);

			expect(organizeSegments).toHaveBeenCalledWith();
			expect(update).toHaveBeenCalledWith(2, true);
		});
	});

	describe('update', () => {
		const update = Meter.prototype.update;
		const clearTimeout = jest.fn();
		const now = jest.fn();
		const first = jest.fn();
		const second = jest.fn();
		const third = jest.fn();
		let context;

		beforeEach(() => {
			window.clearTimeout = clearTimeout.mockClear();
			window.Date.now = now.mockClear().mockReturnValue(1000);
			first.mockClear();
			second.mockClear();
			third.mockClear();

			context = {
				value: 0.75,
				index: 1,
				segments: [
					{ callback: first, threshold: 0 },
					{ callback: second, threshold: 2 },
					{ callback: third, threshold: 3 }
				],
				range: 3,
				fromValue: 0.5,
				toValue: 2.5,
				duration: 200,
				timeout: 'timeout',
				timestamp: 900
			};
		});

		it('should update value instantly', () => {
			const actual = update.call(context, 2.75);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(1);
			expect(third).not.toHaveBeenCalled();

			expect(context).toEqual({
				value: 2.75,
				index: 2,
				segments: expect.any(Array),
				range: 3
			});

			expect(actual).toBe(2.75);
		});

		it('should update value instantly with a negative value', () => {
			const actual = update.call(context, -2.75);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();

			expect(context).toEqual({
				value: 0.25,
				index: 1,
				segments: expect.any(Array),
				range: 3
			});

			expect(actual).toBe(0.25);
		});

		it('should update value from schedule', () => {
			const actual = update.call(context);

			expect(clearTimeout).not.toHaveBeenCalled();
			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();
			expect(context).toMatchObject({ value: 1.5, index: 1 });
			expect(actual).toBe(1.5);
		});

		it('should resolve action and move to next segment', () => {
			context.timestamp = 800;
			const actual = update.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(1);
			expect(third).not.toHaveBeenCalled();
			expect(context).toMatchObject({ value: 2.5, index: 2 });
			expect(actual).toBe(2.5);
		});

		it('should resolve final action when meter is filled', () => {
			Object.assign(context, {
				value: 2.5,
				fromValue: 2.5,
				toValue: 3,
				timestamp: 800,
				index: 2
			});

			const actual = update.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).toHaveBeenCalledWith(1);
			expect(context).toMatchObject({ value: 3, index: 2 });
			expect(actual).toBe(3);
		});

		it('should resolve action and move to previous segment', () => {
			Object.assign(context, {
				value: 2.5,
				fromValue: 2.5,
				toValue: 0.5,
				timestamp: 800,
				index: 2
			});

			const actual = update.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(-1);
			expect(third).not.toHaveBeenCalled();
			expect(context).toMatchObject({ value: 0.5, index: 1 });
			expect(actual).toBe(0.5);
		});

		it('should resolve final action when meter is drained', () => {
			Object.assign(context, {
				toValue: 0,
				timestamp: 800
			});

			const actual = update.call(context);

			expect(first).toHaveBeenCalledWith(-1);
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();
			expect(context).toMatchObject({ value: 0, index: 0 });
			expect(actual).toBe(0);
		});

		it('should resolve action when landing on it but not when leaving it', () => {
			Object.assign(context, {
				toValue: 2,
				timestamp: 800
			});

			let actual = update.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(1);
			expect(third).not.toHaveBeenCalled();
			expect(context).toMatchObject({ value: 2, index: 2 });
			expect(actual).toBe(2);

			first.mockClear();
			second.mockClear();
			third.mockClear();

			context.toValue = 2.5;
			actual = update.call(context);

			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(third).not.toHaveBeenCalled();
			expect(context).toMatchObject({ value: 2.5, index: 2 });
			expect(actual).toBe(2.5);
		});
	});

	describe('schedule', () => {
		const schedule = Meter.prototype.schedule;
		const update = jest.fn();
		const setTimeout = jest.fn();
		const now = jest.fn();
		let context;
		let callback;

		beforeEach(() => {
			window.setTimeout = setTimeout.mockClear().mockImplementation(input => {
				callback = input;
				return 'timeout';
			});

			update.mockClear();
			window.Date.now = now.mockClear().mockReturnValue(1000);

			context = {
				update,
				range: 1,
				value: 0.5
			};
		});

		it('should schedule an update', () => {
			const actual = schedule.call(context, 0.3, 200);

			expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
			expect(update).not.toHaveBeenCalled();

			expect(context).toEqual({
				update,
				range: 1,
				value: 0.5,
				fromValue: 0.5,
				toValue: 0.8,
				duration: 200,
				timeout: 'timeout',
				timestamp: 1000
			});

			expect(actual).toBe(0.5);

			update.mockClear();
			callback();

			expect(update).toHaveBeenCalledWith(0.8);
		});

		it('should schedule an update with a custom range', () => {
			context.range = 2;
			const actual = schedule.call(context, 0.8, 200);

			expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
			expect(update).not.toHaveBeenCalled();

			expect(context).toEqual({
				update,
				range: 2,
				value: 0.5,
				fromValue: 0.5,
				toValue: 1.3,
				duration: 200,
				timeout: 'timeout',
				timestamp: 1000
			});

			expect(actual).toBe(0.5);

			update.mockClear();
			callback();

			expect(update).toHaveBeenCalledWith(1.3);
		});

		it('should schedule a filling update', () => {
			const actual = schedule.call(context, 0.8, 200);

			expect(context).toEqual({
				update,
				range: 1,
				value: 0.5,
				fromValue: 0.5,
				toValue: 1,
				duration: 125,
				timeout: 'timeout',
				timestamp: 1000
			});

			expect(actual).toBe(0.5);
		});

		it('should schedule a draining update', () => {
			const actual = schedule.call(context, -0.8, 200);

			expect(context).toEqual({
				update,
				range: 1,
				value: 0.5,
				fromValue: 0.5,
				toValue: 0,
				duration: 125,
				timeout: 'timeout',
				timestamp: 1000
			});

			expect(actual).toBe(0.5);
		});

		it('should schedule an immediate update', () => {
			const actual = schedule.call(context, 0.3);

			expect(context).toEqual({
				update,
				range: 1,
				value: 0.5,
				fromValue: 0.5,
				toValue: 0.8,
				duration: 0,
				timeout: 'timeout',
				timestamp: 1000
			});

			expect(actual).toBe(0.5);
		});
	});
});
