import { calculateMatrix } from '../calculate-matrix';
import { updateItem } from '../update-item';

jest.mock('../calculate-matrix', () => ({ calculateMatrix: jest.fn() }));

const render = jest.fn();
let item;

describe('../update-item', () => {
	beforeEach(() => {
		calculateMatrix.mockClear().mockImplementation(inverse => {
			return `mockCalculateMatrix${inverse === true ? 'Inverse' : ''}`
		});

		render.mockClear();
		item = {};
	});

	it('should update item', () => {
		updateItem(render, item, 'first', 'second');

		expect(calculateMatrix.mock.calls).toEqual([
			['first', 'second'],
			[true, 'first', 'second']
		]);

		expect(item).toEqual({
			matrix: 'mockCalculateMatrix',
			inverse: 'mockCalculateMatrixInverse'
		});
	});
});
