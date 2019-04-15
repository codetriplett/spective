import { linkItems } from '../link-items';

describe('link-items', () => {
	let first;
	let second;
	let alpha;
	let beta;
	let other;
	let third;
	let fourth;
	let items;

	beforeEach(() => {
		first = { item: 'first' };
		second = { item: 'second' };
		alpha = { item: 'alpha' };
		beta = { item: 'beta' };
		other = { item: 'other' };
		third = { item: 'third' };
		fourth = { item: 'fourth' };
		items = [first, second, alpha, beta, other, third, fourth];

		Object.assign(first, { next: second, branches: [] });
		Object.assign(second, { previous: first, next: third, branches: [alpha, other] });
		Object.assign(alpha, { previous: second, next: beta, branches: [] });
		Object.assign(beta, { previous: alpha, branches: [5] });
		Object.assign(other, { previous: second, branches: [-2] });
		Object.assign(third, { previous: second, next: fourth, branches: [3] });
		Object.assign(fourth, { previous: third, branches: [] });
	});

	it('should link items', () => {
		const actual = linkItems(items);

		expect(items[3].branches).toEqual([third]);
		expect(items[4].branches).toEqual([third]);
		expect(items[5].branches).toEqual([beta]);
		expect(actual).toBe(first);
	});

	it('should return specific item', () => {
		const actual = linkItems(items, 2);
		expect(actual).toBe(alpha);
	});

	it('should return specific item from the end', () => {
		const actual = linkItems(items, -2);
		expect(actual).toBe(third);
	});

	it('should limit index to end', () => {
		const actual = linkItems(items, 8);
		expect(actual).toBe(fourth);
	});

	it('should limit index to beginning', () => {
		const actual = linkItems(items, -8);
		expect(actual).toBe(first);
	});
});
