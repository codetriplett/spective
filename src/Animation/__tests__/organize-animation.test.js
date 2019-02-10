import { organizeAnimation } from '../organize-animation';

describe('organize-animation', () => {
	it('should break properties that are followed by a duration', () => {
		const fn = () => {};
		const actual = organizeAnimation({ a: 1 }, 200, { b: 2 }, fn);

		expect(actual).toEqual([
			[{ a: 1}, 200],
			[{ b: 2 }, fn]
		]);
	});

	it('should organize properties that are not followed by a duration', () => {
		const fn = () => {};
		const actual = organizeAnimation({ a: 1 }, { b: 2 }, fn);

		expect(actual).toEqual([
			[{ a: 1}],
			[{ b: 2 }, fn]
		]);
	});
});
