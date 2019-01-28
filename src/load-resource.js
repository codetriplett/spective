const hexadecimals = '0123456789abcdef';
const hexadecimalRegex = /^(#[0-9a-f]{3}|#[0-9a-f]{6})$/;
const imageRegex = /\.(jpg|jpeg|png|gif|bmp|svg)$/;

function parseColor (source) {
	if (!hexadecimalRegex.test(source)) {
		return;
	}

	const offset = source.length > 4 ? 1 : 0;
	
	const colors = [0, 1, 2].map(i => {
		const index = (i << offset) + 1;
		const first = hexadecimals.indexOf(source[index]);
		const second = hexadecimals.indexOf(source[index + offset]);

		return (Number(first) << 4) + Number(second);
	});

	return new Uint8Array([...colors, 255]);
}

function loadImage (source, callback) {
	const image = new window.Image();

	image.src = source;
	image.addEventListener('load', () => callback(image));
	image.addEventListener('error', () => callback());
}

function loadFile (source, callback) {
	const xmlhttp = new XMLHttpRequest();
	
	xmlhttp.onload = () => {
		if (xmlhttp.status === 200) {
			callback(xmlhttp.responseText);
		} else if (xmlhttp.status === 404) {
			callback();
		}
	};

	xmlhttp.open('GET', source);
	xmlhttp.send();
}

export function loadResource (source, callback) {
	if (source[0] === '#') {
		callback(parseColor(source));
	} else if (imageRegex.test(source)) {
		loadImage(source, callback);
	} else {
		loadFile(source, callback);
	}
}
