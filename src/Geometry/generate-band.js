export function generateBand (points, height, radius, placement, index = 0, twist = 0) {
	const direct = points < 0;
	const mirroring = placement < 0 ? -1 : 1;
	const cap = index < 0;
	const top = cap && !radius;
	const bottom = cap && radius;

	points = Math.abs(points);
	placement = Math.abs(placement);
	index = Math.abs(index || 0);

	const step = 1 / points;
	const arc = Math.PI * 2 * step;
	const shift = twist / 2;
	const band = [];

	for (let i = 0; i <= points; i++) {
		let angle = i * arc;

		if (direct) {
			const s = -Math.sin(angle);
			const t = Math.cos(angle);

			band.push(`vt ${0.5 + s * placement * mirroring} ${0.5 + t * placement}`);
		} else {
			band.push(`vt ${i * step - step * shift} ${placement}`);
			angle -= arc * shift;
		}

		if (i < points) {
			const x = -Math.sin(angle);
			const z = -Math.cos(angle);

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
