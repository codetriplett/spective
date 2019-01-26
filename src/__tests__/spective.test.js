import { createCanvas } from '../create-canvas';
import { Scene } from '../Scene';
import { updateItem } from '../update-item';
import { createItem } from '../create-item';
import { parseFile } from '../parse-file';
import spective from '../spective';
import { create } from 'domain';

jest.mock('../create-canvas', () => ({ createCanvas: jest.fn() }));
jest.mock('../Scene', () => ({ Scene: jest.fn() }));
jest.mock('../update-item', () => ({ updateItem: jest.fn() }));
jest.mock('../create-item', () => ({ createItem: jest.fn() }));
jest.mock('../parse-file', () => ({ parseFile: jest.fn() }));

let providedCanvas;
let createdCanvas;
let geometries;
let bind;
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
		createCanvas.mockClear().mockReturnValue(createdCanvas);
		updateItem.mockClear();
		createItem.mockClear().mockReturnValue('mockCreateItem');
		parseFile.mockClear();

		scene = { render, resize, toggle };

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
		expect(Scene).toHaveBeenCalledWith(createdCanvas, []);
		expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
	});

	it('should accept a custom canvas', () => {
		spective(providedCanvas);

		expect(createCanvas).not.toHaveBeenCalled();
		expect(Scene).toHaveBeenCalledWith(providedCanvas, []);
		expect(window.addEventListener).not.toHaveBeenCalled();
	});

	it('should accept initial properties for scene', () => {
		spective({ key: 'first' }, { key: 'second' });
		expect(updateItem).toHaveBeenCalledWith(expect.any(Function), scene, { key: 'first' }, { key: 'second' });
	});

	it('should accept custom canvas and initial properties', () => {
		spective(providedCanvas, { key: 'first' }, { key: 'second' });
		expect(Scene).toHaveBeenCalledWith(providedCanvas, []);
		expect(updateItem).toHaveBeenCalledWith(expect.any(Function), scene, { key: 'first' }, { key: 'second' });
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

		expect(updateItem).toHaveBeenCalledWith(expect.any(Function), scene, { key: 'update' });
	});

	it('should create a geometry', () => {
		const callback = 'mockCallback';
		const actual = spective();
		const geometry = actual('object.obj', callback);
		
		expect(createItem).toHaveBeenCalledWith(expect.any(Function), geometries, parseFile, expect.any(Function), 'object.obj', 'mockCallback');
		expect(geometry).toBe('mockCreateItem');
	});

	it('should create an asset', () => {
		const callback = 'mockCallback';
		const actual = spective();
		let createAsset;

		createItem.mockImplementation((render, items, initialize, update) => createAsset = update);
		actual('object.obj', callback);
		createItem.mockClear().mockImplementation(() => 'mockCreateItem');

		const asset = createAsset(render, 'mockAssets', 'image.jpg', callback);
		
		expect(createItem).toHaveBeenCalledWith(expect.any(Function), 'mockAssets', 'image', expect.any(Function), 'image.jpg', 'mockCallback');
		expect(asset).toBe('mockCreateItem');
	});

	it('should create an instance', () => {
		const callback = 'mockCallback';
		const actual = spective();
		let createAsset;
		let createInstance;

		createItem.mockImplementation((render, items, initialize, update) => createAsset = update);
		actual('object.obj', callback);
		createItem.mockImplementation((render, items, initialize, update) => createInstance = update);
		createAsset(render, 'mockAssets', 'image.jpg', callback);
		createItem.mockClear().mockImplementation(() => 'mockCreateItem');

		const instance = createInstance(render, 'mockInstances', 'first', 'second');
		
		expect(createItem).toHaveBeenCalledWith(expect.any(Function), 'mockInstances', updateItem, updateItem, 'first', 'second');
		expect(instance).toBe('mockCreateItem');
	});
});
