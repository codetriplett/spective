import { updateItem } from '../update-item';
import { createInstance } from '../create-instance';

jest.mock('../update-item', () => ({ updateItem: jest.fn() }));

describe('create-instance', () => {
	const loadAsset = jest.fn();
	let geometries;
	let instances;
	let context;

	beforeEach(() => {
		instances = [];

		geometries = {
			firstGeometry: {
				assets: {
					firstAsset: { instances }
				}
			}
		};

		loadAsset.mockClear().mockReturnValue({ instances });
		updateItem.mockClear().mockImplementation(instance => instance.matrix = 'mockMatrix');
		context = { updateItem, loadAsset, geometries };
	});

	it('should create an instance', () => {
		const actual = createInstance.call(context, 'firstGeometry', 'firstAsset', 0, 1);

		expect(loadAsset).toHaveBeenCalledWith('firstGeometry', 'firstAsset');
		expect(instances).toEqual([{ matrix: 'mockMatrix' }]);
		expect(updateItem).toHaveBeenCalledWith({ matrix: 'mockMatrix' }, 0, 1);
		expect(actual).toEqual(expect.any(Function));
	});
	
	it('should create a child instance', () => {
		const instance = createInstance.call(context, 'firstGeometry', 'firstAsset', 0, 1);
		loadAsset.mockClear();
		updateItem.mockClear();
		const actual = instance('firstGeometry', 'firstAsset', 2, 3);
		
		expect(loadAsset).toHaveBeenCalledWith('firstGeometry', 'firstAsset');

		expect(instances).toEqual([
			{ matrix: 'mockMatrix', children: expect.any(Array) },
			{ matrix: 'mockMatrix', anchor: expect.any(Object) }
		]);

		expect(updateItem).toHaveBeenCalledWith({
			matrix: 'mockMatrix',
			anchor: expect.any(Object)
		}, 2, 3);
		
		expect(actual).toEqual(expect.any(Function));
	});

	it('should accept updates to the instance', () => {
		const actual = createInstance.call(context, 'firstGeometry', 'firstAsset', 0, 1);
		updateItem.mockClear();
		actual(2, 3);

		expect(updateItem).toHaveBeenCalledWith({ matrix: 'mockMatrix' }, 2, 3);
	});

	it('should use default asset source if one is not provided', () => {
		createInstance.call(context, 'firstGeometry', 0, 1);
		expect(loadAsset).toHaveBeenCalledWith('firstGeometry', '#fff');
	});

	it('should remove an instance', () => {
		instances.push('secondInstance');
		const actual = createInstance.call(context, 'firstGeometry', 'firstAsset', 0, 1);
		actual();

		expect(geometries).toEqual({
			firstGeometry: {
				assets: {
					firstAsset: {
						instances: ['secondInstance']
					}
				}
			}
		});
	});

	it('should remove an asset', () => {
		geometries.firstGeometry.assets['secondAsset'] = { instances: ['firstInstance'] };
		const actual = createInstance.call(context, 'firstGeometry', 'firstAsset', 0, 1);
		actual();

		expect(geometries).toEqual({
			firstGeometry: {
				assets: {
					secondAsset: {
						instances: ['firstInstance']
					}
				}
			}
		});
	});

	it('should remove a geometry', () => {
		geometries['secondGeometry'] = {
			assets: {
				firstAsset: {
					instances: ['firstInstance']
				}
			}
		};

		const actual = createInstance.call(context, 'firstGeometry', 'firstAsset', 0, 1);
		actual();

		expect(geometries).toEqual({
			secondGeometry: {
				assets: {
					firstAsset: {
						instances: ['firstInstance']
					}
				}
			}
		});
	});

	it('should not create an instance if no properties were provided', () => {
		const actual = createInstance.call(context, 'firstGeometry', 'firstAsset');
		expect(actual).toBeUndefined();
	});
});
