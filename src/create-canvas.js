export function createCanvas () {
	const canvas = document.createElement('canvas');
	const body = document.body;
	const style = document.createElement('style');
	
	style.innerHTML = `
		body { margin: 0; }
		canvas {
			display: block;
			width: 100vw;
			height: 100vh;
			position: absolute;
			left: 0;
			top: 0;
		}
	`;
	
	body.appendChild(style);
	body.appendChild(canvas);

	return canvas;
}
