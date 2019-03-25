import { generatePrimative } from './generate-primative';
import { parseFile } from './parse-file';
import { Asset } from '../Asset/Asset';

const primativeRegex = /^ *-?[0-9]+(\.[0-9]+)?( +-?[0-9]+(\.[0-9]+)?){0,2} *$/;

export class Geometry {
	constructor (source, callback = () => {}) {
		this.assets = {};

		if (primativeRegex.test(source)) {
			const dimensions = source.trim().split(/ +/g).map(value => Number(value));
			const primative = generatePrimative(...dimensions);

			Object.assign(this, primative);
			
			return;
		}

		const xmlhttp = new XMLHttpRequest();
		
		xmlhttp.onload = () => {
			const status = xmlhttp.status;

			if (status === 200 || status === 404) {
				if (status === 200) {
					Object.assign(this, parseFile(xmlhttp.responseText));
				}
				
				callback(source);
			}
		};

		xmlhttp.open('GET', source);
		xmlhttp.send();
	}

	createAsset (source, callback) {
		let asset = this.assets[source];

		if (!asset) {
			asset = new Asset(source, callback);
			this.assets[source] = asset;
		}

		return asset;
	}

	destroyAsset (source, anchor) {
		if (!anchor) {
			delete this.assets[source];
			return;
		}

		const asset = this.assets[source];
		const { instances } = asset;

		for (let i = instances.length - 1; i >= 0; i--) {
			asset.destroyInstance(instances[i], anchor);
		}
	}
}
