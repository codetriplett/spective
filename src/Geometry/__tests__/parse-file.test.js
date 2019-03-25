import { calculateNormals } from '../calculate-normals';
import { parseFile } from '../parse-file';

jest.mock('../calculate-normals', () => ({ calculateNormals: jest.fn() }));

function buildFile (includeCoordinates, includeNormals, repeatTexture) {
	const faces = `f ${[[1, 2, 3], [4, 3, 2]].map(face => {
		return face.map(point => {
			return `${point}${includeCoordinates || includeNormals ? `/${includeCoordinates ? point : ''}` : ''}${includeNormals ? `/${point}` : ''}`;
		}).join(' ');
	}).join('\nf ')}`;

	return `${
		'\nv -1.0 0.0 1.0\nv -2.0 0.0 2.0\nv -3.0 0.0 3.0\nv -4.0 0.0 4.0'
	}\n${
		includeCoordinates ? `\nvt 0.1 0.1\nvt 0.2 0.2\nvt 0.3 0.3\nvt ${repeatTexture ? 4 : 0}.4 ${repeatTexture ? 4 : 0}.4` : ''
	}\n${
		includeNormals ? '\nvn -1.2 0.2 1.2\nvn -2.2 0.2 2.2\nvn -3.2 0.2 3.2\nvn -4.2 0.2 4.2' : ''
	}\n${
		faces
	}`;
}

describe('parse-file', () => {
	beforeEach(() => {
		calculateNormals.mockClear().mockReturnValue([2])
	});

	it('should return attributes with all values', () => {
		const actual = parseFile(buildFile(true, true));

		expect(actual).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4, 0.3, 0.3, 0.2, 0.2]),
			normals: new Float32Array([-1.2, 0.2, 1.2, -2.2, 0.2, 2.2, -3.2, 0.2, 3.2, -4.2, 0.2, 4.2, -3.2, 0.2, 3.2, -2.2, 0.2, 2.2]),
			repeatTexture: false
		});
	});

	it('should return attributes without coordinates', () => {
		const actual = parseFile(buildFile(false, true));

		expect(actual).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([-1.0, -1.0, -2.0, -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0, -2.0]),
			normals: new Float32Array([-1.2, 0.2, 1.2, -2.2, 0.2, 2.2, -3.2, 0.2, 3.2, -4.2, 0.2, 4.2, -3.2, 0.2, 3.2, -2.2, 0.2, 2.2]),
			repeatTexture: true
		});
	});

	it('should return attributes without normals', () => {
		const actual = parseFile(buildFile(true, false));

		expect(calculateNormals).toHaveBeenCalledWith(
			[0, 1, 2, 3, 2, 1],
			[-1, 0, 1, -2, 0, 2, -3, 0, 3, -4, 0, 4],
			undefined
		);

		expect(actual).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4, 0.3, 0.3, 0.2, 0.2]),
			normals: new Float32Array([2]),
			repeatTexture: false
		});
	});
	
	it('should pass along sharpness setting', () => {
		parseFile(buildFile(true, false), 1);
		
		expect(calculateNormals).toHaveBeenCalledWith(
			[0, 1, 2, 3, 2, 1],
			[-1, 0, 1, -2, 0, 2, -3, 0, 3, -4, 0, 4],
			1
		);
	});

	it('should return attributes without coordinates or normals', () => {
		const actual = parseFile(buildFile(false, false));

		expect(actual).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([-1.0, -1.0, -2.0, -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0, -2.0]),
			normals: new Float32Array([2]),
			repeatTexture: true
		});
	});

	it('should repeat the texture', () => {
		const actual = parseFile(buildFile(true, true, true));

		expect(actual).toEqual({
			vertices: new Float32Array([-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0, -3.0, 0.0, 3.0, -2.0, 0.0, 2.0]),
			coordinates: new Float32Array([0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 4.4, 4.4, 0.3, 0.3, 0.2, 0.2]),
			normals: new Float32Array([-1.2, 0.2, 1.2, -2.2, 0.2, 2.2, -3.2, 0.2, 3.2, -4.2, 0.2, 4.2, -3.2, 0.2, 3.2, -2.2, 0.2, 2.2]),
			repeatTexture: true
		});
	});

	it('should not return attributes if there are no vertices', () => {
		const actual = parseFile('');
		expect(actual).toBeUndefined;
	});
});
