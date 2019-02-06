import { organizeAnimations } from '../organize-animations';

describe('organize-animations', () => {
	it('should break properties that are followed by a duration', () => {
		const callback = () => {};
		const fn = () => {};
		const actual = organizeAnimations({ a: 1 }, 200, callback, { b: 2 }, fn);

		expect(actual).toEqual([
			[{ a: 1}, 200, callback],
			[{ b: 2 }, fn]
		])
	});

	it('should organize properties that are not followed by a duration', () => {
		const callback = () => {};
		const fn = () => {};
		const actual = organizeAnimations({ a: 1 }, { b: 2 }, fn, callback);

		expect(actual).toEqual([
			[{ a: 1}],
			[{ b: 2 }, fn, callback]
		])
	});
});
