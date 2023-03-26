import Asset, { parseColor } from './asset';

describe('parseColor', () => {
	it('parses rgb', () => {
		const actual = parseColor('#fff');
		expect(actual).toEqual(new Uint8Array([255, 255, 255, 255]));
	});

	it('parses rgba', () => {
		const actual = parseColor('#ffff');
		expect(actual).toEqual(new Uint8Array([255, 255, 255, 255]));
	});

	it('parses rgbaa', () => {
		const actual = parseColor('#fff80');
		expect(actual).toEqual(new Uint8Array([255, 255, 255, 128]));
	});

	it('parses rrggbb', () => {
		const actual = parseColor('#808080');
		expect(actual).toEqual(new Uint8Array([128, 128, 128, 255]));
	});

	it('parses rrggbba', () => {
		const actual = parseColor('#808080f');
		expect(actual).toEqual(new Uint8Array([128, 128, 128, 255]));
	});

	it('parses rrggbbaa', () => {
		const actual = parseColor('#80808080');
		expect(actual).toEqual(new Uint8Array([128, 128, 128, 128]));
	});

	it('parses rgbrgb', () => {
		const actual = parseColor('#fff#fff');
		expect(actual).toEqual(new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255]));
	});
});

// TODO: test that textures can be overwritten
// - not needed for now since this should isn't encouraged
describe('Asset', () => {
	it('creates asset', () => {
		const actual = new Asset();

		expect(actual).toEqual({
			nodes: new Set(),
			cells: '0:0',
			tags: '',
			sx: 1,
			sy: 1,
			_cells: [[0, 0]],
			_tags: [],
		});
	});

	it('sets texture', () => {
		const actual = new Asset();
		actual.update({ texture: '#fff' });

		expect(actual).toEqual({
			nodes: new Set(),
			cells: '0:0',
			tags: '',
			sx: 1,
			sy: 1,
			texture: '#fff',
			_cells: [[0, 0]],
			_tags: [],
			_texture: new Uint8Array([255, 255, 255, 255]),
			_coordinates: [[0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1]],
		});
	});
});
