import { formatProperties } from '../format-properties';
import { organizeAnimation } from '../organize-animation';

jest.mock('../format-properties', () => ({ formatProperties: jest.fn() }));

describe('organize-animation', () => {
	beforeEach(() => {
		formatProperties.mockClear().mockReturnValue('properties');
	});

	it('should break properties that are followed by a duration', () => {
		const fn = () => {};
		const actual = organizeAnimation({ a: 1 }, 200, { b: 2 }, fn);

		expect(actual).toEqual([
			['properties', 200],
			['properties', fn]
		]);
	});

	it('should organize properties that are not followed by a duration', () => {
		const fn = () => {};
		const actual = organizeAnimation({ a: 1 }, { b: 2 }, fn);

		expect(actual).toEqual([
			['properties'],
			['properties', fn]
		]);
	});
});
