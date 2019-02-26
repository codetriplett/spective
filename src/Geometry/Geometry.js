import { parseFile } from './parse-file';
import { Asset } from '../Asset/Asset';

export class Geometry {
	constructor (source, callback = () => {}) {
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

		this.assets = {};
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
