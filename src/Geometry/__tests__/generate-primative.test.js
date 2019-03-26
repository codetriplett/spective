import { generateBand } from '../generate-band';
import { parseFile } from '../parse-file';
import { generatePrimative } from '../generate-primative';

jest.mock('../generate-band', () => ({ generateBand: jest.fn() }));
jest.mock('../parse-file', () => ({ parseFile: jest.fn() }));

describe('generate-primative', () => {
	const fill = jest.fn();
	let geometry;

	beforeEach(() => {
		fill.mockClear();
		geometry = { normals: { fill } };

		generateBand.mockClear().mockReturnValue('band');
		parseFile.mockClear().mockReturnValue(geometry);
	});

	it('should create a cube', () => {
		const actual = generatePrimative(1, 2, 3);

		expect(parseFile).toHaveBeenCalledWith([
			'v 1 0 0',
			'v 1 0 3',
			'v 0 0 3',
			'v 0 0 0',
			'v 1 2 0',
			'v 1 2 3',
			'v 0 2 3',
			'v 0 2 0',
			'vt 0 0',
			'vt 0 2',
			'vt 1 0',
			'vt 1 2',
			'vt 3 0',
			'vt 3 2',
			'vt 0 3',
			'vt 1 3',
			'f 1/7 2/1 3/3 4/8',
			'f 5/8 8/7 7/1 6/3',
			'f 1/5 5/6 6/2 2/1',
			'f 2/3 6/4 7/2 3/1',
			'f 3/5 7/6 8/2 4/1',
			'f 5/2 1/1 4/3 8/4'
		].join('\n'), 1);

		expect(fill).not.toHaveBeenCalled();
		expect(actual).toEqual(geometry);
	});

	it('should fully illuminate an inverted cube', () => {
		generatePrimative(-1, -2, -3);
		expect(fill).toHaveBeenCalledWith(1);
	});

	it('should create a cylinder', () => {
		const actual = generatePrimative(3, 2);

		expect(generateBand.mock.calls).toEqual([
			[-3, 0, 0, 0, 0],
			[-3, 0, 0.5, -0.5, 1],
			[3, 0, 0.5, 0],
			[3, 2, 0.5, 2, 3],
			[-3, 2, 0.5, 0.5],
			[-3, 2, 0, 0, -5]
		]);

		expect(parseFile).toHaveBeenCalledWith('band\nband\nband\nband\nband\nband', 0);
		expect(actual).toEqual(geometry);
	});

	it('should fully illuminate an inverted cylinder', () => {
		generatePrimative(3, -2);
		expect(fill).toHaveBeenCalledWith(1);
	});

	it('should create a cone', () => {
		const actual = generatePrimative(-3, 2);

		expect(generateBand.mock.calls).toEqual([
			[-3, 0, 0, 0, 0],
			[-3, 0, 0.5, -0.5, 1],
			[3, 0, 0.5, 0],
			[3, 2, 0, 2, -3, 1]
		]);

		expect(parseFile).toHaveBeenCalledWith('band\nband\nband\nband', 0);
		expect(actual).toEqual(geometry);
	});

	it('should fully illuminate an inverted cone', () => {
		generatePrimative(-3, -2);
		expect(fill).toHaveBeenCalledWith(1);
	});

	it('should create a sphere', () => {
		const actual = generatePrimative(3);

		expect(generateBand.mock.calls).toEqual([
			[6, -0.5, 0, 0, 0, 0],
			[6, -0.3535533905932738, 0.35355339059327373, 0.25, -1, 1],
			[6, -3.061616997868383e-17, 0.5, 0.5, 2, 2],
			[6, 0.35355339059327373, 0.3535533905932738, 0.75, 3, 3],
			[6, 0.5, 0, 1, -4, 4]
		]);

		expect(parseFile).toHaveBeenCalledWith('band\nband\nband\nband\nband', 0);
		expect(fill).not.toHaveBeenCalled();
		expect(actual).toEqual(geometry);
	});

	it('should create a dome', () => {
		const actual = generatePrimative(-2);

		expect(generateBand.mock.calls).toEqual([
			[9, -3.061616997868383e-14, -500, 0, 0, 0],
			[9, 249.9999999999999, -433.01270189221935, 0.3333333333333333, 1, 1],
			[9, 433.01270189221924, -250.00000000000017, 0.6666666666666666, 2, 2],
			[9, 500, 0, 1, -3, 3]
		]);

		expect(parseFile).toHaveBeenCalledWith('band\nband\nband\nband', 0);
		expect(fill).toHaveBeenCalledWith(1);
		expect(actual).toEqual(geometry);
	});
});
