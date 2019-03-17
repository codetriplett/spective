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
				lowerCallback: first,
				lowerValue: 0,
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
				lowerCallback: first,
				lowerValue: 0,
				upperValue: 2,
				upperCallback: second
			}
		]);
	});

	it('should organize more than two actions', () => {
		const first = () => {};
		const second = () => {};
		const third = () => {};
		const actual = organizeSegments(first, second, third);

		expect(actual).toEqual([
			{
				lowerCallback: first,
				lowerValue: 0,
				upperValue: 0.5,
				upperCallback: second
			}, {
				lowerCallback: second,
				lowerValue: 0.5,
				upperValue: 1,
				upperCallback: third
			}
		]);
	});

	it('should allow mix of default and custom ranges', () => {
		const first = () => {};
		const second = () => {};
		const third = () => {};
		const fourth = () => {};
		const actual = organizeSegments(first, second, 0.5, third, fourth);

		expect(actual).toEqual([
			{
				lowerCallback: first,
				lowerValue: 0,
				upperValue: 0.25,
				upperCallback: second
			}, {
				lowerCallback: second,
				lowerValue: 0.25,
				upperValue: 0.75,
				upperCallback: third
			}, {
				lowerCallback: third,
				lowerValue: 0.75,
				upperValue: 1,
				upperCallback: fourth
			}
		]);
	});

	it('should allow mix of default and custom ranges with leading range', () => {
		const first = () => {};
		const second = () => {};
		const third = () => {};
		const actual = organizeSegments(1, first, second, 2, third);

		expect(actual).toEqual([
			{
				lowerValue: 0,
				upperValue: 1,
				upperCallback: first
			}, {
				lowerCallback: first,
				lowerValue: 1,
				upperValue: 2,
				upperCallback: second
			}, {
				lowerCallback: second,
				lowerValue: 2,
				upperValue: 4,
				upperCallback: third
			}
		]);
	});
});
