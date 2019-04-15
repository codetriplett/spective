import { gatherBranches } from '../gather-branches';

describe('gather-branches', () => {
	let first;
	let second;
	let alpha;
	let beta;
	let other;
	let third;
	let fourth;

	beforeEach(() => {
		first = { object: 'first' };
		second = { object: 'second' };
		alpha = { object: 'alpha' };
		beta = { object: 'beta' };
		other = { object: 'other' };
		third = { object: 'third' };
		fourth = { object: 'fourth' };

		Object.assign(first, { next: second });
		Object.assign(second, { previous: first, next: third, branches: [alpha, other] });
		Object.assign(alpha, { previous: second, next: beta });
		Object.assign(beta, { previous: alpha, branches: [third] });
		Object.assign(other, { previous: second, branches: [third] });
		Object.assign(third, { previous: second, next: fourth, branches: [beta] });
		Object.assign(fourth, { previous: third });
	});

	it('should gather branches in forward direction at fork', () => {
		const branches = gatherBranches(second, first);

		expect(branches).toEqual([
			[third, second],
			[alpha, second],
			[other, second]
		]);
	});

	it('should gather branches in backward direction at fork', () => {
		const branches = gatherBranches(second, third);

		expect(branches).toEqual([
			[first, second],
			[alpha, second],
			[other, second]
		]);
	});

	it('should gather branches in backward direction from fork', () => {
		const branches = gatherBranches(second, alpha);

		expect(branches).toEqual([
			[first, second],
			[third, second],
			[other, second]
		]);
	});

	it('should gather branches in backward direction on branch', () => {
		const branches = gatherBranches(alpha, beta);

		expect(branches).toEqual([
			[second, alpha]
		]);
	});

	it('should gather branches in forward direction at link', () => {
		const branches = gatherBranches(third, second);

		expect(branches).toEqual([
			[fourth, third],
			[alpha, beta]
		]);
	});

	it('should gather branches in backward direction at link', () => {
		const branches = gatherBranches(third, fourth);

		expect(branches).toEqual([
			[second, third],
			[alpha, beta]
		]);
	});

	it('should gather branches in forward direction from two way link', () => {
		const branches = gatherBranches(beta, alpha);

		expect(branches).toEqual([
			[fourth, third],
			[second, third]
		]);
	});

	it('should gather branches in forward direction from one way link', () => {
		const branches = gatherBranches(other, second);

		expect(branches).toEqual([
			[fourth, third],
			[second, third],
			[alpha, beta]
		]);
	});

	it('should gather branches in forward direction at the end', () => {
		const branches = gatherBranches(fourth, third);
		expect(branches).toEqual([]);
	});

	it('should gather branches in backward direction at the beginning', () => {
		const branches = gatherBranches(first, second);
		expect(branches).toEqual([]);
	});
});
