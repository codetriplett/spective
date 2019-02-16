import { squareImage } from '../square-image';

describe('square-image', () => {
	const getContext = jest.fn();
	const drawImage = jest.fn();
	const getImageData = jest.fn();

	beforeEach(() => {
		getImageData.mockClear().mockReturnValue('image');
		getContext.mockClear().mockReturnValue({ drawImage, getImageData });
		document.createElement = jest.fn().mockReturnValue({ getContext });
	});

	it('should use input image if it already has power of two dimensions', () => {
		const actual = squareImage({ width: 4, height: 8 });

		expect(getContext).not.toHaveBeenCalled();
		expect(drawImage).not.toHaveBeenCalled();
		expect(getImageData).not.toHaveBeenCalled();
		expect(actual).toEqual({ width: 4, height: 8 });
	});

	it('should square image', () => {
		const actual = squareImage({ width: 3, height: 9 });

		expect(getContext).toHaveBeenCalledWith('2d');
		expect(drawImage).toHaveBeenCalledWith({ width: 3, height: 9 }, 0, 0, 4, 16);
		expect(getImageData).toHaveBeenCalledWith(0, 0, 4, 16);
		expect(actual).toEqual('image');
	});
});
