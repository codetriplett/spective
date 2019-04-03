import { Button } from '../Button';

describe('./Button', () => {
	describe('constructor', () => {
		const addEventListener = jest.fn();
		const schedule = jest.fn();
		const instant = jest.fn();
		const eventual = jest.fn();
		let listeners;

		beforeEach(() => {
			listeners = {};

			window.addEventListener = addEventListener.mockClear().mockImplementation((type, callback) => {
				listeners[type] = callback;
			});

			Button.prototype.schedule = schedule.mockClear();

			instant.mockClear().mockReturnValue('instant');
			eventual.mockClear().mockReturnValue('eventual');
		});

		it('should initialize', () => {
			const actual = new Button('key', instant, eventual);
			
			expect(actual).toEqual({
				resolve: expect.any(Function),
				instant: expect.any(Function),
				eventual: expect.any(Function),
				stage: 0
			});
		});

		it('should listen for keydown event', () => {
			new Button('key', instant, eventual);
			listeners['keydown']({ key: 'key' });
			
			expect(schedule).toHaveBeenCalledWith(true);
		});

		it('should listen for keyup event', () => {
			new Button('key', instant, eventual);
			listeners['keyup']({ key: 'key' });
			
			expect(schedule).toHaveBeenCalledWith(false);
		});

		it('should map space key', () => {
			new Button('space', instant, eventual);
			listeners['keydown']({ key: ' ' });
			
			expect(schedule).toHaveBeenCalledWith(true);
		});

		it('should map delete key', () => {
			new Button('delete', instant, eventual);
			listeners['keydown']({ key: 'Delete' });
			
			expect(schedule).toHaveBeenCalledWith(true);
		});
	});

	describe('resolve', () => {
		const resolve = Button.prototype.resolve;
		const eventual = jest.fn();
		let context;

		beforeEach(() => {
			eventual.mockClear();

			context = {
				eventual,
				stage: 1
			};
		});

		it('should resolve', () => {
			resolve.call(context);

			expect(eventual).toHaveBeenCalledWith(1);
			expect(context.stage).toBe(0);
		});
	});

	describe('schedule', () => {
		const schedule = Button.prototype.schedule;
		const clearTimeout = jest.fn();
		const setTimeout = jest.fn();
		const instant = jest.fn();
		let context;

		beforeEach(() => {
			window.clearTimeout = clearTimeout.mockClear();
			window.setTimeout = setTimeout.mockClear().mockReturnValue('timeout');
			instant.mockClear().mockReturnValue(200);

			context = {
				resolve: 'resolve',
				instant,
				timeout: 'timeout',
				stage: 0
			};
		});

		it('should schedule a down event', () => {
			schedule.call(context, true);

			expect(instant).toHaveBeenCalledWith(1);
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(setTimeout).toHaveBeenCalledWith('resolve', 200);

			expect(context).toMatchObject({
				stage: 1,
				timeout: 'timeout'
			});
		});

		it('should schedule an up event', () => {
			schedule.call(context, false);

			expect(instant).toHaveBeenCalledWith(-1);
			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(setTimeout).toHaveBeenCalledWith('resolve', 200);

			expect(context).toMatchObject({
				stage: -1,
				timeout: 'timeout'
			});
		});
		
		it('should not schedule an event without a duration', () => {
			instant.mockReturnValue();
			schedule.call(context, false);

			expect(setTimeout).not.toHaveBeenCalled();
			expect(context.stage).toBe(0);
		});

		it('should schedule another down event', () => {
			context.stage = -1;
			schedule.call(context, true);

			expect(instant).toHaveBeenCalledWith(2);
		});

		it('should schedule an up event', () => {
			context.stage = 1;
			schedule.call(context, false);

			expect(instant).toHaveBeenCalledWith(-2);
		});

		it('should not schedule a duplicate down event', () => {
			context.stage = 1;
			schedule.call(context, true);

			expect(instant).not.toHaveBeenCalled();
		});

		it('should not schedule a duplicate up event', () => {
			context.stage = -1;
			schedule.call(context, false);

			expect(instant).not.toHaveBeenCalled();
		});
	});
});
