export const controls = new Set();
const keyControls = {};
export const KEY_INPUT = 'KEY_INPUT';
export const CLICK_INPUT = 'CLICK_INPUT';
export const CONTEXT_INPUT = 'CONTEXT_INPUT';
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

function resolveMouse (event, callback, control, which) {
	if (event.which !== which) return;
	event.preventDefault();
	event.stopPropagation();

	switch (which) {
		case 1: {
			callback(control, { type: CLICK_INPUT, input: 'click', control });
			break;
		}
		case 3: {
			callback(control, { type: CONTEXT_INPUT, input: 'context', control });
			break;
		}
	}
}

function resolveTouch (event, callback, control) {
	event.preventDefault();
	event.stopPropagation();
	callback(control, { type: TOUCH_INPUT, input: 'touch', control });
}

window.addEventListener('keydown', event => resolveKey(event, hold));
window.addEventListener('keyup', event => resolveKey(event, release));

export default class Control {
	constructor (info, ondown, onup) {
		const { key, click, context, touch } = info;
		if (key) keyControls[key] = this;

		if (click) {
			click.addEventListener('mousedown', event => resolveMouse(event, hold, this, 1));
			click.addEventListener('mouseup', event => resolveMouse(event, release, this, 1));
		}

		if (context) {
			context.addEventListener('mousedown', event => resolveMouse(event, hold, this, 3));
			context.addEventListener('mouseup', event => resolveMouse(event, release, this, 3));
			context.addEventListener('contextmenu', event => event.preventDefault());
		}

		if (touch) {
			touch.addEventListener('touchstart', event => resolveTouch(event, hold, this), { passive: false });
			touch.addEventListener('touchend', event => resolveTouch(event, release, this), { passive: false });
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
