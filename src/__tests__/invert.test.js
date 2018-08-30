import { invert } from '../invert';

describe('invert', () => {
	it('should invert values', () => {
		const actual = invert({
			scale: 0.5,
			position: [1, 2, 3],
			rotation: 1,
			tilt: 2,
			spin: 3,
			offset: [0.1, 0.2, 0.3]
		});

		expect(actual).toEqual({
			scale: 2,
			position: [-1, -2, -3],
			rotation: -1,
			tilt: -2,
			spin: -3,
			offset: [-0.1, -0.2, -0.3]
		});
	});
});
