import { calculateMatrix } from '../calculate-matrix';
import { createInstance } from '../create-instance';

jest.mock('../calculate-matrix', () => ({ calculateMatrix: jest.fn() }));

describe('create-instance', () => {
	let state;
	let asset;
	let options;

	beforeEach(() => {
		calculateMatrix.mockClear();

		state = {};
		asset = { instances: [], image: 'mockImage' };
		options = { key: 'initial' };
	});

	it('should create instance', () => {
		const actual = createInstance(state, asset, options);

		expect(typeof actual).toBe('function');
		expect(asset.instances).toHaveLength(1);
		expect(calculateMatrix).toHaveBeenCalledWith({ key: 'initial' });
	});

	it('should update instance properties', () => {
		const updates = { key: 'updates' };
		const actual = createInstance(state, asset, options);

		actual(updates);

		expect(typeof actual).toBe('function');
		expect(calculateMatrix).toHaveBeenCalledWith({ key: 'initial' });
	});

	it('should update instance with multiple property objects', () => {
		const updates = { key: 'updates' };
		const actual = createInstance(state, asset, options);

		calculateMatrix.mockClear();
		actual(updates, { position: [3, 6, 9] });

		expect(typeof actual).toBe('function');
		expect(calculateMatrix).toHaveBeenCalledWith({ key: 'updates' }, { position: [3, 6, 9] });
		expect(state.useLight).toBeFalsy();
	});

	it('should render if asset has been loaded', () => {
		createInstance(state, asset, options);
		expect(state.needsRender).toBeTruthy();
	});

	it('should render if asset has been loaded', () => {
		delete asset.image;
		createInstance(state, asset, options);
		
		expect(state.needsRender).toBeFalsy();
	});

	it('should delete instance', () => {
		const actual = createInstance(state, asset, options);
		actual();

		expect(asset.instances).toHaveLength(0);
	});
});
