import { organizeSegments } from '../organize-segments';

describe('organize-segments', () => {
	it('should organize with no actions', () => {
		const actual = organizeSegments();

		expect(actual).toEqual([
			{ threshold: 1 }
		]);
	});

	it('should organize with no actions and custom range', () => {
		const actual = organizeSegments(2);

		expect(actual).toEqual([
			{ threshold: 2 }
		]);
	});

	it('should organize single action', () => {
		const callback = () => {};
		const actual = organizeSegments(callback);

		expect(actual).toEqual([
			{
				callback,
				threshold: 1
			}
		]);
	});

	it('should organize single action with custom range', () => {
		const callback = () => {};
		const actual = organizeSegments(2, callback);

		expect(actual).toEqual([
			{
				callback,
				threshold: 2
			}
		]);
	});

	it('should organize pair of actions', () => {
		const first = () => {};
		const second = () => {};
		const actual = organizeSegments(first, second);

		expect(actual).toEqual([
			{
				callback: first,
				threshold: 0
			}, {
				callback: second,
				threshold: 1
			}
		]);
	});

	it('should organize pair of actions with custom range', () => {
		const first = () => {};
		const second = () => {};
		const actual = organizeSegments(first, 2, second);

		expect(actual).toEqual([
			{
				callback: first,
				threshold: 0
			}, {
				callback: second,
				threshold: 2
			}
		]);
	});

	it('should organize more than two actions', () => {
		const first = () => {};
		const second = () => {};
		const third = () => {};
		const actual = organizeSegments(first, 2, second, third);

		expect(actual).toEqual([
			{
				callback: first,
				threshold: 0
			}, {
				callback: second,
				threshold: 2
			}, {
				callback: third,
				threshold: 3
			}
		]);
	});
});
