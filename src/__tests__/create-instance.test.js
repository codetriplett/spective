import { loadGeometry } from '../load-geometry';
import { loadAsset } from '../load-asset';
import { updateItem } from '../update-item';
import { createInstance } from '../create-instance';

jest.mock('../load-geometry', () => ({ loadGeometry: jest.fn() }));
jest.mock('../load-asset', () => ({ loadAsset: jest.fn() }));
jest.mock('../update-item', () => ({ updateItem: jest.fn() }));

describe('create-instance', () => {
	let geometries;
	let assets;
	let instances;

	beforeEach(() => {
		instances = [];
		assets = { firstAsset: instances };
		geometries = { firstGeometry: assets };

		loadGeometry.mockClear().mockReturnValue({ assets });
		loadAsset.mockClear().mockReturnValue({ instances });
		updateItem.mockClear().mockImplementation((a, instance) => instance.matrix = 'mockMatrix');
	});

	it('should create an instance', () => {
		const actual = createInstance('mockRender', geometries, 'firstGeometry', 'firstAsset', 0, 1);

		expect(loadGeometry).toHaveBeenCalledWith('mockRender', geometries, 'firstGeometry');
		expect(loadAsset).toHaveBeenCalledWith('mockRender', assets, 'firstAsset');
		expect(instances).toEqual([{ matrix: 'mockMatrix' }]);
		expect(updateItem).toHaveBeenCalledWith('mockRender', { matrix: 'mockMatrix' }, 0, 1);
		expect(actual).toEqual(expect.any(Function));
	});

	it('should accept updates to the instance', () => {
		const actual = createInstance('mockRender', geometries, 'firstGeometry', 'firstAsset', 0, 1);
		updateItem.mockClear();
		actual(2, 3);

		expect(updateItem).toHaveBeenCalledWith('mockRender', { matrix: 'mockMatrix' }, 2, 3);
	});

	it('should use default asset source if one is not provided', () => {
		createInstance('mockRender', geometries, 'firstGeometry', 0, 1);
		expect(loadAsset).toHaveBeenCalledWith('mockRender', assets, '#fff');
	});

	it('should remove an instance', () => {
		instances.push('secondInstance');
		const actual = createInstance('mockRender', geometries, 'firstGeometry', 'firstAsset', 0, 1);
		actual();

		expect(geometries).toEqual({
			firstGeometry: {
				firstAsset: ['secondInstance']
			}
		});
	});

	it('should remove an asset', () => {
		assets['secondAsset'] = ['firstInstance'];
		const actual = createInstance('mockRender', geometries, 'firstGeometry', 'firstAsset', 0, 1);
		actual();

		expect(geometries).toEqual({
			firstGeometry: {
				secondAsset: ['firstInstance']
			}
		});
	});

	it('should remove a geometry', () => {
		geometries['secondGeometry'] = { firstAsset: ['firstInstance'] };
		const actual = createInstance('mockRender', geometries, 'firstGeometry', 'firstAsset', 0, 1);
		actual();

		expect(geometries).toEqual({
			secondGeometry: {
				firstAsset: ['firstInstance']
			}
		});
	});

	it('should not create an instance if no properties were provided', () => {
		const actual = createInstance('mockRender', geometries, 'firstGeometry', 'firstAsset');
		expect(actual).toBeUndefined();
	});
});
