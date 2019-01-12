import { expandPoints } from '../expand-points';
import { calculateNormals } from '../calculate-normals';
import { createGeometry } from '../create-geometry';

jest.mock('../expand-points', () => ({ expandPoints: jest.fn() }));
jest.mock('../calculate-normals', () => ({ calculateNormals: jest.fn() }));

describe('create-geometry', () => {
	let state;
	let geometries;
	let faces;
	let vertices;

	beforeEach(() => {
		expandPoints.mockClear();
		expandPoints.mockReturnValue('mockExpandPoints');
		
		calculateNormals.mockClear();
		calculateNormals.mockReturnValue('mockCalculateNormals');

		state = {};
		geometries = [];
		vertices = [-1, 0, 1];
		faces = [0, 1, 2, 3, 2 ,1];
	});

	it('should create geometry using only vertices', () => {
		const actual = createGeometry(state, geometries, [-1, 0, -1, -1, 0, 1, 1, 0, -1]);
		const geometry = geometries[0];

		expect(typeof actual).toBe('function');
		expect(expandPoints).toHaveBeenCalledWith(3, [0, 1, 2], [-1, 0, -1, -1, 0, 1, 1, 0, -1]);

		expect(geometry).toMatchObject({
			vertices: 'mockExpandPoints',
			faces: [0, 1, 2],
			normals: 'mockCalculateNormals',
			assets: []
		});
	});

	it('should create geometry using vertices and faces', () => {
		const actual = createGeometry(state, geometries, vertices, faces);
		const geometry = geometries[0];

		expect(typeof actual).toBe('function');
		expect(expandPoints).toHaveBeenCalledWith(3, [0, 1, 2, 3, 2, 1], [-1, 0, 1]);

		expect(geometry).toMatchObject({
			vertices: 'mockExpandPoints',
			faces: [0, 1, 2, 3, 2, 1],
			normals: 'mockCalculateNormals',
			assets: []
		});
	});

	it('should accept custom normals', () => {
		createGeometry(state, geometries, vertices, faces, [0, 1, 2]);
		const geometry = geometries[0];

		expect(geometry.normals).toEqual(new Float32Array([0, 1, 2]));
	});

	it('should delete geometry', () => {
		const actual = createGeometry(state, geometries, vertices, faces);
		actual();

		expect(geometries).toHaveLength(0);
	});
});
