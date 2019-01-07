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
		faces = [0, 1, 2];
		vertices = 'mockVertices';
	});

	it('should create geometry', () => {
		const actual = createGeometry(state, geometries, faces, vertices);
		const geometry = geometries[0];

		expect(typeof actual).toBe('function');
		expect(expandPoints).toHaveBeenCalledWith(3, [0, 1, 2], 'mockVertices');

		expect(geometry).toMatchObject({
			length: 3,
			faces: [0, 1, 2],
			vertices: 'mockExpandPoints',
			normals: 'mockCalculateNormals',
			assets: []
		});
	});

	it('should accept custom normals', () => {
		createGeometry(state, geometries, faces, vertices, 'mockNormals');
		const geometry = geometries[0];

		expect(geometry.normals).toBe('mockNormals');
	});

	it('should delete geometry', () => {
		const actual = createGeometry(state, geometries, faces, vertices);
		actual();

		expect(geometries).toHaveLength(0);
	});
});
