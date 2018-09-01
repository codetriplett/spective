import { updateProperties } from '../update-properties';
import { calculateMatrix } from '../calculate-matrix';
import { createInstance } from '../create-instance';

jest.mock('../update-properties', () => ({ updateProperties: jest.fn() }));
jest.mock('../calculate-matrix', () => ({ calculateMatrix: jest.fn() }));

describe('create-instance', () => {
	let state;
	let asset;
	let options;

	beforeEach(() => {
		updateProperties.mockClear();
		calculateMatrix.mockClear();

		updateProperties.mockReturnValue(['mockUpdateProperties']);
		calculateMatrix.mockReturnValue('mockCalculateMatrix');

		state = {};
		asset = { instances: [], color: 'mockColor' };
		options = { key: 'initial' };
	});

	it('should create instance', () => {
		const actual = createInstance(state, asset, options);
		const instance = asset.instances[0];

		expect(typeof actual).toBe('function');

		expect(updateProperties.mock.calls).toEqual([
			[instance],
			[instance, options]
		]);

		expect(instance).toEqual({ matrix: 'mockCalculateMatrix' });
	});

	it('should update instance', () => {
		const updates = { key: 'updates' };
		const actual = createInstance(state, asset, options);
		const instance = asset.instances[0];

		updateProperties.mockClear();
		actual(updates);

		expect(typeof actual).toBe('function');
		expect(updateProperties).toHaveBeenCalledWith(instance, updates);
		expect(instance.matrix).toBe('mockCalculateMatrix');
	});

	it('should update instance with multiple property objects', () => {
		const updates = { key: 'updates' };
		const actual = createInstance(state, asset, options);
		const instance = asset.instances[0];

		updateProperties.mockClear();
		calculateMatrix.mockClear();
		actual(updates, { position: [3, 6, 9] });

		expect(typeof actual).toBe('function');
		expect(updateProperties).toHaveBeenCalledWith(instance, updates, { position: [3, 6, 9] });
		expect(calculateMatrix).toHaveBeenCalledWith(instance, 'mockUpdateProperties');
		expect(instance.matrix).toBe('mockCalculateMatrix');
	});

	it('should render if asset has been loaded', () => {
		createInstance(state, asset, options);
		expect(state.needsRender).toBeTruthy();
	});

	it('should render if asset has been loaded', () => {
		delete asset.color;
		createInstance(state, asset, options);
		
		expect(state.needsRender).toBeFalsy();
	});

	it('should delete instance', () => {
		const actual = createInstance(state, asset, options);
		actual();

		expect(asset.instances).toHaveLength(0);
	});
});
