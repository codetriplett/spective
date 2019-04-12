import { Button } from '../Button';

describe('./Button', () => {
	describe('constructor', () => {
		const addEventListener = jest.fn();
		const resolve = jest.fn();
		const action = jest.fn();
		let listeners;

		beforeEach(() => {
			listeners = {};

			window.addEventListener = addEventListener.mockClear().mockImplementation((type, callback) => {
				listeners[type] = callback;
			});

			Button.prototype.resolve = resolve.mockClear();

			action.mockClear().mockReturnValue('action');
		});

		it('should initialize', () => {
			const actual = new Button('key', action, action);
			
			expect(actual).toEqual({
				resolve: expect.any(Function),
				actions: [expect.any(Function), expect.any(Function)],
				index: 0,
				stage: 0
			});
		});

		it('should listen for keydown event', () => {
			new Button('key', action);
			listeners['keydown']({ key: 'key' });
			
			expect(resolve).toHaveBeenCalledWith(true);
		});

		it('should listen for keyup event', () => {
			new Button('key', action);
			listeners['keyup']({ key: 'key' });
			
			expect(resolve).toHaveBeenCalledWith(false);
		});

		it('should map space key', () => {
			new Button('space', action);
			listeners['keydown']({ key: ' ' });
			
			expect(resolve).toHaveBeenCalledWith(true);
		});

		it('should map delete key', () => {
			new Button('delete', action);
			listeners['keydown']({ key: 'Delete' });
			
			expect(resolve).toHaveBeenCalledWith(true);
		});
	});

	describe('resolve', () => {
		const resolve = Button.prototype.resolve;
		const clearTimeout = jest.fn();
		const setTimeout = jest.fn();
		const first = jest.fn();
		const second = jest.fn();
		let context;

		beforeEach(() => {
			window.clearTimeout = clearTimeout.mockClear();
			window.setTimeout = setTimeout.mockClear().mockReturnValue('delay');
			first.mockClear().mockReturnValue(200);
			second.mockClear().mockReturnValue();

			context = {
				resolve: 'resolve',
				actions: [first, second],
				index: 0,
				stage: 0,
				timeout: 'timeout'
			};
		});

		it('should resolve a down event', () => {
			resolve.call(context, true);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(first).toHaveBeenCalledWith(1, 0);
			expect(second).not.toHaveBeenCalled();
			expect(setTimeout).toHaveBeenCalledWith('resolve', 200);

			expect(context).toMatchObject({
				index: 1,
				stage: 1,
				timeout: 'delay'
			});
		});

		it('should resolve an up event', () => {
			resolve.call(context, false);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(first).toHaveBeenCalledWith(-1, 0);
			expect(second).not.toHaveBeenCalled();
			expect(setTimeout).toHaveBeenCalledWith('resolve', 200);

			expect(context).toMatchObject({
				index: 1,
				stage: -1,
				timeout: 'delay'
			});
		});

		it('should interrupt a delay', () => {
			Object.assign(context, {
				index: 1,
				stage: 1
			});

			resolve.call(context, false);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(first).toHaveBeenCalledWith(-2, 0);
			expect(second).not.toHaveBeenCalled();
			expect(setTimeout).toHaveBeenCalledWith('resolve', 200);

			expect(context).toMatchObject({
				index: 1,
				stage: -2,
				timeout: 'delay'
			});
		});

		it('should resolve a delay', () => {
			Object.assign(context, {
				index: 1,
				stage: 1
			});

			resolve.call(context);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(1, 0);
			expect(setTimeout).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				index: 0,
				stage: 0,
				timeout: 'timeout'
			});
		});

		it('should resolve a delay that initiates another', () => {
			Object.assign(context, {
				index: 1,
				stage: 1
			});

			second.mockReturnValue(300);
			resolve.call(context);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(1, 0);
			expect(setTimeout).toHaveBeenCalledWith('resolve', 300);

			expect(context).toMatchObject({
				index: 2,
				stage: 1,
				timeout: 'delay'
			});
		});

		it('should resolve a delay on the previous function', () => {
			Object.assign(context, {
				index: 2,
				stage: 1
			});

			resolve.call(context);

			expect(clearTimeout).toHaveBeenCalledWith('timeout');
			expect(first).not.toHaveBeenCalled();
			expect(second).toHaveBeenCalledWith(1, 1);
			expect(setTimeout).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				index: 0,
				stage: 0
			});
		});

		it('should not resolve a duplicate down event', () => {
			Object.assign(context, {
				index: 1,
				stage: 1
			});

			resolve.call(context, true);

			expect(clearTimeout).not.toHaveBeenCalled();
			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(setTimeout).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				index: 1,
				stage: 1
			});
		});

		it('should not resolve a duplicate up event', () => {
			Object.assign(context, {
				index: 1,
				stage: -1
			});

			resolve.call(context, false);

			expect(clearTimeout).not.toHaveBeenCalled();
			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
			expect(setTimeout).not.toHaveBeenCalled();

			expect(context).toMatchObject({
				index: 1,
				stage: -1
			});
		});
	});
});
