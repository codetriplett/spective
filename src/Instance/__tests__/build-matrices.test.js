import { buildMatrices } from '../build-matrices';

describe('build-matrices', () => {
	let properties;

	beforeEach(() => {
		properties = {
			positionX: 1.1,
			positionY: 2.2,
			positionZ: 3.3,
			headingX: 4.4,
			headingY: 5.5,
			headingZ: 6.6,
			offsetX: 7.7,
			offsetY: 8.8,
			offsetZ: 9.9,
			angleX: 10.01,
			angleY: 11.11,
			angleZ: 12.21,
			scaleX: 13.31,
			scaleY: 14.41,
			scaleZ: 15.51
		};
	});

	it('should prepare matrices', () => {
		const actual = buildMatrices(properties);

		expect(actual).toEqual([
			[
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				1.1, 2.2, 3.3, 1
			], [
				0.70866977429126, 0, 0.7055403255703919, 0,
				0, 1, 0, 0,
				-0.7055403255703919, 0, 0.70866977429126, 0,
				0, 0, 0, 1
			], [
				1, 0, 0, 0,
				0, -0.30733286997841935, -0.9516020738895161, 0,
				0, 0.9516020738895161, -0.30733286997841935, 0,
				0, 0, 0, 1
			], [
				0.9502325919585296, 0.31154136351337786, 0, 0,
				-0.31154136351337786, 0.9502325919585296, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				7.7, 8.8, 9.9, 1
			], [
				0.1141761752318889, 0, 0.9934605180929019, 0,
				0, 1, 0, 0,
				-0.9934605180929019, 0, 0.1141761752318889, 0,
				0, 0, 0, 1
			], [
				1, 0, 0, 0,
				0, -0.8335894554104488, -0.5523844855067088, 0,
				0, 0.5523844855067088, -0.8335894554104488, 0,
				0, 0, 0, 1
			], [
				0.9371691958992333, -0.34887519008606005, 0, 0,
				0.34887519008606005, 0.9371691958992333, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], [
				13.31, 0, 0, 0,
				0, 14.41, 0, 0,
				0, 0, 15.51, 0,
				0, 0, 0, 1
			]
		]);
	});

	it('should prepare inverse matrices', () => {
		const actual = buildMatrices(properties, true);

		expect(actual).toEqual([
			[
				0.07513148009015777, 0, 0, 0,
				0, 0.06939625260235947, 0, 0,
				0, 0, 0.06447453255963895, 0,
				0, 0, 0, 1
			], [
				0.9371691958992333, 0.34887519008606005, 0, 0,
				-0.34887519008606005, 0.9371691958992333, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], [
				1, 0, 0, 0,
				0, -0.8335894554104488, 0.5523844855067088, 0,
				0, -0.5523844855067088, -0.8335894554104488, 0,
				0, 0, 0, 1
			], [
				0.1141761752318889, 0, -0.9934605180929019, 0,
				0, 1, 0, 0,
				0.9934605180929019, 0, 0.1141761752318889, 0,
				0, 0, 0, 1
			], [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				-7.7, -8.8, -9.9, 1
			], [
				0.9502325919585296, -0.31154136351337786, 0, 0,
				0.31154136351337786, 0.9502325919585296, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], [
				1, 0, 0, 0,
				0, -0.30733286997841935, 0.9516020738895161, 0,
				0, -0.9516020738895161, -0.30733286997841935, 0,
				0, 0, 0, 1
			], [
				0.70866977429126, 0, -0.7055403255703919, 0,
				0, 1, 0, 0,
				0.7055403255703919, 0, 0.70866977429126, 0,
				0, 0, 0, 1
			], [
				1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				-1.1, -2.2, -3.3, 1
			]
		]);
	});

	it('should prepare reduced matrices', () => {
		const actual = buildMatrices(properties, false, true);

		expect(actual).toEqual([
			[
				0.70866977429126, 0, 0.7055403255703919, 0,
				0, 1, 0, 0,
				-0.7055403255703919, 0, 0.70866977429126, 0,
				0, 0, 0, 1
			], [
				1, 0, 0, 0,
				0, -0.30733286997841935, -0.9516020738895161, 0,
				0, 0.9516020738895161, -0.30733286997841935, 0,
				0, 0, 0, 1
			], [
				0.9502325919585296, 0.31154136351337786, 0, 0,
				-0.31154136351337786, 0.9502325919585296, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], [
				0.1141761752318889, 0, 0.9934605180929019, 0,
				0, 1, 0, 0,
				-0.9934605180929019, 0, 0.1141761752318889, 0,
				0, 0, 0, 1
			], [
				1, 0, 0, 0,
				0, -0.8335894554104488, -0.5523844855067088, 0,
				0, 0.5523844855067088, -0.8335894554104488, 0,
				0, 0, 0, 1
			], [
				0.9371691958992333, -0.34887519008606005, 0, 0,
				0.34887519008606005, 0.9371691958992333, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			]
		]);
	});

	it('should prepare inverted and reduced matrices', () => {
		const actual = buildMatrices(properties, true, true);

		expect(actual).toEqual([
			[
				0.9371691958992333, 0.34887519008606005, 0, 0,
				-0.34887519008606005, 0.9371691958992333, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], [
				1, 0, 0, 0,
				0, -0.8335894554104488, 0.5523844855067088, 0,
				0, -0.5523844855067088, -0.8335894554104488, 0,
				0, 0, 0, 1
			], [
				0.1141761752318889, 0, -0.9934605180929019, 0,
				0, 1, 0, 0,
				0.9934605180929019, 0, 0.1141761752318889, 0,
				0, 0, 0, 1
			], [
				0.9502325919585296, -0.31154136351337786, 0, 0,
				0.31154136351337786, 0.9502325919585296, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			], [
				1, 0, 0, 0,
				0, -0.30733286997841935, 0.9516020738895161, 0,
				0, -0.9516020738895161, -0.30733286997841935, 0,
				0, 0, 0, 1
			], [
				0.70866977429126, 0, -0.7055403255703919, 0,
				0, 1, 0, 0,
				0.7055403255703919, 0, 0.70866977429126, 0,
				0, 0, 0, 1
			]
		]);
	});
});
