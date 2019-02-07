import { Animation } from '../Animation';

describe('Animation', () => {
	describe('constructor', () => {
		const iterate = jest.fn();

		beforeEach(() => {
			Animation.prototype.iterate = iterate;
		});

		it('should create an animation without an iterator', () => {
			const actual = new Animation({ update: 3, add: 4 });

			expect(iterate).toHaveBeenCalled();

			expect(actual).toEqual({
				changes: { update: 3, add: 4 }
			});
		});

		it('should create an animation with a basic iterator', () => {
			const actual = new Animation({ update: 3, add: 4 }, 200);

			expect(actual).toEqual({
				changes: { update: 3, add: 4 },
				iterator: 200
			});
		});

		it('should create an animation with a custom iterator', () => {
			const iterator = jest.fn();
			const actual = new Animation({ update: 3, add: 4 }, iterator);

			expect(actual).toEqual({
				changes: { update: 3, add: 4 },
				iterator
			});
		});
	});

	describe('iterate', () => {
		const iterate = Animation.prototype.iterate;
		let context;

		beforeEach(() => {
			context = {
				changes: { update: 3, add: 4 }
			};
		});

		it('should iterate with a basic iterator', () => {
			context.iterator = 200;
			let actual = iterate.call(context);

			expect(actual).toBe(200);

			expect(context).toEqual({
				changes: { update: 3, add: 4 },
				iterator: 200,
				iteration: 0,
				duration: 200
			});

			actual = iterate.call(context);

			expect(actual).toBeUndefined();

			expect(context).toEqual({
				changes: { update: 3, add: 4 },
				iterator: 200
			});
		});

		it('should iterate with a custom iterator', () => {
			const iterator = jest.fn().mockReturnValue(200);
			context.iterator = iterator;
			let actual = iterate.call(context);

			expect(actual).toBe(200);

			expect(context).toEqual({
				changes: { update: 3, add: 4 },
				iterator,
				iteration: 0,
				duration: 200
			});

			iterator.mockReturnValue();
			actual = iterate.call(context);

			expect(actual).toBeUndefined();

			expect(context).toEqual({
				changes: { update: 3, add: 4 },
				iterator
			});
		});
	});

	describe('interpolator', () => {
		const interpolate = Animation.prototype.interpolate;
		let context;
		let properties;

		beforeEach(() => {
			context = {
				changes: { update: 3, add: 4 },
				iterator: 200,
			};

			properties = { keep: 1, update: 2 };
		});

		it('should return properties for start of animation', () => {
			const actual = interpolate.call(context, properties, 0);

			expect(actual).toEqual({ keep: 1, update: 2, add: 0 });
			expect(properties).toEqual({ keep: 1, update: 2 });
		});

		it('should return properties for middle of absolute animation', () => {
			const actual = interpolate.call(context, properties, 0.5);

			expect(actual).toEqual({ keep: 1, update: 2.5, add: 2 });
		});

		it('should return properties for end of absolute animation', () => {
			const actual = interpolate.call(context, properties, 1);

			expect(actual).toEqual({ keep: 1, update: 3, add: 4 });
		});

		it('should return properties for middle of relative animation', () => {
			context.iterator = () => {};
			const actual = interpolate.call(context, properties, 0.5);

			expect(actual).toEqual({ keep: 1, update: 3.5, add: 2 });
		});

		it('should return properties for end of relative animation', () => {
			context.iterator = () => {};
			const actual = interpolate.call(context, properties, 1);

			expect(actual).toEqual({ keep: 1, update: 5, add: 4 });
		});
	});
});
