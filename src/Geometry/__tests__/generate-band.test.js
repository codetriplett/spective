import { generateBand } from '../generate-band';

describe('generate-band', () => {
	it('should generate initial point with surrounding image', () => {
		const actual = generateBand(3, -0.5, 0, 0, 0, 0);

		expect(actual).toBe([
			'vt 0 0',
			'v 0 -0.5 0',
			'vt 0.3333333333333333 0',
			'v 0 -0.5 0',
			'vt 0.6666666666666666 0',
			'v 0 -0.5 0',
			'vt 1 0',
		].join('\n'));
	});

	it('should generate initial point with direct image', () => {
		const actual = generateBand(-3, -0.5, 0, 0, 0);

		expect(actual).toBe([
			'vt 0.5 0.5',
			'v 0 -0.5 0',
			'vt 0.5 0.5',
			'v 0 -0.5 0',
			'vt 0.5 0.5',
			'v 0 -0.5 0',
			'vt 0.5 0.5'
		].join('\n'));
	});

	it('should generate bottom cap with surrounding image', () => {
		const actual = generateBand(3, -0.25, 0.5, 0.25, -1, true);

		expect(actual).toBe([
			'vt -0.16666666666666666 0.25',
			'v 0.4330127018922193 -0.25 -0.25000000000000006',
			'vt 0.16666666666666666 0.25',
			'v -0.4330127018922193 -0.25 -0.25000000000000006',
			'vt 0.5 0.25',
			'v -6.123233995736766e-17 -0.25 0.5',
			'vt 0.8333333333333334 0.25',
			'f 4/5 3/1 5/6',
			'f 5/6 3/2 6/7',
			'f 6/7 3/3 4/8'
		].join('\n'));
	});

	it('should generate bottom cap with direct image', () => {
		const actual = generateBand(-3, -0.25, 0.5, 0.5, -1);

		expect(actual).toBe([
			'vt 0.5 1',
			'v 0 -0.25 -0.5',
			'vt 0.06698729810778065 0.2500000000000001',
			'v -0.43301270189221935 -0.25 0.2499999999999999',
			'vt 0.9330127018922192 0.24999999999999978',
			'v 0.43301270189221924 -0.25 0.2500000000000002',
			'vt 0.5000000000000001 1',
			'f 4/5 3/1 5/6',
			'f 5/6 3/2 6/7',
			'f 6/7 3/3 4/8'
		].join('\n'));
	});

	it('should generate bottom cap with inverted radius', () => {
		const actual = generateBand(3, -0.25, -0.5, 0.25, -1);

		expect(actual).toBe([
			'vt 0 0.25',
			'v 0 -0.25 0.5',
			'vt 0.3333333333333333 0.25',
			'v -0.43301270189221935 -0.25 -0.2499999999999999',
			'vt 0.6666666666666666 0.25',
			'v 0.43301270189221924 -0.25 -0.2500000000000002',
			'vt 1 0.25',
			'f 4/5 3/1 5/6',
			'f 5/6 3/2 6/7',
			'f 6/7 3/3 4/8'
		].join('\n'));
	});

	it('should generate middle band with surrounding image', () => {
		const actual = generateBand(3, 0.25, 0.5, 0.75, 2);

		expect(actual).toBe([
			'vt 0 0.75',
			'v 0 0.25 -0.5',
			'vt 0.3333333333333333 0.75',
			'v -0.43301270189221935 0.25 0.2499999999999999',
			'vt 0.6666666666666666 0.75',
			'v 0.43301270189221924 0.25 0.2500000000000002',
			'vt 1 0.75',
			'f 7/9 4/5 8/10',
			'f 5/6 8/10 4/5',
			'f 8/10 5/6 9/11',
			'f 6/7 9/11 5/6',
			'f 9/11 6/7 7/12',
			'f 4/8 7/12 6/7'
		].join('\n'));
	});

	it('should generate middle band with direct image', () => {
		const actual = generateBand(-3, 0.25, 0.5, 0.5, 2);

		expect(actual).toBe([
			'vt 0.5 1',
			'v 0 0.25 -0.5',
			'vt 0.06698729810778065 0.2500000000000001',
			'v -0.43301270189221935 0.25 0.2499999999999999',
			'vt 0.9330127018922192 0.24999999999999978',
			'v 0.43301270189221924 0.25 0.2500000000000002',
			'vt 0.5000000000000001 1',
			'f 7/9 4/5 8/10',
			'f 5/6 8/10 4/5',
			'f 8/10 5/6 9/11',
			'f 6/7 9/11 5/6',
			'f 9/11 6/7 7/12',
			'f 4/8 7/12 6/7'
		].join('\n'));
	});

	it('should generate middle band with inverted radius', () => {
		const actual = generateBand(3, 0.25, -0.5, 0.75, 1);

		expect(actual).toBe([
			'vt 0 0.75',
			'v 0 0.25 0.5',
			'vt 0.3333333333333333 0.75',
			'v -0.43301270189221935 0.25 -0.2499999999999999',
			'vt 0.6666666666666666 0.75',
			'v 0.43301270189221924 0.25 -0.2500000000000002',
			'vt 1 0.75',
			'f 4/5 1/1 5/6',
			'f 2/2 5/6 1/1',
			'f 5/6 2/2 6/7',
			'f 3/3 6/7 2/2',
			'f 6/7 3/3 4/8',
			'f 1/4 4/8 3/3'
		].join('\n'));
	});

	it('should generate top cap with surrounding image', () => {
		const actual = generateBand(3, 0.5, 0, 1, -3);

		expect(actual).toBe([
			'vt 0 1',
			'v 0 0.5 0',
			'vt 0.3333333333333333 1',
			'v 0 0.5 0',
			'vt 0.6666666666666666 1',
			'v 0 0.5 0',
			'vt 1 1',
			'f 8/10 10/14 7/9',
			'f 9/11 10/15 8/10',
			'f 7/12 10/16 9/11'
		].join('\n'));
	});

	it('should generate bottom cap with direct image', () => {
		const actual = generateBand(-3, 0.5, 0, 0, -3);

		expect(actual).toBe([
			'vt 0.5 0.5',
			'v 0 0.5 0',
			'vt 0.5 0.5',
			'v 0 0.5 0',
			'vt 0.5 0.5',
			'v 0 0.5 0',
			'vt 0.5 0.5',
			'f 8/10 10/14 7/9',
			'f 9/11 10/15 8/10',
			'f 7/12 10/16 9/11'
		].join('\n'));
	});

	it('should not generate faces if index is not provided', () => {
		const actual = generateBand(-3, 0.25, 0.5, 0.5);

		expect(actual).toBe([
			'vt 0.5 1',
			'v 0 0.25 -0.5',
			'vt 0.06698729810778065 0.2500000000000001',
			'v -0.43301270189221935 0.25 0.2499999999999999',
			'vt 0.9330127018922192 0.24999999999999978',
			'v 0.43301270189221924 0.25 0.2500000000000002',
			'vt 0.5000000000000001 1'
		].join('\n'));
	});
});
