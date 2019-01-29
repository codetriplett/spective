import { loadAsset } from '../load-asset';

describe('load-asset', () => {
	const render = jest.fn();
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

		render.mockClear();
		assets = {};
	});

	it('should create an asset using hexadecimal', () => {
		const actual = loadAsset(render, assets, '#fff');
		const expected = { image: new Uint8Array([255, 255, 255, 255]), instances: [] };

		expect(assets).toEqual({ '#fff': expected });
		expect(actual).toEqual(expected);
		expect(render).not.toHaveBeenCalled();
	});

	it('should create an asset using a full length hexadecimal', () => {
		const actual = loadAsset(render, assets, '#ffffff');
		const expected = { image: new Uint8Array([255, 255, 255, 255]), instances: [] };

		expect(assets).toEqual({ '#ffffff': expected });
		expect(actual).toEqual(expected);
		expect(render).not.toHaveBeenCalled();
	});

	it('should create an asset using an image', () => {
		const actual = loadAsset(render, assets, 'source');

		expect(assets).toEqual({ source: { instances: [] } });
		expect(actual).toEqual({ instances: [] });

		load();
		expect(assets).toEqual({ source: { image: { src: 'source' }, instances: [] } });
		expect(render).toHaveBeenCalled();
	});

	it('should handle a failed image load', () => {
		const actual = loadAsset(render, assets, 'source');

		expect(assets).toEqual({ source: { instances: [] } });
		expect(actual).toEqual({ instances: [] });

		error();
		expect(assets).toEqual({});
		expect(render).not.toHaveBeenCalled();
	});

	it('should use an existing asset', () => {
		assets = { source: 'mockAsset' };
		const actual = loadAsset(render, assets, 'source');

		expect(assets).toEqual({ source: 'mockAsset' });
		expect(actual).toEqual('mockAsset');
		expect(render).not.toHaveBeenCalled();
	});
});
