export function expand (faces, values) {
	const length = faces.length;
	const size = Math.floor(values.length / (Math.max(...faces) + 1));
	const array = new Float32Array(length * size);

	faces.forEach((pointIndex, i) => {
		const pointStart = pointIndex * size;
		const coordinates = values.slice(pointStart, pointStart + size);

		array.set(coordinates, i * size);
	});

	return array;
}
