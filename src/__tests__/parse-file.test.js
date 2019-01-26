import { calculateNormals } from '../calculate-normals';
import { parseFile } from '../parse-file';

jest.mock('../calculate-normals', () => ({ calculateNormals: jest.fn() }));

function buildFile (includeCoordinates, includeNormals) {
	const faces = `f ${[[1, 2, 3], [4, 3, 2]].map(face => {
		return face.map(point => {
			return `${point}${includeCoordinates || includeNormals ? `/${includeCoordinates ? point : ''}` : ''}${includeNormals ? `/${point}` : ''}`;
		}).join(' ');
	}).join('\nf ')}`;

	return `${
		'\nv -1.0 0.0 1.0\nv -2.0 0.0 2.0\nv -3.0 0.0 3.0\nv -4.0 0.0 4.0'
	}\n${
		includeCoordinates ? '\nvt 0.1 1.1\nvt 0.1 2.1\nvt 0.1 3.1\nvt 0.1 4.1' : ''
	}\n${
		includeNormals ? '\nvn -1.2 0.2 1.2\nvn -2.2 0.2 2.2\nvn -3.2 0.2 3.2\nvn -4.2 0.2 4.2' : ''
	}\n${
		faces
	}`;
}

describe('parse-file', () => {
	let geometry;

	beforeEach(() => {
		calculateNormals.mockReturnValue('mockCalculateNormals');
		geometry = {};
	});

	it('should update geometry and asset with all values', () => {
		parseFile(geometry, buildFile(true, true));

		expect(geometry).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([0.1, 1.1, 0.1, 2.1, 0.1, 3.1, 0.1, 4.1, 0.1, 3.1, 0.1, 2.1]),
			normals: new Float32Array([-1.2, 0.2, 1.2, -2.2, 0.2, 2.2, -3.2, 0.2, 3.2, -4.2, 0.2, 4.2, -3.2, 0.2, 3.2, -2.2, 0.2, 2.2])
		});
	});

	it('should update geometry and asset without coordinates', () => {
		parseFile(geometry, buildFile(false, true, ));

		expect(geometry).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]),
			normals: new Float32Array([-1.2, 0.2, 1.2, -2.2, 0.2, 2.2, -3.2, 0.2, 3.2, -4.2, 0.2, 4.2, -3.2, 0.2, 3.2, -2.2, 0.2, 2.2])
		});
	});

	it('should update geometry and asset without normals', () => {
		parseFile(geometry, buildFile(true, false));

		expect(geometry).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([0.1, 1.1, 0.1, 2.1, 0.1, 3.1, 0.1, 4.1, 0.1, 3.1, 0.1, 2.1]),
			normals: 'mockCalculateNormals'
		});
	});

	it('should update geometry and asset without coordinates or normals', () => {
		parseFile(geometry, buildFile(false, false));

		expect(geometry).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]),
			normals: 'mockCalculateNormals'
		});
	});

	it('should not update geometry if there are no vertices', () => {
		parseFile(geometry, '');
		expect(geometry).toEqual({});
	});
});
