import { buildMatrices } from '../build-matrices';
import { multiplyMatrices } from '../multiply-matrices';
import { Instance } from '../Instance';

jest.mock('../build-matrices', () => ({ buildMatrices: jest.fn() }));
jest.mock('../multiply-matrices', () => ({ multiplyMatrices: jest.fn() }));

describe('Instance', () => {
	describe('constructor', () => {
		const animate = jest.fn();

		beforeEach(() => {
			Instance.prototype.animate = animate.mockClear();
		});

		it('should create an instance without an anchor', () => {
			const actual = new Instance(false, 'properties', 'duration');

			expect(actual).toEqual({
				properties: { scaleX: 1, scaleY: 1, scaleZ: 1 },
				animations: [],
				queue: []
			});
		});

		it('should create an instance with an anchor', () => {
			const anchor = new Instance(false, 'properties', 'duration');
			const actual = new Instance(anchor, 'properties', 'duration');

			expect(anchor).toEqual({
				children: [actual],
				properties: { scaleX: 1, scaleY: 1, scaleZ: 1 },
				animations: [],
				queue: []
			});

			expect(actual).toEqual({
				anchor,
				properties: { scaleX: 1, scaleY: 1, scaleZ: 1 },
				animations: [],
				queue: []
			});
		});

		it('should create an invereted instance', () => {
			const actual = new Instance(true, 'properties', 'duration');

			expect(actual).toEqual({
				inverted: true,
				properties: { scaleX: 1, scaleY: 1, scaleZ: 1 },
				animations: [],
				queue: []
			});
		});
	});

	describe('calculate', () => {
		const calculate = Instance.prototype.calculate;
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

		it('should calculate with properties', () => {
			calculate.call(context, 'properties');

			expect(buildMatrices.mock.calls).toEqual([
				['properties', undefined],
				['properties', true, true]
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
		
		it('should calculate without properties', () => {
			calculate.call(context);

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
			calculate.call(context);

			expect(buildMatrices).not.toHaveBeenCalled();

			expect(multiplyMatrices.mock.calls).toEqual([
				[['anchorMatrix', 'relativeMatrix']],
				[['anchorInverse', 'relativeInverse']]
			])

			expect(context).toEqual({
				anchor,
				properties: 'existing',
				relativeMatrix: 'relativeMatrix',
				relativeInverse: 'relativeInverse',
				absoluteMatrix: 'anchorMatrix,relativeMatrix',
				absoluteInverse: 'anchorInverse,relativeInverse'
			});
		});

		it('should run calculate on children', () => {
			const childCalculate = jest.fn();

			context.children = [
				{ calculate: childCalculate },
				{ calculate: childCalculate }
			];

			calculate.call(context, 'properties');

			expect(childCalculate).toHaveBeenCalledTimes(2);
		});
	});
});
