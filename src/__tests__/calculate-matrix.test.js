import { calculateMatrix } from '../calculate-matrix';

describe('calculate-matrix', () => {
	let mockAngle;
	let mockCos;
	let mockSin;

	beforeEach(() => {
		mockAngle = Math.PI / 3;
		mockCos = Math.cos(mockAngle);
		mockSin = Math.sin(mockAngle);
	});

	it('should calculate a scale matrix', () => {
		const actual = calculateMatrix(false, { scale: [0.25, 0.5, 0.75] });
		
		expect(actual).toEqual([
			0.25, 0, 0, 0,
			0, 0.5, 0, 0,
			0, 0, 0.75, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a scale matrix from a single value', () => {
		const actual = calculateMatrix(false, { scale: 0.5 });
		
		expect(actual).toEqual([
			0.5, 0, 0, 0,
			0, 0.5, 0, 0,
			0, 0, 0.5, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a rotation matrix', () => {
		const actual = calculateMatrix(false, { rotation: mockAngle });
		
		expect(actual).toEqual([
			mockCos, 0, mockSin, 0,
			0, 1, 0, 0,
			-mockSin, 0, mockCos, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a tilt matrix', () => {
		const actual = calculateMatrix(false, { tilt: mockAngle });
		
		expect(actual).toEqual([
			1, 0, 0, 0,
			0, mockCos, -mockSin, 0,
			0, mockSin, mockCos, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a spin matrix', () => {
		const actual = calculateMatrix(false, { spin: mockAngle });
		
		expect(actual).toEqual([
			mockCos, -mockSin, 0, 0,
			mockSin, mockCos, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate a translation matrix', () => {
		const actual = calculateMatrix(false, { position: [1, 2, 3] });
		
		expect(actual).toEqual([
			1, 0, 0, 1,
			0, 1, 0, 2,
			0, 0, 1, 3,
			0, 0, 0, 1
		]);
	});

	it('should calculate a composite matrix', () => {
		const actual = calculateMatrix(false, {
			scale: 0.5,
			rotation: mockAngle,
			tilt: mockAngle,
			spin: mockAngle,
			position: [1, 2, 3]
		});

		expect(actual).toEqual([
			-0.1997595264191644, -0.2165063509461097, 0.4040063509461097, 1,
			0.4040063509461097, 0.12500000000000006, 0.2667468245269451, 2,
			-0.2165063509461097, 0.4330127018922193, 0.12500000000000006, 3,
			0, 0, 0, 1
		]);
	});

	it('should calculate an inverted composite matrix', () => {
		const actual = calculateMatrix(true, {
			scale: 0.5,
			rotation: mockAngle,
			tilt: mockAngle,
			spin: mockAngle,
			position: [1, 2, 3]
		});

		expect(actual).toEqual([
			1.799038105676658, 0.8660254037844388, -0.11602540378443871, -1,
			-0.11602540378443882, 0.5000000000000002, 1.9330127018922192, -2,
			0.8660254037844388, -1.7320508075688772, 0.5000000000000002, -3,
			0, 0, 0, 1
		]);
	});

	it('should return a rotation matrix if a number is provided', () => {
		const actual = calculateMatrix(false, mockAngle);
		
		expect(actual).toEqual([
			mockCos, 0, mockSin, 0,
			0, 1, 0, 0,
			-mockSin, 0, mockCos, 0,
			0, 0, 0, 1
		]);
	});

	it('should calculate with anchor matrix', () => {
		const actual = calculateMatrix(false, { position: [1, 2, 3] }, [
			-0.1997595264191644, -0.2165063509461097, 0.4040063509461097, 1,
			0.4040063509461097, 0.12500000000000006, 0.2667468245269451, 2,
			-0.2165063509461097, 0.4330127018922193, 0.12500000000000006, 3,
			0, 0, 0, 1,
			1.799038105676658, 0.8660254037844388, -0.11602540378443871, -1,
			-0.11602540378443882, 0.5000000000000002, 1.9330127018922192, -2,
			0.8660254037844388, -1.7320508075688772, 0.5000000000000002, -3,
			0, 0, 0, 1
		]);
		
		expect(actual).toEqual([
			-0.1997595264191644, -0.2165063509461097, 0.4040063509461097, 1.5792468245269453,
			0.4040063509461097, 0.12500000000000006, 0.2667468245269451, 3.454246824526945,
			-0.2165063509461097, 0.4330127018922193, 0.12500000000000006, 4.024519052838329,
			0, 0, 0, 1,
		]);
	});

	it('should calculate inverse with anchor matrix', () => {
		const actual = calculateMatrix(true, { position: [1, 2, 3] }, [
			-0.1997595264191644, -0.2165063509461097, 0.4040063509461097, 1,
			0.4040063509461097, 0.12500000000000006, 0.2667468245269451, 2,
			-0.2165063509461097, 0.4330127018922193, 0.12500000000000006, 3,
			0, 0, 0, 1,
			1.799038105676658, 0.8660254037844388, -0.11602540378443871, -1,
			-0.11602540378443882, 0.5000000000000002, 1.9330127018922192, -2,
			0.8660254037844388, -1.7320508075688772, 0.5000000000000002, -3,
			0, 0, 0, 1
		]);
		
		expect(actual).toEqual([
			1.799038105676658, 0.8660254037844388, -0.11602540378443871, -4.18301270189222,
			-0.11602540378443882, 0.5000000000000002, 1.9330127018922192, -8.68301270189222,
			0.8660254037844388, -1.7320508075688772, 0.5000000000000002, -1.901923788646685,
			0, 0, 0, 1
		]);
	});

	it('should return an identity matrix if no properties are provided', () => {
		const actual = calculateMatrix();

		expect(actual).toEqual([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should ignore invalid property objects', () => {
		const actual = calculateMatrix(false, 'asdf');

		expect(actual).toEqual([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should ignore invalid properties', () => {
		const actual = calculateMatrix(false, {
			position: [1, 2, 3],
			asdf: 1
		});
		
		expect(actual).toEqual([
			1, 0, 0, 1,
			0, 1, 0, 2,
			0, 0, 1, 3,
			0, 0, 0, 1
		]);
	});

	it('should ignore invalid values', () => {
		const actual = calculateMatrix(false, {
			scale: '0',
			position: '0',
			rotation: '0',
			tilt: '0',
			spin: '0'
		});
		
		expect(actual).toEqual([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should ignore inverted zero scale', () => {
		const actual = calculateMatrix(true, { scale: [1, 0, 1] });
		
		expect(actual).toEqual([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});

	it('should ignore invalid arrays', () => {
		const actual = calculateMatrix(false, {
			scale: ['a', 'b', 'c'],
			position: [0, 1]
		});
		
		expect(actual).toEqual([
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
	});
});
