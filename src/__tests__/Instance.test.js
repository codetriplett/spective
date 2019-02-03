import { mergeValues } from '../merge-values';
import { buildMatrices } from '../build-matrices';
import { multiplyMatrices } from '../multiply-matrices';
import { Instance } from '../Instance';

jest.mock('../merge-values', () => ({ mergeValues: jest.fn() }));
jest.mock('../build-matrices', () => ({ buildMatrices: jest.fn() }));
jest.mock('../multiply-matrices', () => ({ multiplyMatrices: jest.fn() }));

describe('Instance', () => {
	describe('constructor', () => {
		let animate;

		beforeEach(() => {
			Instance.prototype.animate = jest.fn();
			animate = Instance.prototype.animate;
		});

		it('should create an instance without an anchor', () => {
			const actual = new Instance('properties', 'duration', 'easing');

			expect(animate).toHaveBeenCalled();

			expect(actual).toEqual({
				properties: {
					scale: [1, 1, 1],
					offset: [0, 0, 0],
					rotation: 0,
					tilt: 0,
					spin: 0,
					position: [0, 0, 0]
				}
			});
		});

		it('should create an instance with an anchor', () => {
			const anchor = new Instance('properties', 'duration', 'easing');
			const actual = new Instance(anchor, 'properties', 'duration', 'easing');

			expect(animate).toHaveBeenCalled();

			expect(actual).toEqual({
				anchor,
				properties: {
					scale: [1, 1, 1],
					offset: [0, 0, 0],
					rotation: 0,
					tilt: 0,
					spin: 0,
					position: [0, 0, 0]
				}
			});
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
				properties: 'properties',
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
		const update = jest.fn();
		let context;
		let properties;
		let duration;

		beforeEach(() => {
			mergeValues.mockClear().mockReturnValue('values');
			update.mockClear();
	
			window.Date.now = jest.fn().mockReturnValue(1000);
			properties = jest.fn().mockImplementation(progress => ({ property: `update${progress}` }));
			duration = jest.fn().mockImplementation(iteration => (iteration + 1) * 100);
			context = { update, properties: 'properties' };
		});
	
		it('should set properties', () => {
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
