import { createCanvas } from '../create-canvas';

describe('create-canvas', () => {
	it('should create a canvas when none is provided', () => {
		createCanvas();
		const children = document.body.children;
		const style = children[0];
		const canvas = children[1];

		expect(style.tagName.toLowerCase()).toBe('style');
		expect(canvas.tagName.toLowerCase()).toBe('canvas');
	});
});
