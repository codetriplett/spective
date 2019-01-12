function extractArray (file, type, hasIndices) {
	const lines = file.match(new RegExp(`\n${type} [^\n]+`, 'g'));

	if (lines) {
		return lines.map(line => line.split(/ +/).slice(1).map(value => {
			if (!hasIndices) {
				return Number(value);
			}

			return value.split('/').map(index => Number(index) - 1);
		}));
	}
}

function extractPoint (point, type, array, fallback) {
	const index = point[type];

	if (!array) {
		return index;
	}

	const value = array[index];

	return value === undefined ? fallback : value;
}

export function parseFile (scene, file, source) {
	const v = extractArray(file, 'v');
	const vt = extractArray(file, 'vt');
	const vn = extractArray(file, 'vn');
	const f = extractArray(file, 'f', true);
	const triangles = [];
	let vtDefined = false;
	let vnDefined = false;

	f.forEach(points => {
		const length = points.length - 2;

		points.forEach(point => {
			vtDefined = vtDefined || point[1] !== undefined;
			vnDefined = vnDefined || point[2] !== undefined;
		});

		for (let i = 1; i <= length; i++) {
			triangles.push(points[0], points[i], points[i + 1]);
		}
	});

	const fv = triangles.map(triangle => extractPoint(triangle, 0));
	let fvt;
	let fvn;
	
	if (vtDefined) {
		fvt = triangles.map(triangle => extractPoint(triangle, 1, vt, [0.5, 0.5]));
	}

	if (vnDefined) {
		fvn = triangles.map(triangle => extractPoint(triangle, 2, vn, [0, 0]));
	}
	
	const vertices = [].concat(...v);
	const faces = [].concat(...fv);
	const coordinates = [].concat(...fvt);
	const normals = [].concat(...fvn);
	const geometry = scene(vertices, faces, vnDefined ? normals : undefined);

	return geometry(source, vtDefined ? coordinates : undefined);
}
