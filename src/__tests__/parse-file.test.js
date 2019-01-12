import { parseFile } from '../parse-file';

describe('parse-file', () => {
	const file = `${
		'\nv -1.0 0.0 1.0\nv -2.0 0.0 2.0\nv -3.0 0.0 3.0\nv -4.0 0.0 4.0'
	}\n${
		'\nvt 0.1 1.1\nvt 0.1 2.1\nvt 0.1 3.1\nvt 0.1 4.1'
	}\n${
		'\nvn -1.2 0.2 1.2\nvn -2.2 0.2 2.2\nvn -3.2 0.2 3.2\nvn -4.2 0.2 4.2'
	}\n${
		'\nf 1/1/1 2/2/2 3/3/3\nf 4/4/4 3/3/3 2/2/2'
	}`;

	const scene = jest.fn();
	const geometry = jest.fn();
	const asset = jest.fn();

	beforeEach(() => {
		scene.mockClear();
		geometry.mockClear();
		scene.mockReturnValue(geometry);
		geometry.mockReturnValue(asset);
	});

	it('should set all point values', () => {
		const actual = parseFile(scene, file, 'mockImage');

		expect(actual).toBe(asset);

		expect(scene).toHaveBeenCalledWith([
			-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -3.0, 0.0, 3.0, -4.0, 0.0, 4.0
		], [
			0, 1, 2, 3, 2, 1
		], [
			-1.2, 0.2, 1.2, -2.2, 0.2, 2.2, -3.2, 0.2, 3.2, -4.2, 0.2, 4.2, -3.2, 0.2, 3.2, -2.2, 0.2, 2.2
		]);

		expect(geometry).toHaveBeenCalledWith('mockImage', [
			0.1, 1.1, 0.1, 2.1, 0.1, 3.1, 0.1, 4.1, 0.1, 3.1, 0.1, 2.1
		]);
	});
});
