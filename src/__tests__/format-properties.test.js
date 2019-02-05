import { formatProperties } from '../format-properties';

describe('format-properties', () => {
	it('should set all valid granular properties', () => {
		const actual = formatProperties({
			scaleX: 0,
			scaleY: 1,
			scaleZ: 2,
			offsetX: 3,
			offsetY: 4,
			offsetZ: 5,
			angleX: 6,
			angleY: 7,
			angleZ: 8,
			positionX: 9,
			positionY: 10,
			positionZ: 11,
			other: 12
		});

		expect(actual).toEqual({
			scaleX: 0,
			scaleY: 1,
			scaleZ: 2,
			offsetX: 3,
			offsetY: 4,
			offsetZ: 5,
			angleX: 6,
			angleY: 7,
			angleZ: 8,
			positionX: 9,
			positionY: 10,
			positionZ: 11
		});
	});

	it('should set all valid grouped properties', () => {
		const actual = formatProperties({
			scale: [0, 1, 2],
			offset: [3, 4, 5],
			angle: [6, 7, 8],
			position: [9, 10, 11]
		});

		expect(actual).toEqual({
			scaleX: 0,
			scaleY: 1,
			scaleZ: 2,
			offsetX: 3,
			offsetY: 4,
			offsetZ: 5,
			angleX: 6,
			angleY: 7,
			angleZ: 8,
			positionX: 9,
			positionY: 10,
			positionZ: 11
		});
	});

	it('should overwrite grouped properties with granular properties', () => {
		const actual = formatProperties({
			scale: [0, 1, 2],
			offset: [3, 4, 5],
			angle: [6, 7, 8],
			position: [9, 10, 11],
			scaleX: 0.1,
			scaleY: 1.1,
			scaleZ: 2.1,
			offsetX: 3.1,
			offsetY: 4.1,
			offsetZ: 5.1,
			angleX: 6.1,
			angleY: 7.1,
			angleZ: 8.1,
			positionX: 9.1,
			positionY: 10.1,
			positionZ: 11.1
		});

		expect(actual).toEqual({
			scaleX: 0.1,
			scaleY: 1.1,
			scaleZ: 2.1,
			offsetX: 3.1,
			offsetY: 4.1,
			offsetZ: 5.1,
			angleX: 6.1,
			angleY: 7.1,
			angleZ: 8.1,
			positionX: 9.1,
			positionY: 10.1,
			positionZ: 11.1
		});
	});

	it('should overwrite grouped properties with invalid granular properties', () => {
		const actual = formatProperties({
			scale: [0, 1, 2],
			offset: [3, 4, 5],
			angle: [6, 7, 8],
			position: [9, 10, 11],
			scaleX: 'a',
			scaleY: 'b',
			scaleZ: 'c',
			offsetX: 'd',
			offsetY: 'e',
			offsetZ: 'f',
			angleX: 'g',
			angleY: 'h',
			angleZ: 'i',
			positionX: 'j',
			positionY: 'k',
			positionZ: 'l'
		});

		expect(actual).toEqual({
			scaleX: 0,
			scaleY: 1,
			scaleZ: 2,
			offsetX: 3,
			offsetY: 4,
			offsetZ: 5,
			angleX: 6,
			angleY: 7,
			angleZ: 8,
			positionX: 9,
			positionY: 10,
			positionZ: 11
		});
	});

	it('should treat a number input as a angleY property', () => {
		const actual = formatProperties(1);
		expect(actual).toEqual({ angleY: 1 });
	});
	
	it('should return an empty object if no properties were provided', () => {
		const actual = formatProperties();
		expect(actual).toEqual({});
	});
});
