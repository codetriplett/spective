export function expandPoints (length, faces, values) {
	const size = Math.floor(values.length / length);
	const array = new Float32Array(faces.length * size);

	faces.forEach((pointIndex, i) => {
		const pointStart = pointIndex * size;
		const coordinates = values.slice(pointStart, pointStart + size);

		array.set(coordinates, i * size);
	});

	return array;
}
