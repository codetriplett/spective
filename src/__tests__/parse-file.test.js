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
	beforeEach(() => {
		calculateNormals.mockClear().mockReturnValue('normals')
	});

	it('should return attributes with all values', () => {
		const actual = parseFile(buildFile(true, true));

		expect(actual).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([0.1, 1.1, 0.1, 2.1, 0.1, 3.1, 0.1, 4.1, 0.1, 3.1, 0.1, 2.1]),
			normals: new Float32Array([-1.2, 0.2, 1.2, -2.2, 0.2, 2.2, -3.2, 0.2, 3.2, -4.2, 0.2, 4.2, -3.2, 0.2, 3.2, -2.2, 0.2, 2.2])
		});
	});

	it('should return attributes without coordinates', () => {
		const actual = parseFile(buildFile(false, true, ));

		expect(actual).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]),
			normals: new Float32Array([-1.2, 0.2, 1.2, -2.2, 0.2, 2.2, -3.2, 0.2, 3.2, -4.2, 0.2, 4.2, -3.2, 0.2, 3.2, -2.2, 0.2, 2.2])
		});
	});

	it('should return attributes without normals', () => {
		const actual = parseFile(buildFile(true, false));

		expect(actual).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([0.1, 1.1, 0.1, 2.1, 0.1, 3.1, 0.1, 4.1, 0.1, 3.1, 0.1, 2.1]),
			normals: 'normals'
		});
	});

	it('should return attributes without coordinates or normals', () => {
		const actual = parseFile(buildFile(false, false));

		expect(actual).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]),
			normals: 'normals'
		});
	});

	it('should not return attributes if there are no vertices', () => {
		const actual = parseFile('');
		expect(actual).toBeUndefined;
	});
});
