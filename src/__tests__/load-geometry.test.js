import { parseFile } from '../parse-file';
import { loadGeometry } from '../load-geometry';

jest.mock('../parse-file', () => ({ parseFile: jest.fn() }));

describe('load-geometry', () => {
	const callback = jest.fn();
	let load;
	let error;
	let geometries;

	beforeEach(() => {
		load = undefined;
		error = undefined;

		window.XMLHttpRequest.prototype.send = jest.fn().mockImplementation(function () {
			load = () => {
				Object.defineProperty(window.XMLHttpRequest.prototype, 'status', { 
					get: () => 200
				});
		
				Object.defineProperty(window.XMLHttpRequest.prototype, 'responseText', { 
					get: () => 'mockResponseText'
				});

				this.onload();
			};

			error = () => {
				Object.defineProperty(window.XMLHttpRequest.prototype, 'status', { 
					get: () => 404
				});
		
				Object.defineProperty(window.XMLHttpRequest.prototype, 'responseText', { 
					get: () => undefined
				});
				
				this.onload();
			};
		});
		
		parseFile.mockClear().mockReturnValue({ vertices: 'mockVertices' });
		callback.mockClear();
		geometries = {};
	});

	it('should create a geometry using a file', () => {
		const actual = loadGeometry(geometries, 'source', callback);

		const geometry = {
			vertices: 'mockVertices',
			assets: []
		};

		expect(actual).toBe(true);
		expect(callback).not.toHaveBeenCalled();
		expect(geometries).toEqual({});

		callback.mockClear();
		load();

		expect(callback).toHaveBeenCalledWith(geometry);
		expect(geometries).toEqual({ source: geometry });
	});

	it('should handle a failed file load', () => {
		const actual = loadGeometry(geometries, 'source', callback);

		expect(actual).toBe(true);
		expect(callback).not.toHaveBeenCalled();
		expect(geometries).toEqual({});

		callback.mockClear();
		error();

		expect(callback).toHaveBeenCalledWith({});
		expect(geometries).toEqual({});
	});

	it('should use an existing geometry', () => {
		geometries = { source: 'mockGeometry' };
		const actual = loadGeometry(geometries, 'source', callback);

		expect(actual).toBeUndefined();
		expect(callback).toHaveBeenCalledWith('mockGeometry');
		expect(geometries).toEqual({ source: 'mockGeometry' });
	});
});
