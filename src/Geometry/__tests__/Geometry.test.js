import { generatePrimative } from '../generate-primative';
import { parseFile } from '../parse-file';
import { Asset } from '../../Asset/Asset';
import { Geometry } from '../Geometry';

jest.mock('../generate-primative', () => ({ generatePrimative: jest.fn() }));
jest.mock('../parse-file', () => ({ parseFile: jest.fn() }));
jest.mock('../../Asset/Asset', () => ({ Asset: jest.fn() }));

describe('Geometry', () => {
	const destroyInstance = jest.fn();
	const callback = jest.fn();
	let fileLoad;
	let fileError;

	beforeEach(() => {
		generatePrimative.mockClear().mockReturnValue({ vertices: 'primative', assets: {} });
		parseFile.mockClear().mockImplementation(input => ({ vertices: input }));
		callback.mockClear();
		fileLoad = undefined;
		fileError = undefined;
		
		Asset.mockClear().mockImplementation(function (source) {
			this.destroyInstance = destroyInstance;
			this.image = source;
			this.instances = [];
		});
		
		window.XMLHttpRequest.prototype.send = jest.fn().mockImplementation(function () {
			fileLoad = () => {
				Object.defineProperty(window.XMLHttpRequest.prototype, 'status', { 
					get: () => 200
				});
		
				Object.defineProperty(window.XMLHttpRequest.prototype, 'responseText', { 
					get: () => 'responseText'
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
	});
	
	it('should create a geometry', () => {
		const actual = new Geometry('source');

		expect(actual).toEqual({ assets: {} });
		fileLoad();
		expect(actual).toEqual({ vertices: 'responseText', assets: {} });
	});
	
	it('should handle failed file load', () => {
		const actual = new Geometry('source');

		expect(actual).toEqual({ assets: {} });
		fileError();
		expect(actual).toEqual({ assets: {} });
	});
	
	it('should create a geometry with a callback', () => {
		new Geometry('source', callback);

		expect(callback).not.toHaveBeenCalled();
		fileLoad();
		expect(callback).toHaveBeenCalledWith('source');
	});
	
	it('should handle failed file load with a callback', () => {
		new Geometry('source', callback);

		expect(callback).not.toHaveBeenCalled();
		fileError();
		expect(callback).toHaveBeenCalledWith('source');
	});
	
	it('should create a primative geometry', () => {
		const actual = new Geometry('1 0 -1');
		
		expect(generatePrimative).toHaveBeenCalledWith(1, 0, -1);
		expect(fileLoad).toBeUndefined();
		expect(fileError).toBeUndefined();
		expect(actual).toEqual({ vertices: 'primative', assets: {} });
	});

	it('should create an Asset', () => {
		const geometry = new Geometry('source');
		geometry.createAsset('source', 'callback');

		expect(Asset).toHaveBeenCalledWith('source', 'callback');

		expect(geometry.assets).toEqual({
			source: {
				destroyInstance,
				image: 'source',
				instances: []
			}
		});
	});

	it('should use an existing Asset', () => {
		const geometry = new Geometry('source');
		geometry.createAsset('source', 'callback');
		geometry.createAsset('source', 'callback')

		Asset.mockClear();

		expect(Asset).not.toHaveBeenCalled();

		expect(geometry.assets).toEqual({
			source: {
				destroyInstance,
				image: 'source',
				instances: []
			}
		});
	});

	it('should destroy an Asset', () => {
		const geometry = new Geometry('source');
		geometry.createAsset('source', 'callback');
		geometry.destroyAsset('source');

		expect(geometry.assets).toEqual({});
	});

	it('should destroy an anchored instances of an asset', () => {
		const geometry = new Geometry('source');
		geometry.createAsset('source', 'callback');
		geometry.assets.source.instances.push('first', 'second');
		geometry.destroyAsset('source', 'anchor');

		expect(destroyInstance.mock.calls).toEqual([
			['second', 'anchor'],
			['first', 'anchor']
		]);

		expect(geometry.assets).toEqual({
			source: {
				destroyInstance,
				image: 'source',
				instances: ['first', 'second']
			}
		});
	});
});
