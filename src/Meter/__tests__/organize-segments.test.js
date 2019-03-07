import { organizeSegments } from '../organize-segments';

describe('organize-segments', () => {
	it('should organize with no actions', () => {
		const actual = organizeSegments();

		expect(actual).toEqual([
			{
				lowerValue: 0,
				upperValue: 1
			}
		]);
	});

	it('should organize with no actions and custom range', () => {
		const actual = organizeSegments(2);

		expect(actual).toEqual([
			{
				lowerValue: 0,
				upperValue: 2
			}
		]);
	});

	it('should organize single action', () => {
		const callback = () => {};
		const actual = organizeSegments(callback);

		expect(actual).toEqual([
			{
				lowerValue: 0,
				upperValue: 1,
				upperCallback: callback
			}
		]);
	});

	it('should organize single action with custom range', () => {
		const callback = () => {};
		const actual = organizeSegments(2, callback);

		expect(actual).toEqual([
			{
				lowerValue: 0,
				upperValue: 2,
				upperCallback: callback
			}
		]);
	});

	it('should organize pair of actions', () => {
		const first = () => {};
		const second = () => {};
		const actual = organizeSegments(first, second);

		expect(actual).toEqual([
			{
				lowerValue: 0,
				upperValue: 0,
				upperCallback: first
			}, {
				lowerValue: 0,
				lowerCallback: first,
				upperValue: 1,
				upperCallback: second
			}
		]);
	});

	it('should organize pair of actions with custom range', () => {
		const first = () => {};
		const second = () => {};
		const actual = organizeSegments(first, 2, second);

		expect(actual).toEqual([
			{
				lowerValue: 0,
				upperValue: 0,
				upperCallback: first
			}, {
				lowerValue: 0,
				lowerCallback: first,
				upperValue: 2,
				upperCallback: second
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
				lowerValue: 0,
				upperValue: 0,
				upperCallback: first
			}, {
				lowerValue: 0,
				lowerCallback: first,
				upperValue: 2,
				upperCallback: second
			}, {
				lowerValue: 2,
				lowerCallback: second,
				upperValue: 3,
				upperCallback: third
			}
		]);
	});
});
