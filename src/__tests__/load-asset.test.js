import { parseFile } from '../parse-file';
import { loadAsset } from '../load-asset';

jest.mock('../parse-file', () => ({ parseFile: jest.fn() }));

describe('load-asset', () => {
	const render = jest.fn();
	let geometries;
	let originalGeometries;
	let context;
	let fileLoad;
	let fileError;
	let imageLoad;
	let imageError;

	beforeEach(() => {
		fileLoad = undefined;
		fileError = undefined;
		imageLoad = undefined;
		imageError = undefined;

		window.XMLHttpRequest.prototype.send = jest.fn().mockImplementation(function () {
			fileLoad = () => {
				Object.defineProperty(window.XMLHttpRequest.prototype, 'status', { 
					get: () => 200
				});
		
				Object.defineProperty(window.XMLHttpRequest.prototype, 'responseText', { 
					get: () => 'mockResponseText'
				});

				this.onload();
			};

			fileError = () => {
				Object.defineProperty(window.XMLHttpRequest.prototype, 'status', { 
					get: () => 404
				});
		
				Object.defineProperty(window.XMLHttpRequest.prototype, 'responseText', { 
					get: () => undefined
				});
				
				this.onload();
			};
		});
		
		window.Image = class Image {
			addEventListener (type, callback) {
				if (type === 'load') {
					imageLoad = callback;
				} else if (type === 'error') {
					imageError = callback;
				}
			}
		};

		geometries = {
			firstGeometry: {
				assets: {
					firstAsset: { instances: [] }
				}
			}
		};

		parseFile.mockClear().mockImplementation(geometry => geometry.vertices = 'mockVertices');
		render.mockClear();
		context = { render, geometries };
		originalGeometries = JSON.parse(JSON.stringify(geometries));
	});

	it('should use an existing asset', () => {
		const actual = loadAsset.call(context, 'firstGeometry', 'firstAsset');

		expect(geometries).toEqual(originalGeometries);
		expect(actual).toEqual(geometries.firstGeometry.assets.firstAsset);
		expect(render).not.toHaveBeenCalled();
	});
	
	it('should create an asset using hexadecimal', () => {
		const actual = loadAsset.call(context, 'firstGeometry', '#fff');

		expect(geometries).toEqual({
			firstGeometry: {
				assets: {
					...originalGeometries.firstGeometry.assets,
					'#fff': {
						image: new Uint8Array([255, 255, 255, 255]),
						instances: []
					}
				}
			}
		});

		expect(actual).toEqual(geometries.firstGeometry.assets['#fff']);
		expect(render).not.toHaveBeenCalled();
	});

	it('should create an asset using a full length hexadecimal', () => {
		const actual = loadAsset.call(context, 'firstGeometry', '#ffffff');

		expect(geometries).toEqual({
			firstGeometry: {
				assets: {
					...originalGeometries.firstGeometry.assets,
					'#ffffff': {
						image: new Uint8Array([255, 255, 255, 255]),
						instances: []
					}
				}
			}
		});

		expect(actual).toEqual(geometries.firstGeometry.assets['#ffffff']);
		expect(render).not.toHaveBeenCalled();
	});

	it('should load an asset using an existing geometry', () => {
		const actual = loadAsset.call(context, 'firstGeometry', 'secondAsset');

		expect(geometries).toEqual({
			firstGeometry: {
				assets: {
					...originalGeometries.firstGeometry.assets,
					secondAsset: {
						instances: []
					}
				}
			}
		});

		expect(actual).toEqual(geometries.firstGeometry.assets.secondAsset);

		imageLoad();

		expect(geometries).toEqual({
			firstGeometry: {
				assets: {
					...originalGeometries.firstGeometry.assets,
					secondAsset: {
						image: { src: 'secondAsset' },
						instances: []
					}
				}
			}
		});

		expect(render).toHaveBeenCalledTimes(1);
	});

	it('should handle error with loading asset', () => {
		const actual = loadAsset.call(context, 'firstGeometry', 'secondAsset');

		expect(geometries).toEqual({
			firstGeometry: {
				assets: {
					...originalGeometries.firstGeometry.assets,
					secondAsset: {
						instances: []
					}
				}
			}
		});

		expect(actual).toEqual(geometries.firstGeometry.assets.secondAsset);

		imageError();

		expect(geometries).toEqual(originalGeometries);
		expect(render).not.toHaveBeenCalled();
	});

	it('should load an asset using a new geometry', () => {
		const actual = loadAsset.call(context, 'secondGeometry', 'firstAsset');

		expect(geometries).toEqual({
			...originalGeometries,
			secondGeometry: {
				assets: {
					firstAsset: {
						instances: []
					}
				}
			}
		});

		expect(actual).toEqual(geometries.secondGeometry.assets.firstAsset);

		fileLoad();
		imageLoad();

		expect(geometries).toEqual({
			...originalGeometries,
			secondGeometry: {
				vertices: 'mockVertices',
				assets: {
					firstAsset: {
						image: { src: 'firstAsset' },
						instances: []
					}
				}
			}
		});

		expect(render).toHaveBeenCalledTimes(2);
	});

	it('should handle error with loading geometry', () => {
		const actual = loadAsset.call(context, 'secondGeometry', 'firstAsset');

		expect(geometries).toEqual({
			...originalGeometries,
			secondGeometry: {
				assets: {
					firstAsset: {
						instances: []
					}
				}
			}
		});

		expect(actual).toEqual(geometries.secondGeometry.assets.firstAsset);

		fileError();
		imageLoad();

		expect(geometries).toEqual(originalGeometries);
		expect(render).toHaveBeenCalledTimes(1);
	});
});
