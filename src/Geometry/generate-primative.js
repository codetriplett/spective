import { generateBand } from './generate-band';
import { parseFile } from './parse-file';

function generateCube (...dimensions) {
	const [x = 0, y = 0, z = 0] = dimensions;

	const primative = parseFile([
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
		'f 1/7 2/1 3/3 4/8',
		'f 5/8 8/7 7/1 6/3',
		'f 1/5 5/6 6/2 2/1',
		'f 2/3 6/4 7/2 3/1',
		'f 3/5 7/6 8/2 4/1',
		'f 5/2 1/1 4/3 8/4'
	].join('\n'), 1);

	if (dimensions.filter(value => value < 0).length % 2) {
		primative.normals.fill(1);
	}

	return primative;
}

function generateRadial (points = 3, height = 0) {
	const cone = points < 3;
	points = Math.abs(points);
	const sharpness = points % 1;
	points = Math.max(Math.floor(points), 2);
	const file = [];

	file.push(generateBand(-points, 0, 0, 0, 0));
	file.push(generateBand(-points, 0, 0.5, -0.5, 1));
	file.push(generateBand(points, 0, 0.5, 0));

	if (cone) {
		file.push(generateBand(points, height, 0, height, -3));
	} else {
		file.push(generateBand(points, height, 0.5, height, 3));
		file.push(generateBand(-points, height, 0.5, 0.5));
		file.push(generateBand(-points, height, 0, 0, -5));
	}

	return parseFile(file.join('\n'), sharpness);
}

function generateSphere (rings = 1) {
	const dome = rings < 1;
	rings = Math.abs(rings);
	const sharpness = rings % 1;
	rings = Math.floor(rings);
	const bands = rings + 1;
	rings = dome ? rings * 2 + 1 : rings;

	const points = Math.floor(rings * 1.5 + 2);
	const step = 1 / bands;
	const inverter = dome ? -1 : 1;
	const scale = dome ? 500 : 0.5;
	const file = [];
	let angle = dome ? Math.PI / 2 : 0;
	const arc = (Math.PI - angle) / bands;

	for (let i = 0; i < bands; i++) {
		const height = -Math.cos(angle) * scale;
		const radius = Math.sin(angle) * scale * inverter;
		const placement = i * step;
		const index = i !== 1 || dome ? i : -i;

		file.push(generateBand(points, height, radius, placement, index));
		angle += arc;
	}

	file.push(generateBand(points, scale, 0, 1, -bands));

	const primative = parseFile(file.join('\n'), sharpness);

	if (dome) {
		primative.normals.fill(1);
	}

	return primative;
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
