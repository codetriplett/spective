import { organizeActions } from '../organize-actions';

describe('organize-actions', () => {
	const schedule = jest.fn();
	const iterate = jest.fn();

	beforeEach(() => {
		schedule.mockClear().mockReturnValue('schedule');
		iterate.mockClear().mockReturnValue('iterate');
	});

	it('should use provided actions', () => {
		const actual = organizeActions(schedule, 'item', iterate);

		expect(actual[0]()).toBe('schedule');
		expect(actual[1]).toBe('item');
		expect(actual[2]()).toBe('iterate');
	});

	it('should use default schedule action', () => {
		const actual = organizeActions('item', iterate)[0];

		expect(actual(0.5)).toBe(0);
		expect(actual(0.5, 'item')).toBe(0);
		expect(actual(0.5, 500)).toBe(250);
	});

	it('should use default item', () => {
		const actual = organizeActions(schedule)[1];
		expect(actual).toBe(0);
	});

	it('should use default iterate action', () => {
		const actual = organizeActions(schedule, 'item')[2];

		expect(actual(0.5)).toBeUndefined();
		expect(actual(0.5, 1)).toBe(2);
		expect(actual(-0.5, 1)).toBe(0);
	});

	it('should use default iterate action with a provided array', () => {
		const actual = organizeActions(schedule, [1, 2, 3]);

		expect(actual[1]).toBe(1);
		expect(actual[2](0.5)).toBe(2);
		expect(actual[2](0.5)).toBe(3);
		expect(actual[2](-0.5)).toBe(2);
		expect(actual[2](-0.5)).toBe(1);
	});
});
