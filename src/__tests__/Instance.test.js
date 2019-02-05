import { formatProperties } from '../format-properties';
import { buildMatrices } from '../build-matrices';
import { multiplyMatrices } from '../multiply-matrices';
import { Instance } from '../Instance';

jest.mock('../format-properties', () => ({ formatProperties: jest.fn() }));
jest.mock('../build-matrices', () => ({ buildMatrices: jest.fn() }));
jest.mock('../multiply-matrices', () => ({ multiplyMatrices: jest.fn() }));

describe('Instance', () => {
	describe.only('constructor', () => {
		const animate = jest.fn();

		beforeEach(() => {
			formatProperties.mockClear().mockReturnValue('properties');
			Instance.prototype.animate = animate.mockClear();
		});

		it('should create an instance without an anchor', () => {
			const actual = new Instance(false, 'properties', 'duration');

			expect(animate).toHaveBeenCalledWith('properties', 'duration');
			expect(actual).toEqual({ properties: 'properties' });
		});

		it('should create an instance with an anchor', () => {
			const anchor = new Instance(false, 'properties', 'duration');

			formatProperties.mockClear();
			animate.mockClear();

			const actual = new Instance(anchor, 'properties', 'duration');

			expect(animate).toHaveBeenCalled();

			expect(anchor).toEqual({
				children: [actual],
				properties: 'properties'
			});

			expect(actual).toEqual({
				anchor,
				properties: 'properties'
			});
		});

		it('should create an invereted instance', () => {
			const actual = new Instance(true, 'properties', 'duration');

			expect(animate).toHaveBeenCalledWith('properties', 'duration');

			expect(actual).toEqual({
				inverted: true,
				properties: 'properties'
			});
		});
	});

	describe('shift', () => {
		const shift = Instance.prototype.shift;
		let context;
	
		beforeEach(() => {
			formatProperties.mockClear().mockImplementation(input => input);

			context = {
				properties: {
					first: 1,
					second: 2
				},
				originalProperties: {
					first: 3,
					second: 4
				}
			};
		});

		it('should fully shift if no progress is provided', () => {
			shift.call(context, { first: 5, second: 6 });
			expect(context.properties).toEqual({ first: 8, second: 10 });
		});

		it('should not shift properties if progress is 0', () => {
			shift.call(context, { first: 5, second: 6 }, 0);
			expect(context.properties).toEqual({ first: 3, second: 4 });
		});

		it('should partially shift properties if progress is between 0 and 1', () => {
			shift.call(context, { first: 5, second: 6 }, 0.5);
			expect(context.properties).toEqual({ first: 5.5, second: 7 });
		});

		it('should fully shift properties if progress is 1', () => {
			shift.call(context, { first: 5, second: 6 }, 1);
			expect(context.properties).toEqual({ first: 8, second: 10 });
		});
	});

	describe('prepare', () => {
		const prepare = Instance.prototype.prepare;
		const shift = jest.fn();
		let context;
	
		beforeEach(() => {
			formatProperties.mockClear().mockImplementation(input => input);
			shift.mockClear();

			context = {
				shift,
				properties: {
					first: 1,
					second: 2
				}
			};
		});

		it('should store the current properties', () => {
			prepare.call(context);

			expect(context).toEqual({
				shift: expect.any(Function),
				properties: {
					first: 1,
					second: 2
				},
				originalProperties: {
					first: 1,
					second: 2
				}
			});
		});

		it('should prepare using an input function', () => {
			const change = jest.fn().mockReturnValue('properties');
			const actual = prepare.call(context, change);

			expect(actual).toEqual(expect.any(Function));
			expect(change).not.toHaveBeenCalled();
			expect(formatProperties).not.toHaveBeenCalled();
			expect(shift).not.toHaveBeenCalled();

			actual(0.5);

			expect(change).toHaveBeenCalledWith(0.5);
			expect(formatProperties).toHaveBeenCalledWith('properties');
			expect(shift).toHaveBeenCalledWith('properties');
		});

		it('should prepare using an input object', () => {
			const change = { key: 'value' };
			const actual = prepare.call(context, change);

			expect(actual).toEqual(expect.any(Function));
			expect(formatProperties).toHaveBeenCalledWith(change);
			expect(shift).not.toHaveBeenCalled();

			actual(0.5);

			expect(shift).toHaveBeenCalledWith({ key: 'value' }, 0.5);
		});
	});

	describe('update', () => {
		const update = Instance.prototype.update;
		let context;
	
		beforeEach(() => {
			context = {
				anchor: {
					relativeMatrix: 'anchorMatrix',
					relativeInverse: 'anchorInverse'
				},
				properties: 'existing',
				relativeMatrix: 'relativeMatrix',
				relativeInverse: 'relativeInverse',
				absoluteMatrix: 'absoluteMatrix',
				absoluteInverse: 'absoluteInverse'
			};
			
			buildMatrices.mockClear().mockImplementation((a, invert) => [invert ? 'inverses' : 'matrices']);
			multiplyMatrices.mockClear().mockImplementation(matrices => matrices.join());
		});

		it('should update with properties', () => {
			update.call(context, 'properties');

			expect(buildMatrices.mock.calls).toEqual([
				['properties', undefined],
				['properties', true, undefined]
			]);

			expect(multiplyMatrices.mock.calls).toEqual([
				[['matrices']],
				[['inverses']]
			]);

			expect(context).toEqual({
				anchor: expect.anything(),
				properties: 'existing',
				relativeMatrix: 'matrices',
				relativeInverse: 'inverses',
				absoluteMatrix: 'absoluteMatrix',
				absoluteInverse: 'absoluteInverse'
			});
		});
		
		it('should update without properties', () => {
			update.call(context);

			expect(buildMatrices).not.toHaveBeenCalled();

			expect(multiplyMatrices.mock.calls).toEqual([
				[['relativeMatrix', 'anchorMatrix']],
				[['relativeInverse', 'anchorInverse']]
			]);

			expect(context).toEqual({
				anchor: expect.anything(),
				properties: 'existing',
				relativeMatrix: 'relativeMatrix',
				relativeInverse: 'relativeInverse',
				absoluteMatrix: 'relativeMatrix,anchorMatrix',
				absoluteInverse: 'relativeInverse,anchorInverse'
			});
		});
	});

	describe('animate', () => {
		const animate = Instance.prototype.animate;
		const prepare = jest.fn();
		const update = jest.fn();
		let context;
		let properties;
		let duration;

		beforeEach(() => {
			Instance.prototype.prepare = prepare.mockClear();
			mergeValues.mockClear().mockReturnValue('values');
			update.mockClear();
	
			window.Date.now = jest.fn().mockReturnValue(1000);
			properties = jest.fn().mockImplementation(progress => ({ property: `update${progress}` }));
			duration = jest.fn().mockImplementation(iteration => (iteration + 1) * 100);
			context = { update, properties: 'properties' };
		});
	
		it.only('should set properties', () => {
			animate.call(context, { property: 'update' });
	
			expect(mergeValues.mock.calls).toEqual([
				['properties', { property: 'update' }]
			]);

			expect(update.mock.calls).toEqual([
				['values']
			]);
	
			expect(context).toEqual({
				update: expect.anything(),
				properties: 'properties'
			});
		});

		it('should update children', () => {
			const childUpdate = jest.fn();
			context.children = [{ update: childUpdate }];
			animate.call(context, { property: 'update' });

			expect(childUpdate.mock.calls).toEqual([
				[]
			]);
	
			expect(context).toEqual({
				update: expect.anything(),
				properties: 'properties',
				children: [{ update: expect.anything() }]
			});
		});
	
		it('should animate position', () => {
			animate.call(context, properties, 200);
			context.step(1120);
	
			expect(mergeValues.mock.calls).toEqual([
				['properties', { property: 'update0.6' }]
			]);
	
			expect(update.mock.calls).toEqual([
				['values']
			]);
	
			expect(context).toEqual({
				update: expect.anything(),
				properties: 'properties',
				step: expect.any(Function)
			});
	
			update.mockClear();
			context.step(1240);
	
			expect(update.mock.calls).toEqual([
				['values']
			]);
	
			expect(context).toEqual({
				update: expect.anything(),
				properties: 'properties'
			});
		});
		
		it('should loop animation', () => {
			animate.call(context, properties, duration);
			context.step(1001);
			context.step(1002);
			context.step(1360);
	
			expect(mergeValues.mock.calls).toEqual([
				['properties', { property: 'update0.01' }],
				['properties', { property: 'update0.02' }],
				['properties', { property: 'update0.2' }]
			]);
	
			expect(duration.mock.calls).toEqual([
				[0],
				[1],
				[2]
			]);
	
			expect(update.mock.calls).toEqual([
				['values'],
				['values'],
				['values']
			]);
	
			expect(context).toEqual({
				update: expect.anything(),
				properties: 'properties',
				step: expect.any(Function)
			});
		});
	});
});
