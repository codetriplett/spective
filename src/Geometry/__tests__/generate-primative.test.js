import { generatePrimative } from '../generate-primative';

describe('generate-primative', () => {
	it('should create a cube', () => {
		const actual = generatePrimative(1, 2, 3);

		expect(actual).toEqual([
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
			'vn 0 -1 0',
			'vn 0 1 0',
			'vn 1 0 0',
			'vn 0 0 1',
			'vn -1 0 0',
			'vn 0 0 -1',
			'f 1/3/1 2/8/1 3/7/1 4/1/1',
			'f 5/8/2 8/7/2 7/1/2 6/3/2',
			'f 1/5/3 5/6/3 6/2/3 2/1/3',
			'f 2/3/4 6/4/4 7/2/4 3/1/4',
			'f 3/5/5 7/6/5 8/2/5 4/1/5',
			'f 5/2/6 1/1/6 4/3/6 8/4/6'
		].join('\n'));
	});

	it('should use defaults', () => {
		const actual = generatePrimative();

		expect(actual).toEqual([
			'v 0 0 0',
			'v 0 0 0',
			'v 0 0 0',
			'v 0 0 0',
			'v 0 0 0',
			'v 0 0 0',
			'v 0 0 0',
			'v 0 0 0',
			'vt 0 0',
			'vt 0 0',
			'vt 0 0',
			'vt 0 0',
			'vt 0 0',
			'vt 0 0',
			'vt 0 0',
			'vt 0 0',
			'vn 0 -1 0',
			'vn 0 1 0',
			'vn 1 0 0',
			'vn 0 0 1',
			'vn -1 0 0',
			'vn 0 0 -1',
			'f 1/3/1 2/8/1 3/7/1 4/1/1',
			'f 5/8/2 8/7/2 7/1/2 6/3/2',
			'f 1/5/3 5/6/3 6/2/3 2/1/3',
			'f 2/3/4 6/4/4 7/2/4 3/1/4',
			'f 3/5/5 7/6/5 8/2/5 4/1/5',
			'f 5/2/6 1/1/6 4/3/6 8/4/6'
		].join('\n'));
	});
});
