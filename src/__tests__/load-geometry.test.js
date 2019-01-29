import { parseFile } from '../parse-file';
import { loadGeometry } from '../load-geometry';

jest.mock('../parse-file', () => ({ parseFile: jest.fn() }));

describe('load-geometry', () => {
	const render = jest.fn();
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
		
		render.mockClear();
		parseFile.mockClear().mockImplementation(geometry => geometry.vertices = 'mockVertices');
		geometries = {};
	});

	it('should create a geometry using a file', () => {
		const actual = loadGeometry(render, geometries, 'source');

		expect(geometries).toEqual({ source: { assets: [] } });
		expect(actual).toEqual({ assets: [] });

		load();
		expect(geometries).toEqual({ source: { vertices: 'mockVertices', assets: [] } });
		expect(render).toHaveBeenCalled();
	});

	it('should handle a failed file load', () => {
		const actual = loadGeometry(render, geometries, 'source');

		expect(geometries).toEqual({ source: { assets: [] } });
		expect(actual).toEqual({ assets: [] });

		error();
		expect(geometries).toEqual({});
		expect(render).not.toHaveBeenCalled();
	});

	it('should use an existing geometry', () => {
		geometries = { source: 'mockGeometry' };
		const actual = loadGeometry(render, geometries, 'source');

		expect(geometries).toEqual({ source: 'mockGeometry' });
		expect(actual).toBe('mockGeometry');
		expect(render).not.toHaveBeenCalled();
	});
});
