export const controls = new Set();
const keyControls = {};

window.addEventListener('keydown', ({ key, repeat }) => {
	if (repeat) return;
	const control = keyControls[key];
	if (!control) return;
	controls.add(control);
	control.activate();
});

window.addEventListener('keyup', ({ key }) => {
	const control = keyControls[key];
	if (!control) return;
	controls.delete(control);
	control.deactivate();
});

export default class Control {
	constructor (info, ondown, onup) {
		// store this control under the appropriate resolvers
		const { key } = info;
		if (key) keyControls[key] = this;

		this.ondown = ondown;
		this.onup = onup;
	}

	activate () {
		this.ondown();
	}

	deactivate () {
		if (!this.onup) return;
		this.onup();
	}
}
