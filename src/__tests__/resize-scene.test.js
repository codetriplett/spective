import { resizeScene } from '../resize-scene';

const viewport = jest.fn();
const uniformMatrix4fv = jest.fn();
let canvas;
let gl;
let state;

describe('resize-scene', () => {
	beforeEach(() => {
		viewport.mockClear();
		uniformMatrix4fv.mockClear();

		canvas = { clientWidth: 1024, clientHeight: 768 };
		gl = { viewport, uniformMatrix4fv };
		state = {};
	});

	it('should set canvas and viewport dimensions', () => {
		resizeScene({ gl, perspectiveLocation: 'mockLocation', canvas, state });
		expect(viewport).toHaveBeenCalledWith(0, 0, 1024, 768);
	});

	it('should create perspective matrix', () => {
		resizeScene({ gl, perspectiveLocation: 'mockLocation', canvas, state });

		expect(uniformMatrix4fv).toHaveBeenCalledWith('mockLocation', false, [
			2.414213562373095, 0, 0, 0,
			0, 3.2189514164974597, 0, 0,
			0, 0, 1.002002002002002, -2,
			0, 0, 2.002002002002002, 0
		]);
	});

	it('should initiate a new render', () => {
		resizeScene({ gl, perspectiveLocation: 'mockLocation', canvas, state });
		expect(state.needsRender).toBeTruthy();
	});
});
