import { calculateMatrix } from '../calculate-matrix';
import { updateItem } from '../update-item';

jest.mock('../calculate-matrix', () => ({ calculateMatrix: jest.fn() }));

const render = jest.fn();
const positionFunction = jest.fn();
const durationFunction = jest.fn();
const callbackFunction = jest.fn();
let item;

describe('../update-item', () => {
	beforeEach(() => {
		calculateMatrix.mockClear().mockImplementation(inverse => {
			return `mockCalculateMatrix${inverse ? 'Inverse' : ''}`
		});

		window.Date.now = jest.fn().mockReturnValue(1000);
		render.mockClear();
		positionFunction.mockClear().mockImplementation(progress => `mockPosition${Math.round(progress * 100)}`);
		durationFunction.mockClear().mockImplementation(iteration => (iteration + 1) * 100);
		callbackFunction.mockClear();
		item = {};
	});

	it('should set position', () => {
		updateItem(render, item, 'mockPosition');

		expect(calculateMatrix.mock.calls).toEqual([
			[false, 'mockPosition'],
			[true, 'mockPosition']
		]);

		expect(item).toEqual({
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse'
		});
	});

	it('should run callback', () => {
		updateItem(render, item, 'mockPosition', callbackFunction);
		expect(callbackFunction).toHaveBeenCalledWith('mockCalculateMatrixmockCalculateMatrixInverse');
	});

	it('should animate position', () => {
		updateItem(render, item, positionFunction, 200, callbackFunction);
		item.step(1120);

		expect(calculateMatrix.mock.calls).toEqual([
			[false, 'mockPosition60'],
			[true, 'mockPosition60']
		]);

		expect(item).toEqual({
			step: expect.any(Function),
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse'
		});

		calculateMatrix.mockClear();
		item.step(1240);

		expect(calculateMatrix.mock.calls).toEqual([
			[false, 'mockPosition100'],
			[true, 'mockPosition100']
		]);

		expect(item).toEqual({
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse'
		});

		expect(callbackFunction).toHaveBeenCalledTimes(2);
	});
	
	it('should loop animation', () => {
		updateItem(render, item, positionFunction, durationFunction, callbackFunction);
		item.step(1360);

		expect(calculateMatrix.mock.calls).toEqual([
			[false, 'mockPosition20'],
			[true, 'mockPosition20']
		]);

		expect(item).toEqual({
			step: expect.any(Function),
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse'
		});

		expect(callbackFunction).toHaveBeenCalledTimes(1);
	});
});
