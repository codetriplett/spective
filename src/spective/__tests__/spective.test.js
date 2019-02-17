import { createCanvas } from '../create-canvas';
import { Instance } from '../../Instance/Instance';
import { Scene } from '../../Scene/Scene';
import spective from '../spective';

jest.mock('../create-canvas', () => ({ createCanvas: jest.fn() }));
jest.mock('../../Instance/Instance', () => ({ Instance: jest.fn() }));
jest.mock('../../Scene/Scene', () => ({ Scene: jest.fn() }));

const addEventListener = jest.fn();
const activate = jest.fn();
const resize = jest.fn();
const toggle = jest.fn();
const render = jest.fn();
const createGeometry = jest.fn();
const destroyGeometry = jest.fn();
const createAsset = jest.fn();
const destroyAsset = jest.fn();
const createInstance = jest.fn();
const destroyInstance = jest.fn();
let assets;
let instances;

function resetMocks (skipScene) {
	window.addEventListener = addEventListener.mockClear();

	activate.mockClear();
	createCanvas.mockClear().mockReturnValue('canvas');

	Instance.mockClear().mockImplementation(function () {
		this.activate = activate.mockClear();
	});

	if (skipScene === true) {
		return;
	}

	assets = {};
	instances = [];

	Scene.mockClear().mockImplementation(function () {
		this.resize = resize.mockClear();
		this.toggle = toggle.mockClear();
		this.render = render.mockClear();
		
		this.createGeometry = createGeometry.mockClear().mockReturnValue({
			createAsset: createAsset.mockClear().mockReturnValue({
				createInstance: createInstance.mockClear().mockReturnValue({ activate }),
				destroyInstance: destroyInstance.mockClear(),
				instances
			}),
			destroyAsset: destroyAsset.mockClear(),
			assets
		});
		
		this.destroyGeometry = destroyGeometry.mockClear();
	});
}

describe('spective', () => {
	describe('scene', () => {
		beforeEach(() => resetMocks());

		it('should create a canvas', () => {
			const actual = spective('first', 'second');

			expect(createCanvas).toHaveBeenCalledWith();
			expect(Instance).toHaveBeenCalledWith(true, 'first', 'second');
			expect(Scene).toHaveBeenCalledWith('canvas', { activate });
			expect(resize).toHaveBeenCalledWith();
			expect(addEventListener).toHaveBeenCalledWith('resize', resize);

			expect(actual).toEqual(expect.any(Function));
		});

		it('should use a custom canvas', () => {
			const canvas = { getContext: () => {} };
			const actual = spective(canvas, 'first', 'second');

			expect(createCanvas).not.toHaveBeenCalled();
			expect(Instance).toHaveBeenCalledWith(true, 'first', 'second');
			expect(Scene).toHaveBeenCalledWith(canvas, { activate });
			expect(resize).toHaveBeenCalledWith();
			expect(addEventListener).not.toHaveBeenCalled();

			expect(actual).toEqual(expect.any(Function));
		});

		it('should update the camera', () => {
			const scene = spective();
			scene({ property: 'update' });

			expect(activate).toHaveBeenCalledWith({ property: 'update' });
			expect(render).toHaveBeenCalledWith();
		});

		it('should toggle the camera', () => {
			const scene = spective();
			scene();

			expect(toggle).toHaveBeenCalledWith();
		});
	});

	describe('instance', () => {
		let scene;

		beforeEach(() => {
			resetMocks();
			scene = spective();
			resetMocks(true);
		});

		it('should create an instance', () => {
			const actual = scene('source.obj', 'source.png', { property: 'property' });

			expect(createGeometry).toHaveBeenCalledWith('source.obj', render);
			expect(createAsset).toHaveBeenCalledWith('source.png', render);
			expect(createInstance).toHaveBeenCalledWith(false, { property: 'property' });
			expect(render).toHaveBeenCalledWith();

			expect(actual).toEqual(expect.any(Function));
		});

		it('should update an instance', () => {
			const instance = scene('source.obj', 'source.png', { property: 'property' });
			resetMocks();
			instance({ property: 'update' });

			expect(activate).toHaveBeenCalledWith({ property: 'update' });
			expect(render).toHaveBeenCalledWith();
		});

		it('should destroy an instance', () => {
			assets.asset = 'asset';
			instances.push('instance');
			const instance = scene('source.obj', 'source.png', { property: 'property' });
			instance();

			expect(destroyInstance).toHaveBeenCalledWith({ activate });
			expect(destroyAsset).not.toHaveBeenCalled();
			expect(destroyGeometry).not.toHaveBeenCalled();
		});

		it('should destroy an asset', () => {
			assets.asset = 'asset';
			const instance = scene('source.obj', 'source.png', { property: 'property' });
			instance();

			expect(destroyInstance).toHaveBeenCalledWith({ activate });
			expect(destroyAsset).toHaveBeenCalledWith('source.png');
			expect(destroyGeometry).not.toHaveBeenCalled();
		});

		it('should destroy a geometry', () => {
			const instance = scene('source.obj', 'source.png', { property: 'property' });
			instance();

			expect(destroyInstance).toHaveBeenCalledWith({ activate });
			expect(destroyAsset).toHaveBeenCalledWith('source.png');
			expect(destroyGeometry).toHaveBeenCalledWith('source.obj');
		});

		it('should create an anchored instance', () => {
			const instance = scene('source.obj', 'source.png', { property: 'property' });
			resetMocks();
			const actual = instance('source.obj', 'source.png', { property: 'child' });

			expect(createGeometry).toHaveBeenCalledWith('source.obj', render);
			expect(createAsset).toHaveBeenCalledWith('source.png', render);
			expect(createInstance).toHaveBeenCalledWith({ activate }, { property: 'child' });
			expect(render).toHaveBeenCalledWith();

			expect(actual).toEqual(expect.any(Function));
		});
	});
});
