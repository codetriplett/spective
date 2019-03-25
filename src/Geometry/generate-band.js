export function generateBand (points, height, radius, placement, index) {
	const direct = points < 0;
	const mirroring = placement < 0 ? -1 : 1;
	const cap = index < 0;
	const top = cap && !radius;
	const bottom = cap && radius;

	points = Math.abs(points);
	placement = Math.abs(placement);
	index = Math.abs(index);

	const step = 1 / points;
	const arc = Math.PI * 2 * step;
	const band = [];
	let shift = 0;

	if (!radius) {
		shift = (index ? -step : step) / 2
	}

	for (let i = 0; i <= points; i++) {
		const angle = i * arc;
		const x = -Math.sin(angle);
		const z = -Math.cos(angle);

		if (direct) {
			band.push(`vt ${0.5 + x * placement * mirroring} ${0.5 + -z * placement}`);
		} else {
			band.push(`vt ${i * step + shift} ${placement}`);
		}

		if (i < points) {
			band.push(`v ${x * Math.abs(radius)} ${height} ${z * radius}`);
		}
	}

	if (!index) {
		return band.join('\n');
	}

	Array(points).fill(points * index + 1).forEach((value, i) => {
		const safe = i < points - 1;
		const upper = value + i + 1;
		const lower = upper - points - 1;

		if (!cap || bottom) {
			band.push(`f ${[
				[upper - 1, upper + index - 1].join('/'),
				[bottom ? value - 1 : lower, lower + (index - 1)].join('/'),
				[safe ? upper : value, upper + index].join('/')
			].join(' ')}`);
		}
		
		if (!cap || top) {
			band.push(`f ${[
				[safe ? lower + 1 : value - points, lower + index].join('/'),
				[top ? value : (safe ? upper : value), upper + index].join('/'),
				[lower, lower + (index - 1)].join('/')
			].join(' ')}`);
		}
	});

	return band.join('\n');
}
