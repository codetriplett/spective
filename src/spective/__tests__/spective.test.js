import { createCanvas } from '../create-canvas';
import { Instance } from '../../Instance/Instance';
import { Scene } from '../../Scene/Scene';
import { spective } from '../spective';

jest.mock('../create-canvas', () => ({ createCanvas: jest.fn() }));
jest.mock('../../Instance/Instance', () => ({ Instance: jest.fn() }));
jest.mock('../../Scene/Scene', () => ({ Scene: jest.fn() }));

describe('spective', () => {
	const activate = jest.fn();
	const resize = jest.fn();
	const toggle = jest.fn();
	const render = jest.fn();
	const createGeometry = jest.fn();
	const destroyGeometry = jest.fn();
	const createAsset = jest.fn();
	const destoryAsset = jest.fn();
	const createInstance = jest.fn();
	const destorInstance = jest.fn();

	beforeEach(() => {
		activate.mockClear();
		createCanvas.mockClear().mockReturnValue('canvas');

		Instance.mockClear().mockImplementation(function () {
			this.activate = activate.mockClear();
		});

		Scene.mockClear().mockImplementation(function () {
			this.resize = resize.mockClear();
			this.toggle = toggle.mockClear();
			this.render = render.mockClear();
			
			this.createGeometry = createGeometry.mockClear().mockReturnValue({
				createAsset: createAsset.mockClear().mockReturnValue({
					createInstance: createInstance.mockClear().mockReturnValue({ activate }),
					destoryInstance: destorInstance.mockClear()
				}),
				destoryAsset: destoryAsset.mockClear()
			});
			
			this.destroyGeometry = destroyGeometry.mockClear();
		});
	});
});
