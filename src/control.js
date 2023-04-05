export const controls = new Set();
const keyControls = {};
export const KEY_INPUT = 'KEY_INPUT';
export const TOUCH_INPUT = 'TOUCH_INPUT';

function hold (control, event) {
	controls.add(control);
	control.activate(event);
}

function release (control, event) {
	controls.delete(control);
	control.deactivate(event);
}

function resolveKey ({ key, repeat }, callback) {
	if (repeat) return;
	const control = keyControls[key];
	if (!control) return;
	callback(control, { type: KEY_INPUT, input: 'key', control });
}

function resolveTouch (event, callback, control) {
	event.preventDefault();
	callback(control, { type: TOUCH_INPUT, input: 'touch', control });
}

window.addEventListener('keydown', event => resolveKey(event, hold));
window.addEventListener('keyup', event => resolveKey(event, release));

export default class Control {
	constructor (info, ondown, onup) {
		const { key, el } = info;
		if (key) keyControls[key] = this;

		if (el) {
			el.addEventListener('mousedown', event => resolveTouch(event, hold, this));
			el.addEventListener('mouseup', event => resolveTouch(event, release, this));
			el.addEventListener('touchstart', event => resolveTouch(event, hold, this), { passive: false });
			el.addEventListener('touchend', event => resolveTouch(event, release, this), { passive: false });
		}

		this.ondown = ondown;
		this.onup = onup;
	}

	activate (event) {
		this.ondown(event);
	}

	deactivate (event) {
		if (!this.onup) return;
		this.onup(event);
	}
}
