export function loadAsset (render, assets, source) {
	const hexadecimalRegex = /^(#[0-9a-f]{3}|#[0-9a-f]{6})$/;
	const hexadecimals = '0123456789abcdef';
	let asset = assets[source];

	if (!asset) {
		asset = { instances: [] };
		assets[source] = asset;
		
		if (hexadecimalRegex.test(source)) {
			const offset = source.length > 4 ? 1 : 0;
			
			const colors = [0, 1, 2].map(i => {
				const index = (i << offset) + 1;
				const first = hexadecimals.indexOf(source[index]);
				const second = hexadecimals.indexOf(source[index + offset]);

				return (Number(first) << 4) + Number(second);
			});

			asset.image = new Uint8Array([...colors, 255]);
		} else {
			const image = new window.Image();
			image.src = source;

			image.addEventListener('load', () => {
				asset.image = image;
				render();
			});

			image.addEventListener('error', () => delete assets[source]);
		}
	}

	return asset;
}
