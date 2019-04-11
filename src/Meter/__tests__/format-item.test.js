import { formatItem } from '../format-item';

describe('format-item', () => {
	it('should wrap item in an object', () => {
		const actual = formatItem('item');
		expect(actual).toEqual([{ item: 'item' }]);
	});

	it('should include branches', () => {
		const actual = formatItem('item', [
			[{ item: 'a1' }, { item: 'a2' }],
			7,
			[{ item: 'b1' }, { item: 'b2' }]
		], 1);

		expect(actual).toMatchObject([
			{ item: 'item', branches: [2, 7, 4] },
			{ item: 'a1', previous: 1 },
			{ item: 'a2' },
			{ item: 'b1', previous: 1 },
			{ item: 'b2' }
		]);
	});
});
