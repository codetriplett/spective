import { formatProperties } from '../format-properties';

describe('format-properties', () => {
	it('should set all valid granular properties', () => {
		const actual = formatProperties({
			scaleX: 0,
			scaleY: 1,
			scaleZ: 2,
			angleX: 3,
			angleY: 4,
			angleZ: 5,
			offsetX: 6,
			offsetY: 7,
			offsetZ: 8,
			headingX: 9,
			headingY: 10,
			headingZ: 11,
			positionX: 12,
			positionY: 13,
			positionZ: 14,
			other: 15
		});

		expect(actual).toEqual({
			scaleX: 0,
			scaleY: 1,
			scaleZ: 2,
			angleX: 3,
			angleY: 4,
			angleZ: 5,
			offsetX: 6,
			offsetY: 7,
			offsetZ: 8,
			headingX: 9,
			headingY: 10,
			headingZ: 11,
			positionX: 12,
			positionY: 13,
			positionZ: 14
		});
	});

	it('should set all valid grouped properties', () => {
		const actual = formatProperties({
			scale: [0, 1, 2],
			angle: [3, 4, 5],
			offset: [6, 7, 8],
			heading: [9, 10, 11],
			position: [12, 13, 14]
		});

		expect(actual).toEqual({
			scaleX: 0,
			scaleY: 1,
			scaleZ: 2,
			angleX: 3,
			angleY: 4,
			angleZ: 5,
			offsetX: 6,
			offsetY: 7,
			offsetZ: 8,
			headingX: 9,
			headingY: 10,
			headingZ: 11,
			positionX: 12,
			positionY: 13,
			positionZ: 14
		});
	});

	it('should overwrite grouped properties with granular properties', () => {
		const actual = formatProperties({
			scale: [0, 1, 2],
			angle: [3, 4, 5],
			offset: [6, 7, 8],
			heading: [9, 10, 11],
			position: [12, 13, 14],
			scaleX: 0.1,
			scaleY: 1.1,
			scaleZ: 2.1,
			angleX: 3.1,
			angleY: 4.1,
			angleZ: 5.1,
			offsetX: 6.1,
			offsetY: 7.1,
			offsetZ: 8.1,
			headingX: 9.1,
			headingY: 10.1,
			headingZ: 11.1,
			positionX: 12.1,
			positionY: 13.1,
			positionZ: 14.1
		});

		expect(actual).toEqual({
			scaleX: 0.1,
			scaleY: 1.1,
			scaleZ: 2.1,
			angleX: 3.1,
			angleY: 4.1,
			angleZ: 5.1,
			offsetX: 6.1,
			offsetY: 7.1,
			offsetZ: 8.1,
			headingX: 9.1,
			headingY: 10.1,
			headingZ: 11.1,
			positionX: 12.1,
			positionY: 13.1,
			positionZ: 14.1
		});
	});

	it('should not overwrite grouped properties with invalid granular properties', () => {
		const actual = formatProperties({
			scale: [0, 1, 2],
			angle: [3, 4, 5],
			offset: [6, 7, 8],
			heading: [9, 10, 11],
			position: [12, 13, 14],
			scaleX: 'a',
			scaleY: 'b',
			scaleZ: 'c',
			angleX: 'd',
			angleY: 'e',
			angleZ: 'f',
			offsetX: 'g',
			offsetY: 'h',
			offsetZ: 'i',
			headingX: 'j',
			headingY: 'k',
			headingZ: 'l',
			positionX: 'm',
			positionY: 'n',
			positionZ: 'o'
		});

		expect(actual).toEqual({
			scaleX: 0,
			scaleY: 1,
			scaleZ: 2,
			angleX: 3,
			angleY: 4,
			angleZ: 5,
			offsetX: 6,
			offsetY: 7,
			offsetZ: 8,
			headingX: 9,
			headingY: 10,
			headingZ: 11,
			positionX: 12,
			positionY: 13,
			positionZ: 14
		});
	});

	it('should set same scale for all dimensions', () => {
		const actual = formatProperties({ scale: 2 });
		expect(actual).toEqual({ scaleX: 2, scaleY: 2, scaleZ: 2 });
	});
	
	it('should return the default object if no properties were provided', () => {
		const actual = formatProperties();
		expect(actual).toEqual({});
	});
});
