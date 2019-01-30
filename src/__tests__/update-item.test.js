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
		positionFunction.mockClear().mockImplementation((progress, iteration) => ({ update: `mockPosition${Math.round(progress * 100)}Iteration${iteration}` }));
		durationFunction.mockClear().mockImplementation(iteration => (iteration + 1) * 100);
		item = {};
		context = { render };
	});

	it('should set position', () => {
		item.anchor = 'mockAnchor';
		updateItem.call(context, item, { existing: 'mockPosition' });

		expect(calculateMatrix.mock.calls).toEqual([
			[false, { existing: 'mockPosition' }, 'mockAnchor'],
			[true, { existing: 'mockPosition' }, 'mockAnchor']
		]);

		expect(item).toEqual({
			anchor: 'mockAnchor',
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse',
			position: { existing: 'mockPosition' }
		});
	});

	it('should update children', () => {
		const child = {
			anchor: 'mockAnchor',
			matrix: 'mockAnchorMatrix',
			position: { existing: 'mockPosition' },
			inverse: 'mockAnchorInverse'
		};

		const expected = {
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse',
			position: { existing: 'mockPosition' },
			children: [child]
		};

		item.children = [child];
		updateItem.call(context, item, { existing: 'mockPosition' });

		expect(calculateMatrix.mock.calls).toEqual([
			[false, { existing: 'mockPosition' }, undefined],
			[true, { existing: 'mockPosition' }, undefined],
			[false, { existing: 'mockPosition' }, expected],
			[true, { existing: 'mockPosition' }, expected]
		]);

		expect(item).toEqual(expected);
	});

	it('should animate position', () => {
		updateItem.call(context, item, positionFunction, 200);
		item.step(1120);

		expect(calculateMatrix.mock.calls).toEqual([
			[false, { update: 'mockPosition60Iteration0' }, undefined],
			[true, { update: 'mockPosition60Iteration0' }, undefined]
		]);

		expect(item).toEqual({
			step: expect.any(Function),
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse',
			position: { update: 'mockPosition60Iteration0' }
		});

		calculateMatrix.mockClear();
		item.step(1240);

		expect(calculateMatrix.mock.calls).toEqual([
			[false, { update: 'mockPosition100Iteration1' }, undefined],
			[true, { update: 'mockPosition100Iteration1' }, undefined]
		]);

		expect(item).toEqual({
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse',
			position: { update: 'mockPosition100Iteration1' }
		});
	});
	
	it('should loop animation', () => {
		updateItem.call(context, item, positionFunction, durationFunction);
		item.step(1001);
		item.step(1002);
		item.step(1360);

		expect(durationFunction.mock.calls).toEqual([
			[0],
			[1],
			[2]
		]);

		expect(calculateMatrix.mock.calls).toEqual([
			[false, { update: 'mockPosition1Iteration0' }, undefined],
			[true, { update: 'mockPosition1Iteration0' }, undefined],
			[false, { update: 'mockPosition2Iteration0' }, undefined],
			[true, { update: 'mockPosition2Iteration0' }, undefined],
			[false, { update: 'mockPosition20Iteration2' }, undefined],
			[true, { update: 'mockPosition20Iteration2' }, undefined]
		]);

		expect(item).toEqual({
			step: expect.any(Function),
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse',
			position: { update: 'mockPosition20Iteration2' }
		});
	});
});
