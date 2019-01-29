function createAsset (assets, source, image) {
	const asset = { image, instances: [] };
	assets[source] = asset;
	return asset;
}

export function loadAsset (assets, source, callback) {
	const hexadecimalRegex = /^(#[0-9a-f]{3}|#[0-9a-f]{6})$/;
	const hexadecimals = '0123456789abcdef';

	if (assets[source]) {
		callback(assets[source]);
	} else if (hexadecimalRegex.test(source)) {
		const offset = source.length > 4 ? 1 : 0;
		
		const colors = [0, 1, 2].map(i => {
			const index = (i << offset) + 1;
			const first = hexadecimals.indexOf(source[index]);
			const second = hexadecimals.indexOf(source[index + offset]);

			return (Number(first) << 4) + Number(second);
		});

		callback(createAsset(assets, source, new Uint8Array([...colors, 255])));
	} else {
		const image = new window.Image();
	
		image.src = source;
		image.addEventListener('load', () => callback(createAsset(assets, source, image)));
		image.addEventListener('error', () => callback({}));

		return true;
	}
}
