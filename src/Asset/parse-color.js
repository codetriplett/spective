const hexadecimals = '0123456789abcdef';

export function parseColor (color) {
	const offset = color.length > 4 ? 1 : 0;
			
	const values = [0, 1, 2].map(i => {
		const index = (i << offset) + 1;
		const first = hexadecimals.indexOf(color[index]);
		const second = hexadecimals.indexOf(color[index + offset]);

		return (Number(first) << 4) + Number(second);
	});

	return new Uint8Array([...values, 255]);
}
