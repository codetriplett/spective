import { loadResource } from '../load-resource';

const callback = jest.fn();
let imageLoad;
let imageError;
let fileLoad;
let fileError;

describe('load-resource', () => {
	beforeEach(() => {
		callback.mockClear();
		imageLoad = undefined;
		imageError = undefined;
		fileLoad = undefined;
		fileError = undefined;
		
		window.Image = class Image {
			addEventListener (type, callback) {
				if (type === 'load') {
					imageLoad = callback;
				} else if (type === 'error') {
					imageError = callback;
				}
			}
		};

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
	});

	it('should parse long hexadecimal', () => {
		loadResource('#09af78', callback);
		expect(callback).toHaveBeenCalledWith(new Uint8Array([9, 175, 120, 255]));
	});

	it('should parse short hexadecimal', () => {
		loadResource('#0f8', callback);
		expect(callback).toHaveBeenCalledWith(new Uint8Array([0, 255, 136, 255]));
	});

	it('should handle invalid hexadecimal', () => {
		loadResource('#az', callback);
		expect(callback).toHaveBeenCalledWith(undefined);
	});

	it('should load an image successfully', () => {
		loadResource('image.jpg', callback);
		imageLoad();
		expect(callback).toHaveBeenCalledWith({ src: 'image.jpg' });
	});

	it('should handle an unsuccessful image load', () => {
		loadResource('image.jpg', callback);
		imageError();
		expect(callback).toHaveBeenCalledWith();
	});

	it('should load a file', () => {
		loadResource('object.obj', callback);
		fileLoad();
		expect(callback).toHaveBeenCalledWith('mockResponseText');
	});

	it('should handle an unsuccessful file load', () => {
		loadResource('object.obj', callback);
		fileError();
		expect(callback).toHaveBeenCalledWith();
	});
});
