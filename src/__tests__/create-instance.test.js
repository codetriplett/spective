import { loadGeometry } from '../load-geometry';
import { loadAsset } from '../load-asset';
import { updateItem } from '../update-item';
import { createInstance } from '../create-instance';

jest.mock('../load-geometry', () => ({ loadGeometry: jest.fn() }));
jest.mock('../load-asset', () => ({ loadAsset: jest.fn() }));
jest.mock('../update-item', () => ({ updateItem: jest.fn() }));

describe('create-instance', () => {
	const render = jest.fn();
	let geometryCallback;
	let assetCallback;

	beforeEach(() => {
		geometryCallback = undefined;
		assetCallback = undefined;

		loadGeometry.mockClear().mockImplementation((a, b, callback) => {
			geometryCallback = callback;
			return true;
		});

		loadAsset.mockClear().mockImplementation((a, b, callback) => {
			assetCallback = callback;
			return true;
		});

		updateItem.mockClear().mockImplementation((a, instance) => instance.matrix = 'mockMatrix');
		render.mockClear();
	});

	it('should create an instance', () => {
		const actual = createInstance(render, 'mockGeometries', 'geometrySource', 'assetSource', 0, 1);

		expect(loadGeometry).toHaveBeenCalledWith('mockGeometries', 'geometrySource', expect.any(Function));

		geometryCallback({ assets: 'mockAssets' });
		expect(loadAsset).toHaveBeenCalledWith('mockAssets', 'assetSource', expect.any(Function));

		assetCallback({ instances: [] });
		expect(render).toHaveBeenCalled();

		expect(updateItem).toHaveBeenCalledWith(render, { matrix: 'mockMatrix' }, 0, 1);
		expect(actual).toEqual(expect.any(Function));
	});

	it('should accept updates to the instance', () => {
		const actual = createInstance(render, 'mockGeometries', 'geometrySource', 'assetSource');
		updateItem.mockClear();
		actual(0, 1);

		expect(updateItem).toHaveBeenCalledWith(render, { matrix: 'mockMatrix' }, 0, 1);
	});

	it('should not render on load when using an existing asset', () => {
		loadAsset.mockClear().mockImplementation((a, b, callback) => {
			assetCallback = callback;
		});

		const instances = [];

		createInstance(render, 'mockGeometries', 'geometrySource', 'assetSource');

		render.mockClear();
		geometryCallback({ assets: 'mockAssets' });
		assetCallback({ instances });

		expect(instances).toEqual([{ matrix: 'mockMatrix' }]);
		expect(render).not.toHaveBeenCalled();
	});
});
