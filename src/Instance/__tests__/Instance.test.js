import { formatProperties } from '../format-properties';
import { buildMatrices } from '../build-matrices';
import { multiplyMatrices } from '../multiply-matrices';
import { Instance } from '../Instance';

jest.mock('../format-properties', () => ({ formatProperties: jest.fn() }));
jest.mock('../build-matrices', () => ({ buildMatrices: jest.fn() }));
jest.mock('../multiply-matrices', () => ({ multiplyMatrices: jest.fn() }));

describe('Instance', () => {
	describe('constructor', () => {
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

	describe('prepare', () => {
		const prepare = Instance.prototype.prepare;
		let context;
	
		beforeEach(() => {
			formatProperties.mockClear().mockImplementation(input => input);

			context = {
				properties: {
					first: 1,
					second: 2
				}
			};
		});

		it('should prepare an instant update', () => {
			const [interpolate, iterate] = prepare.call(context, { first: 3, second: 4 });
			
			expect(formatProperties).not.toHaveBeenCalled();

			let actual = iterate();

			expect(formatProperties).toHaveBeenCalledWith({ first: 3, second: 4 });
			expect(actual).toBeUndefined();

			expect(context).toEqual({
				properties: { first: 4, second: 6 }
			});

			interpolate(0.5);

			expect(context).toEqual({
				properties: { first: 4, second: 6 }
			});
		});

		it('should prepare a single run animation', () => {
			const [interpolate, iterate] = prepare.call(context, { first: 3, second: 4 }, 200);
			
			expect(formatProperties).not.toHaveBeenCalled();

			let actual = iterate();

			expect(formatProperties).toHaveBeenCalledWith({ first: 3, second: 4 });
			expect(actual).toBe(200);

			expect(context).toEqual({
				properties: { first: 1, second: 2 }
			});

			interpolate(0);

			expect(context).toEqual({
				properties: { first: 1, second: 2 }
			});

			interpolate(0.5);

			expect(context).toEqual({
				properties: { first: 2.5, second: 4 }
			});

			interpolate(1);

			expect(context).toEqual({
				properties: { first: 4, second: 6 }
			});

			actual = iterate();

			expect(actual).toBeUndefined();

			expect(context).toEqual({
				properties: { first: 4, second: 6 }
			});

			interpolate(0.5)

			expect(context).toEqual({
				properties: { first: 4, second: 6 }
			});
		});

		it('should prepare a continuous run animation', () => {
			const duration = jest.fn().mockImplementation(iteration => 2 - iteration);
			const [interpolate, iterate] = prepare.call(context, { first: 3, second: 4 }, duration);
			
			expect(formatProperties).not.toHaveBeenCalled();

			let actual = iterate();

			expect(duration).toHaveBeenCalledWith(0);
			expect(actual).toBe(2);

			expect(context).toEqual({
				properties: { first: 1, second: 2 }
			});

			interpolate(0.5);

			expect(context).toEqual({
				properties: { first: 2.5, second: 4 }
			});

			duration.mockClear();
			actual = iterate();

			expect(duration).toHaveBeenCalledWith(1);
			expect(actual).toBe(1);

			expect(context).toEqual({
				properties: { first: 4, second: 6 }
			});

			interpolate(0.5);

			expect(context).toEqual({
				properties: { first: 5.5, second: 8 }
			});

			duration.mockClear();
			actual = iterate();

			expect(duration).toHaveBeenCalledWith(2);
			expect(actual).toBeUndefined();

			expect(context).toEqual({
				properties: { first: 7, second: 10 }
			});

			interpolate(0.5);

			expect(context).toEqual({
				properties: { first: 7, second: 10 }
			});
		});

		it('should support multiple animations', () => {
			const [interpolate, iterate] = prepare.call(context, {
				first: 3, second: 4
			}, {
				first: 5, second: 6
			}, 200);
			
			expect(formatProperties).not.toHaveBeenCalled();

			let actual = iterate();

			expect(formatProperties.mock.calls).toEqual([
				[{ first: 3, second: 4 }],
				[{ first: 5, second: 6 }]
			]);

			expect(actual).toBe(200);

			expect(context).toEqual({
				properties: { first: 4, second: 6 }
			});

			interpolate(0.5);

			expect(context).toEqual({
				properties: { first: 6.5, second: 9 }
			});

			actual = iterate();

			expect(actual).toBeUndefined();

			expect(context).toEqual({
				properties: { first: 9, second: 12 }
			});
		});
	});

	describe('update', () => {
		const update = Instance.prototype.update;
		let context;
	
		beforeEach(() => {
			context = {
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
			expect(multiplyMatrices).not.toHaveBeenCalled();

			expect(context).toEqual({
				properties: 'existing',
				relativeMatrix: 'relativeMatrix',
				relativeInverse: 'relativeInverse',
				absoluteMatrix: 'absoluteMatrix',
				absoluteInverse: 'absoluteInverse'
			});
		});
		
		it('should update with anchor', () => {
			const anchor = {
				relativeMatrix: 'anchorMatrix',
				relativeInverse: 'anchorInverse'
			};

			context.anchor = anchor;
			update.call(context);

			expect(buildMatrices).not.toHaveBeenCalled();

			expect(multiplyMatrices.mock.calls).toEqual([
				[["relativeMatrix", "absoluteMatrix"]],
				[["relativeInverse", "absoluteInverse"]]
			])

			expect(context).toEqual({
				anchor,
				properties: 'existing',
				relativeMatrix: 'relativeMatrix',
				relativeInverse: 'relativeInverse',
				absoluteMatrix: 'relativeMatrix,absoluteMatrix',
				absoluteInverse: 'relativeInverse,absoluteInverse'
			});
		});
	});

	describe('animate', () => {
		const animate = Instance.prototype.animate;
		const interpolate = jest.fn();
		const iterate = jest.fn();
		const prepare = jest.fn();
		const update = jest.fn();
		let context;
		let properties;
		let iteration;

		beforeEach(() => {
			interpolate.mockClear().mockImplementation(progress => context.properties = progress);
			iterate.mockClear().mockImplementation(() => (iteration++ + 1) * 100);
			Instance.prototype.prepare = prepare.mockClear().mockReturnValue([interpolate, iterate]);
			update.mockClear();
	
			window.Date.now = jest.fn().mockReturnValue(1000);
			context = { prepare, update, properties: 'properties' };
			iteration = 0;
		});
	
		it('should instantly update properties', () => {
			iterate.mockReturnValue(undefined);
			animate.call(context, properties);

			expect(iterate).toHaveBeenCalledTimes(1);
			expect(interpolate).not.toHaveBeenCalled();

			expect(update.mock.calls).toEqual([
				['properties']
			]);
		});

		it('should update children', () => {
			iterate.mockReturnValue(undefined);
			const childUpdate = jest.fn();
			context.children = [{ update: childUpdate }];
			animate.call(context);

			expect(childUpdate.mock.calls).toEqual([
				[]
			]);
		});
	
		it('should animate position', () => {
			animate.call(context);
			context.step(1120);
			
			expect(iterate).toHaveBeenCalledTimes(2);
			expect(interpolate).toHaveBeenCalledWith(0.1);
	
			expect(update.mock.calls).toEqual([
				[0.1]
			]);
	
			iterate.mockClear();
			interpolate.mockClear();
			update.mockClear();
			context.step(1240);
			
			expect(iterate).toHaveBeenCalledTimes(1);
			expect(interpolate).toHaveBeenCalledWith(0.2);
	
			expect(update.mock.calls).toEqual([
				[0.2]
			]);
		});
		
		it('should loop animation', () => {
			animate.call(context);
			context.step(1001);
			context.step(1002);
			context.step(1360);
			
			expect(iterate).toHaveBeenCalledTimes(3);
			expect(interpolate.mock.calls).toEqual([
				[0.01],
				[0.02],
				[0.2]
			]);
	
			expect(update.mock.calls).toEqual([
				[0.01],
				[0.02],
				[0.2]
			]);
		});
	});
});
