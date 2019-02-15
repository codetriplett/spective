import { parseFile } from '../parse-file';
import { Asset } from '../../Asset/Asset';
import { Geometry } from '../Geometry';

jest.mock('../parse-file', () => ({ parseFile: jest.fn() }));
jest.mock('../../Asset/Asset', () => ({ Asset: jest.fn() }));

describe('Geometry', () => {
	const callback = jest.fn();
	let fileLoad;
	let fileError;

	beforeEach(() => {
		parseFile.mockClear().mockImplementation(() => ({ vertices: 'vertices' }));
		Asset.mockClear().mockImplementation(function (source) { this.image = source; });
		callback.mockClear();
		fileLoad = undefined;
		fileError = undefined;
		
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
		expect(actual).toEqual({ vertices: 'vertices', assets: {} });
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

	it('should create an Asset', () => {
		const geometry = new Geometry('source');
		geometry.createAsset('source', 'callback');

		expect(Asset).toHaveBeenCalledWith('source', 'callback');
		expect(geometry.assets).toEqual({ source: { image: 'source' } });
	});

	it('should use an existing Asset', () => {
		const geometry = new Geometry('source');
		geometry.createAsset('source', 'callback');
		geometry.createAsset('source', 'callback')

		Asset.mockClear();

		expect(Asset).not.toHaveBeenCalled();
		expect(geometry.assets).toEqual({ source: { image: 'source' } });
	});

	it('should destroy an Asset', () => {
		const geometry = new Geometry('source');
		geometry.createAsset('source', 'callback');
		geometry.destroyAsset('source');

		expect(geometry.assets).toEqual({});
	});
});
