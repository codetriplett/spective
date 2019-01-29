import { parseFile } from './parse-file';

function createGeometry (geometries, source, file) {
	const geometry = { ...parseFile(file), assets: [] };
	geometries[source] = geometry;
	return geometry;
}

export function loadGeometry (geometries, source, callback) {
	if (geometries[source]) {
		callback(geometries[source]);
	} else {
		const xmlhttp = new XMLHttpRequest();
		
		xmlhttp.onload = () => {
			if (xmlhttp.status === 200) {
				callback(createGeometry(geometries, source, xmlhttp.responseText));
			} else if (xmlhttp.status === 404) {
				callback({});
			}
		};

		xmlhttp.open('GET', source);
		xmlhttp.send();

		return true;
	}
}
