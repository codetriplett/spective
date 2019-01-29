import { loadAsset } from '../load-asset';

describe('load-asset', () => {
	const callback = jest.fn();
	let load;
	let error;
	let assets;

	beforeEach(() => {
		load = undefined;
		error = undefined;
		
		window.Image = class Image {
			addEventListener (type, callback) {
				if (type === 'load') {
					load = callback;
				} else if (type === 'error') {
					error = callback;
				}
			}
		};

		callback.mockClear();
		assets = {};
	});

	it('should create an asset using hexadecimal', () => {
		const actual = loadAsset(assets, '#fff', callback);

		const asset = {
			image: new Uint8Array([255, 255, 255, 255]),
			instances: []
		};

		expect(assets).toEqual({ '#fff': asset });
		expect(actual).toBeUndefined();
		expect(callback).toHaveBeenCalledWith(asset);
	});

	it('should create an asset using an image', () => {
		const actual = loadAsset(assets, 'source', callback);

		const asset = {
			image: { src: 'source' },
			instances: []
		};

		expect(actual).toBe(true);
		expect(callback).not.toHaveBeenCalled();
		expect(assets).toEqual({});

		callback.mockClear();
		load();

		expect(callback).toHaveBeenCalledWith(asset);
		expect(assets).toEqual({ source: asset });
	});

	it('should handle a failed image load', () => {
		const actual = loadAsset(assets, 'source', callback);

		expect(actual).toBe(true);
		expect(callback).not.toHaveBeenCalled();
		expect(assets).toEqual({});

		callback.mockClear();
		error();

		expect(callback).toHaveBeenCalledWith({});
		expect(assets).toEqual({});
	});

	it('should use an existing asset', () => {
		assets = { source: 'mockAsset' };
		const actual = loadAsset(assets, 'source', callback);

		expect(actual).toBeUndefined();
		expect(callback).toHaveBeenCalledWith('mockAsset');
		expect(assets).toEqual({ source: 'mockAsset' });
	});
});
