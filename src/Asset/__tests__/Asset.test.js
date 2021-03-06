import { parseColor } from '../parse-color';
import { squareImage } from '../square-image';
import { Instance } from '../../Instance/Instance';
import { Asset } from '../Asset';

jest.mock('../parse-color', () => ({ parseColor: jest.fn() }));
jest.mock('../square-image', () => ({ squareImage: jest.fn() }));
jest.mock('../../Instance/Instance', () => ({ Instance: jest.fn() }));

describe('Asset', () => {
	const callback = jest.fn();
	let imageLoad;
	let imageError;

	beforeEach(() => {
		parseColor.mockClear().mockReturnValue('color');
		squareImage.mockClear().mockReturnValue('image');
		Instance.mockClear().mockImplementation(function (properties) { this.properties = properties; });
		callback.mockClear();
		
		imageLoad = undefined;
		imageError = undefined;
		
		window.Image = class Image {
			addEventListener (type, callback) {
				if (type === 'load') {
					imageLoad = callback;
				} else if (type === 'error') {
					imageError = callback;
				}
			}
		};
	});
	
	it('should create an asset using hexadecimal', () => {
		const actual = new Asset('#5af');

		expect(actual).toEqual({
			image: 'color',
			instances: []
		});
	});
	
	it('should create an asset using a full length hexadecimal', () => {
		const actual = new Asset('#50a0f0');

		expect(actual).toEqual({
			image: 'color',
			instances: []
		});
	});
	
	it('should create an asset using an image', () => {
		const actual = new Asset('source');

		expect(actual).toEqual({ instances: [] });
		imageLoad();
		expect(actual).toEqual({ image: 'image', instances: [] });
	});
	
	it('should handle failed image load', () => {
		const actual = new Asset('source');

		expect(actual).toEqual({ instances: [] });
		imageError();
		expect(actual).toEqual({ instances: [] });
	});
	
	it('should create an asset using an image with a callback', () => {
		new Asset('source', callback);

		expect(callback).not.toHaveBeenCalled();
		imageLoad();
		expect(callback).toHaveBeenCalledWith('source');
	});
	
	it('should handle failed image load with a callback', () => {
		new Asset('source', callback);

		expect(callback).not.toHaveBeenCalled();
		imageError();
		expect(callback).toHaveBeenCalledWith('source');
	});

	it('should create an instance', () => {
		const asset = new Asset('source');
		asset.createInstance('properties', 'duration');

		expect(Instance).toHaveBeenCalledWith('properties', 'duration');
		expect(asset.instances).toEqual([{ properties: 'properties' }]);
	});

	it('should destroy an instance', () => {
		const asset = new Asset('source');
		const actual = asset.createInstance('properties', 'duration');
		asset.destroyInstance(actual);

		expect(asset.instances).toEqual([]);
	});

	it('should destroy an anchored instance', () => {
		const asset = new Asset('source');
		const anchor = asset.createInstance('properties', 'duration');

		Instance.mockImplementation(function (anchor, properties) {
			this.anchor = anchor;
			this.properties = properties;
		});

		const actual = asset.createInstance(anchor, 'properties', 'duration');
		asset.destroyInstance(actual, anchor);

		expect(asset.instances).toEqual([anchor]);
	});

	it('should destroy a deeply anchored instance', () => {
		const asset = new Asset('source');
		const deepAnchor = asset.createInstance('properties', 'duration');

		Instance.mockImplementation(function (anchor, properties) {
			this.anchor = anchor;
			this.properties = properties;
		});

		const anchor = asset.createInstance(deepAnchor, 'properties', 'duration');
		const actual = asset.createInstance(anchor, 'properties', 'duration');
		asset.destroyInstance(actual, deepAnchor);

		expect(asset.instances).toEqual([deepAnchor, anchor]);
	});

	it('should not destroy instances that use a different anchor', () => {
		const asset = new Asset('source');
		const anchor = asset.createInstance('properties', 'duration');
		const other = asset.createInstance('properties', 'duration');

		Instance.mockImplementation(function (anchor, properties) {
			this.anchor = anchor;
			this.properties = properties;
		});

		const actual = asset.createInstance(other, 'properties', 'duration');
		asset.destroyInstance(actual, anchor);

		expect(asset.instances).toEqual([anchor, other, actual]);
	});
});
