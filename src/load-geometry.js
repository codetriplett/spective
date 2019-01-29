import { parseFile } from './parse-file';

export function loadGeometry (render, geometries, source) {
	let geometry = geometries[source];

	if (!geometry) {
		geometry = { assets: [] }
		geometries[source] = geometry;

		const xmlhttp = new XMLHttpRequest();
		
		xmlhttp.onload = () => {
			if (xmlhttp.status === 200) {
				parseFile(geometry, xmlhttp.responseText);
				render();
			} else if (xmlhttp.status === 404) {
				delete geometries[source];
			}
		};

		xmlhttp.open('GET', source);
		xmlhttp.send();
	}

	return geometry
}
