import { expandPoints } from '../expand-points';
import { createAsset } from '../create-asset';

jest.mock('../expand-points', () => ({ expandPoints: jest.fn() }));

let loadImage;

window.Image = class Image {
	constructor () {
		loadImage = undefined;
	}

	addEventListener (type, callback) {
		loadImage = callback;
	}
};

describe('create-asset', () => {
	let state;
	let geometry;
	let color;
	let coordinates;

	beforeEach(() => {
		expandPoints.mockClear();
		expandPoints.mockReturnValue('mockExpandPoints');

		state = { images: {} };
		geometry = { assets: [], faces: [0, 1, 2], length: 3 };
		color = 'mockImage';
		coordinates = 'mockCoordinates';
	});

	it('should create asset', () => {
		const actual = createAsset(state, geometry, color, coordinates);
		const asset = geometry.assets[0];

		expect(typeof actual).toBe('function');
		expect(expandPoints).toHaveBeenCalledWith(3, [0, 1, 2], 'mockCoordinates');

		expect(asset).toEqual({
			coordinates: 'mockExpandPoints',
			instances: []
		});
	});

	it('should set color', () => {
		color = [1, 2, 3];
		createAsset(state, geometry, color, coordinates);
		const asset = geometry.assets[0];

		expect(asset.color).toEqual(new Uint8Array([1, 2, 3, 255]));
		expect(expandPoints).toHaveBeenCalledWith(3, [0, 1, 2], [0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
	});

	it('should set image', () => {
		createAsset(state, geometry, color, coordinates);
		loadImage();
		const asset = geometry.assets[0];

		expect(asset.color).toEqual({ src: 'mockImage' });
		expect(expandPoints).toHaveBeenCalledWith(3, [0, 1, 2], 'mockCoordinates');
		
		expect(state.images).toEqual({
			mockImage: { src: 'mockImage' }
		});
	});

	it('should use existing image', () => {
		state.images = {
			mockImage: { src: 'mockImage' }
		};

		createAsset(state, geometry, color, coordinates);
		const asset = geometry.assets[0];

		expect(asset.color).toEqual({ src: 'mockImage' });
		expect(expandPoints).toHaveBeenCalledWith(3, [0, 1, 2], 'mockCoordinates');
	});
	
	it('should trigger callback once loaded', () => {
		const callback = jest.fn();
		createAsset(state, geometry, color, coordinates, callback);
		loadImage();

		expect(callback).toHaveBeenCalledWith('mockImage');
	});

	it('should delete asset', () => {
		const actual = createAsset(state, geometry, color, coordinates);
		actual();

		expect(geometry.assets).toHaveLength(0);
	});
});
