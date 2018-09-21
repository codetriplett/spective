import { calculateMatrix } from '../calculate-matrix';
import { updateProperties } from '../update-properties';

jest.mock('../calculate-matrix', () => ({ calculateMatrix: jest.fn() }));

describe('update-properties', () => {
	let state;
	let properties;
	let propertyArray;

	beforeEach(() => {
		calculateMatrix.mockClear();
		calculateMatrix.mockReturnValue(['mockCalculateMatrix']);

		state = {};
		propertyArray = [{ key: 'initial' }, { key: 'additional' }];

		properties = {
			intensity: 2,
			color: [0.2, 0.4, 0.6],
			light: [0.4, 0.8, 1.2],
			matrix: ['mockCalculateMatrix']
		};
	});

	it('should create property object given all inputs', () => {
		properties = {};
		updateProperties(state, properties, 2, [51, 102, 153], ...propertyArray);
		
		expect(state.useLight).toBeTruthy();
		expect(calculateMatrix).toHaveBeenCalledWith(...propertyArray);

		expect(properties).toEqual({
			intensity: 2,
			color: [0.2, 0.4, 0.6],
			light: [0.4, 0.8, 1.2],
			matrix: ['mockCalculateMatrix']
		});
	});

	it('should create property object given only intensity', () => {
		properties = {};
		updateProperties(state, properties, 2);
		
		expect(state.useLight).toBeTruthy();
		expect(calculateMatrix).toHaveBeenCalledWith();

		expect(properties).toEqual({
			intensity: 2,
			light: [2, 2, 2],
			matrix: ['mockCalculateMatrix']
		});
	});

	it('should create property object given only color', () => {
		properties = {};
		updateProperties(state, properties, [51, 102, 153]);
		
		expect(state.useLight).toBeTruthy();
		expect(calculateMatrix).toHaveBeenCalledWith();

		expect(properties).toEqual({
			color: [0.2, 0.4, 0.6],
			light: [0, 0, 0],
			matrix: ['mockCalculateMatrix']
		});
	});

	it('should create property object given only positioning properties', () => {
		properties = {};
		updateProperties(state, properties, ...propertyArray);
		
		expect(state.useLight).toBeFalsy();
		expect(calculateMatrix).toHaveBeenCalledWith(...propertyArray);

		expect(properties).toEqual({
			matrix: ['mockCalculateMatrix']
		});
	});

	it('should update intensity', () => {
		updateProperties(state, properties, 3);

		expect(properties).toMatchObject({
			intensity: 3,
			color: [0.2, 0.4, 0.6],
			light: [0.6000000000000001, 1.2000000000000002, 1.7999999999999998],
			matrix: ['mockCalculateMatrix']
		});
	});

	it('should update color', () => {
		updateProperties(state, properties, [204, 153, 102]);

		expect(properties).toMatchObject({
			intensity: 2,
			color: [0.8, 0.6, 0.4],
			light: [1.6, 1.2, 0.8],
			matrix: ['mockCalculateMatrix']
		});
	});

	it('should update matrix', () => {
		updateProperties(state, properties, ...propertyArray);

		expect(calculateMatrix).toHaveBeenCalledWith(...propertyArray);

		expect(properties).toMatchObject({
			intensity: 2,
			color: [0.2, 0.4, 0.6],
			light: [0.4, 0.8, 1.2],
			matrix: ['mockCalculateMatrix']
		});
	});

	it('should work with inverted positioning properties', () => {
		updateProperties(state, properties, true, 2, [51, 102, 153], ...propertyArray);
		expect(calculateMatrix).toHaveBeenCalledWith(true, ...propertyArray);
	});
});
