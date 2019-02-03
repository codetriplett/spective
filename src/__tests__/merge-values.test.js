import { mergeValues } from '../merge-values';

describe('merge-values', () => {
	it('should return new number', () => {
		const actual = mergeValues(1, 2);
		expect(actual).toBe(2);
	});

	it('should return existing number if new value is not a number', () => {
		const actual = mergeValues(1, 'value');
		expect(actual).toBe(1);
	});

	it('should return array of the new number if merging a number to an array', () => {
		const actual = mergeValues([1, 2, 3], 4);
		expect(actual).toEqual([4, 4, 4]);
	});

	it('should treat a number as a rotation if merging a number to an object', () => {
		const actual = mergeValues({ rotation: 1, tilt: 2 }, 3);
		expect(actual).toEqual({ rotation: 3, tilt: 2 });
	});
	
	it('should return a merged object', () => {
		const actual = mergeValues({ keep: 1, update: 2 }, { update: 0 });
		expect(actual).toEqual({ keep: 1, update: 0 });
	});
	
	it('should not merge an object onto a number', () => {
		const actual = mergeValues(1, { update: 2 });
		expect(actual).toBe(1);
	});

	it('should overwrite properties', () => {
		const actual = mergeValues({
			scale: [1, 2, 3],
			offset: [4, 5, 6],
			rotation: 7,
			tilt: 8,
			spin: 9,
			position: [10, 11, 12]
		}, {
			scale: 0.2,
			offset: [0.4, 0.5, 0.6],
			tilt: 0.8
		});

		expect(actual).toEqual({
			scale: [0.2, 0.2, 0.2],
			offset: [0.4, 0.5, 0.6],
			rotation: 7,
			tilt: 0.8,
			spin: 9,
			position: [10, 11, 12]
		});
	});
});
