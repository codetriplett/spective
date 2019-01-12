export function expandPoints (dimensions, faces, points) {
	const facesLength = faces.length;
	const pointsLength = Array.isArray(points) ? points.length : 0;
	const expandedLength = facesLength * dimensions;
	const expandedPoints = new Float32Array(expandedLength);

	if (pointsLength < expandedLength) {
		faces.forEach((pointIndex, i) => {
			const pointStart = pointIndex * dimensions;
			const values = points.slice(pointStart, pointStart + dimensions);
	
			expandedPoints.set(values, i * dimensions);
		});
	} else {
		expandedPoints.set(points.slice(0, expandedLength));
	}

	return expandedPoints;
}
