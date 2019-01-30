import { parseFile } from './parse-file';

export function loadAsset (geometrySource, assetSource) {
	const { render, geometries } = this;
	let geometry = geometries[geometrySource];

	if (!geometry) {
		geometry = { assets: {} };
		geometries[geometrySource] = geometry;

		const xmlhttp = new XMLHttpRequest();
		
		xmlhttp.onload = () => {
			if (xmlhttp.status === 200) {
				parseFile(geometry, xmlhttp.responseText);
				render();
			} else if (xmlhttp.status === 404) {
				delete geometries[geometrySource];
			}
		};

		xmlhttp.open('GET', geometrySource);
		xmlhttp.send();
	}

	const hexadecimalRegex = /^(#[0-9a-f]{3}|#[0-9a-f]{6})$/;
	const hexadecimals = '0123456789abcdef';
	const assets = geometry.assets;
	let asset = assets[assetSource];

	if (!asset) {
		asset = { instances: [] };
		assets[assetSource] = asset;
		
		if (hexadecimalRegex.test(assetSource)) {
			const offset = assetSource.length > 4 ? 1 : 0;
			
			const colors = [0, 1, 2].map(i => {
				const index = (i << offset) + 1;
				const first = hexadecimals.indexOf(assetSource[index]);
				const second = hexadecimals.indexOf(assetSource[index + offset]);

				return (Number(first) << 4) + Number(second);
			});

			asset.image = new Uint8Array([...colors, 255]);
		} else {
			const image = new window.Image();
			image.src = assetSource;

			image.addEventListener('load', () => {
				asset.image = image;
				render();
			});

			image.addEventListener('error', () => delete assets[assetSource]);
		}
	}

	return asset;
}
