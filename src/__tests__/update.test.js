import { update } from '../update';

describe('update', () => {
	it('should add new values', () => {
		const options = {};
		
		update(options, {
			scale: 1,
			position: [0, 0, 0],
			rotation: 0,
			tilt: 0,
			spin: 0,
			offset: [0, 0, 0]
		});

		expect(options).toEqual({
			scale: 1,
			position: [0, 0, 0],
			rotation: 0,
			tilt: 0,
			spin: 0,
			offset: [0, 0, 0]
		});
	});

	it('should update values', () => {
		const options = {
			scale: 1,
			position: [0, 0, 0],
			rotation: 0,
			tilt: 0,
			spin: 0,
			offset: [0, 0, 0]
		};
		
		update(options, {
			scale: 0.5,
			position: [1, 2, 3],
			rotation: 1,
			tilt: 2,
			spin: 3,
			offset: [0.1, 0.2, 0.3]
		});

		expect(options).toEqual({
			scale: 0.5,
			position: [1, 2, 3],
			rotation: 1,
			tilt: 2,
			spin: 3,
			offset: [0.1, 0.2, 0.3]
		});
	});

	it('should not add invalid values', () => {
		const options = {};
		
		update(options, {
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
});
