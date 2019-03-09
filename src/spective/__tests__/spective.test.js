import { createCanvas } from '../create-canvas';
import { Instance } from '../../Instance/Instance';
import { Scene } from '../../Scene/Scene';
import { Meter } from '../../Meter/Meter';
import spective from '../spective';

jest.mock('../create-canvas', () => ({ createCanvas: jest.fn() }));
jest.mock('../../Instance/Instance', () => ({ Instance: jest.fn() }));
jest.mock('../../Scene/Scene', () => ({ Scene: jest.fn() }));
jest.mock('../../Meter/Meter', () => ({ Meter: jest.fn() }));

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
const measure = jest.fn();
const update = jest.fn();
let assets;
let instances;
let properties;

function resetMocks (skipScene) {
	window.addEventListener = addEventListener.mockClear();

	activate.mockClear();
	createCanvas.mockClear().mockReturnValue('canvas');

	Instance.mockClear().mockImplementation(function () {
		this.activate = activate.mockClear();
	});

	Meter.mockClear().mockImplementation(function () {
		this.measure = measure.mockClear().mockReturnValue('measure');
		this.update = update.mockClear().mockReturnValue('update');
	});

	if (skipScene === true) {
		return;
	}

	assets = {};
	instances = [];
	properties = {};

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
			const actual = spective(properties);

			expect(createCanvas).toHaveBeenCalledWith();
			expect(Instance).toHaveBeenCalledWith(true, properties);
			expect(Scene).toHaveBeenCalledWith('canvas', { activate });
			expect(resize).toHaveBeenCalledWith();
			expect(addEventListener).toHaveBeenCalledWith('resize', resize);

			expect(actual).toEqual(expect.any(Function));
		});

		it('should use a custom canvas', () => {
			const canvas = { getContext: () => {} };
			const actual = spective(canvas, properties);

			expect(createCanvas).not.toHaveBeenCalled();
			expect(Instance).toHaveBeenCalledWith(true, properties);
			expect(Scene).toHaveBeenCalledWith(canvas, { activate });
			expect(resize).toHaveBeenCalledWith();
			expect(addEventListener).not.toHaveBeenCalled();

			expect(actual).toEqual(expect.any(Function));
		});

		it('should update the camera', () => {
			const scene = spective(properties);
			scene({ property: 'update' });

			expect(activate).toHaveBeenCalledWith({ property: 'update' });
			expect(render).toHaveBeenCalledWith();
		});

		it('should toggle the camera', () => {
			const scene = spective(properties);
			scene();

			expect(toggle).toHaveBeenCalledWith();
		});
	});

	describe('instance', () => {
		let scene;

		beforeEach(() => {
			resetMocks();
			scene = spective(properties);
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

		it('should create an instance without an asset source', () => {
			const actual = scene('source.obj', { property: 'property' });

			expect(createGeometry).toHaveBeenCalledWith('source.obj', render);
			expect(createAsset).toHaveBeenCalledWith('#fff', render);
			expect(createInstance).toHaveBeenCalledWith(false, { property: 'property' });
			expect(render).toHaveBeenCalledWith();

			expect(actual).toEqual(expect.any(Function));
		});

		it('should create an instance without a geometry source', () => {
			const actual = scene('source.png', { property: 'property' });

			expect(createGeometry).toHaveBeenCalledWith('1 1 1', render);
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
			instance('child.obj', 'child.png', { property: 'property' });
			instance();

			expect(destroyInstance.mock.calls).toEqual([
				[{ activate }],
				[{ activate }]
			]);

			expect(destroyAsset).not.toHaveBeenCalled();
			expect(destroyGeometry).not.toHaveBeenCalled();
		});

		it('should destroy an empty asset after an instance is destroyed', () => {
			assets.asset = 'asset';
			const instance = scene('source.obj', 'source.png', { property: 'property' });
			instance();

			expect(destroyInstance).toHaveBeenCalledWith({ activate });
			expect(destroyAsset).toHaveBeenCalledWith('source.png');
			expect(destroyGeometry).not.toHaveBeenCalled();
		});

		it('should destroy an empty geometry after an instance is destroyed', () => {
			const instance = scene('source.obj', 'source.png', { property: 'property' });
			instance();

			expect(destroyInstance).toHaveBeenCalledWith({ activate });
			expect(destroyAsset).toHaveBeenCalledWith('source.png');
			expect(destroyGeometry).toHaveBeenCalledWith('source.obj');
		});

		it('should destroy all instances of an asset', () => {
			assets.asset = 'asset';
			scene('source.obj', 'source.png', { property: 'property' });
			scene('source.obj', 'source.png');

			expect(destroyAsset).toHaveBeenCalledWith('source.png', false);
			expect(destroyGeometry).not.toHaveBeenCalled();
		});

		it('should destroy an empty geometry after asset is destroyed', () => {
			scene('source.obj', 'source.png', { property: 'property' });
			scene('source.obj', 'source.png');

			expect(destroyAsset).toHaveBeenCalledWith('source.png', false);
			expect(destroyGeometry).toHaveBeenCalledWith('source.obj', false);
		});

		it('should destroy all instances of a geometry', () => {
			assets.asset = 'asset';
			scene('source.obj', 'source.png', { property: 'property' });
			scene('source.obj');

			expect(destroyAsset).not.toHaveBeenCalled();
			expect(destroyGeometry).toHaveBeenCalledWith('source.obj', false);
		});

		it('should destroy anchored instances of an asset', () => {
			assets.asset = 'asset';
			const anchor = scene('source.obj', 'source.png', { property: 'property' });
			anchor('child.obj', 'child.png');

			expect(destroyAsset).toHaveBeenCalledWith('child.png', { activate });
			expect(destroyGeometry).not.toHaveBeenCalled();
		});

		it('should destroy anchored instances of a geometry', () => {
			assets.asset = 'asset';
			const anchor = scene('source.obj', 'source.png', { property: 'property' });
			anchor('child.obj');

			expect(destroyAsset).not.toHaveBeenCalled();
			expect(destroyGeometry).toHaveBeenCalledWith('child.obj', { activate });
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

	describe('Meter', () => {
		beforeEach(() => resetMocks());

		it('should create a meter if parameters start with a function', () => {
			const action = () => {};
			const actual = spective(action, 'second');

			expect(Meter).toHaveBeenCalledWith(action, 'second');
			expect(actual).toEqual(expect.any(Function));
		});

		it('should create a meter if parameters start with a number', () => {
			const actual = spective(2, 'second');

			expect(Meter).toHaveBeenCalledWith(2, 'second');
			expect(actual).toEqual(expect.any(Function));
		});

		it('should create a meter if there is only a number', () => {
			const actual = spective(2);

			expect(Meter).toHaveBeenCalledWith(2);
			expect(actual).toEqual(expect.any(Function));
		});

		it('should create a meter if there are no parameters', () => {
			const actual = spective();

			expect(Meter).toHaveBeenCalledWith();
			expect(actual).toEqual(expect.any(Function));
		});

		it('should measure the meter if no parameters are passed to it', () => {
			const meter = spective(2, 'second');
			const actual = meter();

			expect(measure).toHaveBeenCalledWith();
			expect(actual).toBe('measure');
		});

		it('should update the meter if only one parameter is passed to it', () => {
			const meter = spective(2, 'second');
			const actual = meter(1);

			expect(update).toHaveBeenCalledWith(1);
			expect(actual).toBe('update');
		});

		it('should update the meter if two parameters are passed to it', () => {
			const meter = spective(2, 'second');
			const actual = meter(1, 1000);

			expect(update).toHaveBeenCalledWith(1, 1000);
			expect(actual).toBe('update');
		});
	});
});
