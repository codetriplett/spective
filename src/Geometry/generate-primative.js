import { generateBand } from './generate-band';
import { parseFile } from './parse-file';

function generateCube (x = 0, y = 0, z = 0) {
	return parseFile([
		`v ${x} 0 0`,
		`v ${x} 0 ${z}`,
		`v 0 0 ${z}`,
		'v 0 0 0',
		`v ${x} ${y} 0`,
		`v ${x} ${y} ${z}`,
		`v 0 ${y} ${z}`,
		`v 0 ${y} 0`,
		'vt 0 0',
		`vt 0 ${y}`,
		`vt ${x} 0`,
		`vt ${x} ${y}`,
		`vt ${z} 0`,
		`vt ${z} ${y}`,
		`vt 0 ${z}`,
		`vt ${x} ${z}`,
		'f 1/3 2/8 3/7 4/1',
		'f 5/8 8/7 7/1 6/3',
		'f 1/5 5/6 6/2 2/1',
		'f 2/3 6/4 7/2 3/1',
		'f 3/5 7/6 8/2 4/1',
		'f 5/2 1/1 4/3 8/4'
	].join('\n'), 1);
}

function generateRadial (points = 3, height = 0) {
	const cone = points < 3;
	points = Math.abs(points);
	const sharpness = Math.floor(points % 1);
	points = Math.floor(points);
	const file = [];

	file.push(generateBand(-points, 0, 0, 0, 0));
	file.push(generateBand(-points, 0, 0.5, 0.5, 1));
	file.push(generateBand(points, 0, 0.5, 0));

	if (cone) {
		file.push(generateBand(points, height, 0, height, 3));
	} else {
		file.push(generateBand(points, height, 0.5, height, 3));
		file.push(generateBand(-points, height, 0.5, 0.5));
		file.push(generateBand(-points, height, 0, 0, -5));
	}

	return parseFile(file.join('\n'), sharpness);
}

function generateSphere (rings = 1) {
	const dome = rings < 0;
	rings = Math.abs(rings);
	const sharpness = Math.floor(rings % 1);
	rings = Math.floor(rings);

	let bands = rings + 1;

	const points = Math.floor(rings * 1.5 + 2);
	const step = 1 / bands;
	const arc = Math.PI * step;
	const file = [];

	for (let i = 0; i < bands; i++) {
		const angle = i * arc;
		const height = -Math.cos(angle) * 0.5;
		const radius = Math.sin(angle) * 0.5;
		const placement = i * step;

		file.push(generateBand(points, height, radius, placement, i));
	}

	file.push(generateBand(points, 0.5, 0, 1, -bands));
	
	return parseFile(file.join('\n'), sharpness);
}

export function generatePrimative (...parameters) {
	switch (parameters.length) {
		case 3:
			return generateCube(...parameters);
		case 2:
			return generateRadial(...parameters);
		default:
			return generateSphere(...parameters);
	}
}
