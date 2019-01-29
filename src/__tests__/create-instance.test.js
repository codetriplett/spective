import { loadGeometry } from '../load-geometry';
import { loadAsset } from '../load-asset';
import { updateItem } from '../update-item';
import { createInstance } from '../create-instance';

jest.mock('../load-geometry', () => ({ loadGeometry: jest.fn() }));
jest.mock('../load-asset', () => ({ loadAsset: jest.fn() }));
jest.mock('../update-item', () => ({ updateItem: jest.fn() }));

describe('create-instance', () => {
	let instances;

	beforeEach(() => {
		instances = [];

		loadGeometry.mockClear().mockReturnValue({ assets: 'mockAssets' });
		loadAsset.mockClear().mockReturnValue({ instances });
		updateItem.mockClear().mockImplementation((a, instance) => instance.matrix = 'mockMatrix');
	});

	it('should create an instance', () => {
		const actual = createInstance('mockRender', 'mockGeometries', 'geometrySource', 'assetSource', 0, 1);

		expect(loadGeometry).toHaveBeenCalledWith('mockRender', 'mockGeometries', 'geometrySource');
		expect(loadAsset).toHaveBeenCalledWith('mockRender', 'mockAssets', 'assetSource');
		expect(instances).toEqual([{ matrix: 'mockMatrix' }]);
		expect(updateItem).toHaveBeenCalledWith('mockRender', { matrix: 'mockMatrix' }, 0, 1);
		expect(actual).toEqual(expect.any(Function));
	});

	it('should accept updates to the instance', () => {
		const actual = createInstance('mockRender', 'mockGeometries', 'geometrySource', 'assetSource');
		updateItem.mockClear();
		actual(0, 1);

		expect(updateItem).toHaveBeenCalledWith('mockRender', { matrix: 'mockMatrix' }, 0, 1);
	});

	it('should use default asset source if one is not provided', () => {
		createInstance('mockRender', 'mockGeometries', 'geometrySource', 0, 1);
		expect(loadAsset).toHaveBeenCalledWith('mockRender', 'mockAssets', '#fff');
	});
});
