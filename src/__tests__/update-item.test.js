import { calculateMatrix } from '../calculate-matrix';
import { updateItem } from '../update-item';

jest.mock('../calculate-matrix', () => ({ calculateMatrix: jest.fn() }));

const render = jest.fn();
const positionFunction = jest.fn();
const durationFunction = jest.fn();
let item;
let context;

describe('../update-item', () => {
	beforeEach(() => {
		calculateMatrix.mockClear().mockImplementation(inverse => {
			return `mockCalculateMatrix${inverse ? 'Inverse' : ''}`
		});

		window.Date.now = jest.fn().mockReturnValue(1000);
		render.mockClear();
		positionFunction.mockClear().mockImplementation((progress, iteration) => `mockPosition${Math.round(progress * 100)}Iteration${iteration}`);
		durationFunction.mockClear().mockImplementation(iteration => (iteration + 1) * 100);
		item = {};
		context = { render };
	});

	it('should set position', () => {
		updateItem.call(context, item, 'mockPosition');

		expect(calculateMatrix.mock.calls).toEqual([
			[false, 'mockPosition'],
			[true, 'mockPosition']
		]);

		expect(item).toEqual({
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse'
		});
	});

	it('should animate position', () => {
		updateItem.call(context, item, positionFunction, 200);
		item.step(1120);

		expect(calculateMatrix.mock.calls).toEqual([
			[false, 'mockPosition60Iteration0'],
			[true, 'mockPosition60Iteration0']
		]);

		expect(item).toEqual({
			step: expect.any(Function),
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse'
		});

		calculateMatrix.mockClear();
		item.step(1240);

		expect(calculateMatrix.mock.calls).toEqual([
			[false, 'mockPosition100Iteration1'],
			[true, 'mockPosition100Iteration1']
		]);

		expect(item).toEqual({
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse'
		});
	});
	
	it('should loop animation', () => {
		updateItem.call(context, item, positionFunction, durationFunction);
		item.step(1001);
		item.step(1002);
		item.step(1360);

		expect(durationFunction.mock.calls).toEqual([
			[0],
			[1, 2],
			[2, 0]
		]);

		expect(calculateMatrix.mock.calls).toEqual([
			[false, 'mockPosition1Iteration0'],
			[true, 'mockPosition1Iteration0'],
			[false, 'mockPosition2Iteration0'],
			[true, 'mockPosition2Iteration0'],
			[false, 'mockPosition20Iteration2'],
			[true, 'mockPosition20Iteration2']
		]);

		expect(item).toEqual({
			step: expect.any(Function),
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse'
		});
	});
});
