export const controls = new Set();
const keyControls = {};
const touchControls = [];
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

function getTouchControl (pageX, pageY) {
	for (const touch of touchControls) {
		const [control, x, y, x2, y2] = touch;
		if (pageX < x || pageX > x2 || pageY < y || pageY > y2) continue;
		return control;
	}
}

function resolveTouch (event, callback) {
	const { changedTouches: [{ pageX, pageY }] } = event;
	const control = getTouchControl(pageX, pageY);
	if (!control) return;
	event.preventDefault();
	callback(control, { type: TOUCH_INPUT, input: 'touch', control });
}

window.addEventListener('keydown', event => resolveKey(event, hold));
window.addEventListener('keyup', event => resolveKey(event, release));
window.addEventListener('touchstart', event => resolveTouch(event, hold), { passive: false });
window.addEventListener('touchend', event => resolveTouch(event, release), { passive: false });

export default class Control {
	constructor (info, ondown, onup) {
		// store this control under the appropriate resolvers
		const { key, touch } = info;
		if (key) keyControls[key] = this;

		if (touch) {
			const [x = 0, w = 1, y = 0, h = 1] = touch;
			touchControls.unshift([this, x, y, x + w, y + h]);
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
