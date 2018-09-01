import { updateProperties } from '../update-properties';

describe('update-properties', () => {
	let options;

	beforeEach(() => {
		options = {};
	});

	it('should add default values', () => {
		const actual = updateProperties(options);
		
		expect(options).toEqual({
			scale: [1, 1, 1],
			rotation: 0,
			tilt: 0,
			spin: 0,
			position: [0, 0, 0]
		});

		expect(actual).toHaveLength(0);
	});

	it('should add new values', () => {
		updateProperties(options, {
			scale: [0.5, 1, 1.5],
			rotation: 1.5,
			tilt: 2.5,
			spin: 3.5,
			position: [1, 2, 3]
		});

		expect(options).toEqual({
			scale: [0.5, 1, 1.5],
			rotation: 1.5,
			tilt: 2.5,
			spin: 3.5,
			position: [1, 2, 3]
		});
	});
	
	it('should invert values', () => {
		updateProperties(options, true, {
			scale: [0.5, 1, 1.5],
			rotation: 1.5,
			tilt: 2.5,
			spin: 3.5,
			position: [1, 2, 3]
		});

		expect(options).toEqual({
			scale: [2, 1, 2 / 3],
			rotation: -1.5,
			tilt: -2.5,
			spin: -3.5,
			position: [-1, -2, -3]
		});
	});

	it('should update values', () => {
		options = {
			scale: [1, 1, 1],
			rotation: 0,
			tilt: 0,
			spin: 0,
			position: [0, 0, 0]
		};
		
		updateProperties(options, {
			scale: 0.5,
			rotation: 1.5,
			tilt: 2.5,
			spin: 3.5,
			position: [1, 2, 3]
		});

		expect(options).toEqual({
			scale: [0.5, 0.5, 0.5],
			rotation: 1.5,
			tilt: 2.5,
			spin: 3.5,
			position: [1, 2, 3]
		});
	});

	it('should not add invalid values', () => {
		const options = {};
		
		updateProperties(options, {
			scale: '0',
			position: '0',
			rotation: '0',
			tilt: '0',
			spin: '0',
			offset: '0',
			asdf: 0
		});

		expect(options).toEqual({});
	});

	it('should process additional properties', () => {
		options = {
			scale: [1, 1, 1],
			rotation: 0,
			tilt: 0,
			spin: 0,
			position: [0, 0, 0]
		};
		
		const actual = updateProperties(options, {
			scale: [1.5, 2.5, 3.5],
			rotation: 1.5,
			tilt: 2.5,
			spin: 3.5,
			position: [1, 2, 3]
		}, {
			scale: 0.5,
			rotation: 2,
			tilt: 4,
			spin: 6,
			position: [0.1, 0.2, 0.3]
		});

		expect(options).toEqual({
			scale: [1.5, 2.5, 3.5],
			rotation: 1.5,
			tilt: 2.5,
			spin: 3.5,
			position: [1, 2, 3]
		});

		expect(actual).toEqual([
			{
				scale: [0.5, 0.5, 0.5],
				rotation: 2,
				tilt: 4,
				spin: 6,
				position: [0.1, 0.2, 0.3]
			}
		]);
	});
});
