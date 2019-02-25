function squareValue (value) {
	return Math.pow(2, Math.ceil(Math.log2(value)));
}

export function squareImage (image) {
	const { width, height } = image;
	const squaredWidth = squareValue(width);
	const squaredHeight = squareValue(height);

	if (squaredWidth === width && squaredHeight === height) {
		return image;
	}

	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');

	canvas.width = squaredWidth;
	canvas.height = squaredHeight
	context.drawImage(image, 0, 0, squaredWidth, squaredHeight);

	return context.getImageData(0, 0, squaredWidth, squaredHeight);
}
