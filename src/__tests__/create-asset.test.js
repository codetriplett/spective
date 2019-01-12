import { expandPoints } from '../expand-points';
import { createAsset } from '../create-asset';

jest.mock('../expand-points', () => ({ expandPoints: jest.fn() }));

let loadImage;
let failImage;

window.Image = class Image {
	constructor () {
		loadImage = undefined;
	}

	addEventListener (type, callback) {
		if (type === 'load') {
			loadImage = callback;
		} else if (type === 'error') {
			failImage = callback;
		}
	}
};

describe('create-asset', () => {
	let state;
	let geometry;
	let image;
	let coordinates;

	beforeEach(() => {
		expandPoints.mockClear();
		expandPoints.mockReturnValue('mockExpandPoints');

		state = { images: {} };
		geometry = { assets: [], faces: [0, 1, 2, 3, 2, 1], length: 4 };
		image = 'mockImage';
		coordinates = [1, 1, 2, 2, 3, 3, 4, 4];
	});

	it('should create asset', () => {
		const actual = createAsset(state, geometry, image, coordinates);
		const asset = geometry.assets[0];

		expect(typeof actual).toBe('function');
		expect(expandPoints).toHaveBeenCalledWith(2, [0, 1, 2, 3, 2, 1], [1, 1, 2, 2, 3, 3, 4, 4]);

		expect(asset).toEqual({
			coordinates: 'mockExpandPoints',
			instances: []
		});
	});

	it('should set color', () => {
		image = [0.25, 0.5, 0.75];
		createAsset(state, geometry, image);
		const asset = geometry.assets[0];

		expect(expandPoints).not.toHaveBeenCalled();

		expect(asset).toMatchObject({
			image: new Uint8Array([64, 128, 191, 255]),
			coordinates: new Float32Array([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5])
		});
	});

	it('should set multiple colors', () => {
		image = [0.2, 0.4, 0.8, 0.3, 0.6, 0.9];
		createAsset(state, geometry, image, [1, 0, 0, 1]);
		const asset = geometry.assets[0];

		expect(asset.image).toEqual(new Uint8Array([51, 102, 204, 255, 77, 153, 230, 255]));
		expect(expandPoints).toHaveBeenCalledWith(2, [0, 1, 2, 3, 2, 1], [0.75, 0.5, 0.25, 0.5, 0.25, 0.5, 0.75, 0.5]);
	});

	it('should set image', () => {
		createAsset(state, geometry, image, coordinates);
		loadImage();
		const asset = geometry.assets[0];

		expect(asset.image).toEqual({ src: 'mockImage' });

		expect(state.images).toEqual({
			mockImage: { src: 'mockImage' }
		});
	});

	it('should use existing image', () => {
		state.images = {
			mockImage: { src: 'mockImage' }
		};

		createAsset(state, geometry, image, coordinates);
		const asset = geometry.assets[0];

		expect(asset.image).toEqual({ src: 'mockImage' });
	});
	
	it('should trigger callback once loaded', () => {
		const callback = jest.fn();
		createAsset(state, geometry, image, coordinates, callback);
		loadImage();

		expect(callback).toHaveBeenCalledWith('mockImage', true);
	});
	
	it('should trigger callback if it fails to load', () => {
		const callback = jest.fn();
		createAsset(state, geometry, image, coordinates, callback);
		failImage();

		expect(callback).toHaveBeenCalledWith('mockImage', false);
	});

	it('should delete asset', () => {
		const actual = createAsset(state, geometry, image, coordinates);
		actual();

		expect(geometry.assets).toHaveLength(0);
	});
});
