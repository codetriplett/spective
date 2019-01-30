import { createCanvas } from '../create-canvas';
import { Scene } from '../Scene';
import { updateItem } from '../update-item';
import { createInstance } from '../create-instance';
import spective from '../spective';

jest.mock('../create-canvas', () => ({ createCanvas: jest.fn() }));
jest.mock('../Scene', () => ({ Scene: jest.fn() }));
jest.mock('../update-item', () => ({ updateItem: jest.fn() }));
jest.mock('../create-instance', () => ({ createInstance: jest.fn() }));

let providedCanvas;
let geometries;
let render;
let resize;
let toggle;
let scene;

describe('spective', () => {
	beforeEach(() => {
		window.addEventListener = jest.fn();
		providedCanvas = { getContext: () => {} };
		render = jest.fn();
		resize = jest.fn();
		toggle = jest.fn();
		createCanvas.mockClear().mockReturnValue('mockCanvas');
		updateItem.mockClear();
		createInstance.mockClear().mockReturnValue('mockInstance');

		scene = { render, resize, toggle, updateItem, createInstance };

		Scene.mockClear().mockImplementation((canvas, initialGeometries) => {
			geometries = initialGeometries;
			return scene;
		});
	});

	it('should create a scene', () => {
		const actual = spective();
		expect(actual).toEqual(expect.any(Function));
	});

	it('should create a canvas is none is provided', () => {
		spective();

		expect(createCanvas).toHaveBeenCalledWith();
		expect(Scene).toHaveBeenCalledWith('mockCanvas', {});
		expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
	});

	it('should accept a custom canvas', () => {
		spective(providedCanvas);

		expect(createCanvas).not.toHaveBeenCalled();
		expect(Scene).toHaveBeenCalledWith(providedCanvas, {});
		expect(window.addEventListener).not.toHaveBeenCalled();
	});

	it('should accept initial properties for scene', () => {
		spective({ key: 'first' }, { key: 'second' });
		expect(updateItem).toHaveBeenCalledWith(scene, { key: 'first' }, { key: 'second' });
	});

	it('should accept custom canvas and initial properties', () => {
		spective(providedCanvas, { key: 'first' }, { key: 'second' });
		expect(Scene).toHaveBeenCalledWith(providedCanvas, {});
		expect(updateItem).toHaveBeenCalledWith(scene, { key: 'first' }, { key: 'second' });
	});

	it('should toggle the scene', () => {
		const actual = spective();
		actual();
		expect(toggle).toHaveBeenCalledWith();
	});

	it('should update the scene', () => {
		updateItem.mockClear();
		const actual = spective();
		actual({ key: 'update' });

		expect(updateItem).toHaveBeenCalledWith(scene, { key: 'update' });
	});

	it('should create an instance', () => {
		const scene = spective();
		const actual = scene('object.obj', 'image.jpg', 0, 1);

		expect(createInstance).toHaveBeenCalledWith('object.obj', 'image.jpg', 0, 1);
		expect(actual).toBe('mockInstance');
	});
});
