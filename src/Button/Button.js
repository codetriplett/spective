export class Button {
	constructor (name, ...parameters) {
		const resolve = this.resolve.bind(this);
		const actions = [];
		const state = {};

		parameters.forEach(parameter => {
			if (typeof parameter === 'function') {
				actions.push(parameter.bind(state));
			}
		});

		this.resolve = resolve;
		this.actions = actions;
		this.index = 0;
		this.stage = 0;

		if (name.toLowerCase() === 'space') {
			name = ' ';
		}

		if (name.toLowerCase() === 'delete') {
			name = 'Delete';
		}
		
		window.addEventListener('keydown', ({ repeat, key }) => {
			if (!repeat) {
				if (key === name) {
					resolve(true);
				}
			}
		});
		
		window.addEventListener('keyup', ({ key }) => {
			if (key === name) {
				resolve(false);
			}
		});
	}

	resolve (down) {
		const { resolve, actions, timeout } = this;
		let { index, stage } = this;

		if (down === true && stage > 0 || down === false && stage < 0) {
			return;
		} else if (down !== undefined) {
			stage = -stage + (down ? 1 : -1);
			this.stage = stage;
		} else {
			index += 1;
			this.index = index;
		}
		
		clearTimeout(timeout);

		const maxiumum = actions.length - 1;
		const iteration = Math.max(0, index - maxiumum);
		const delay = actions[index - iteration](stage, iteration);

		if (delay >= 0) {
			this.timeout = setTimeout(resolve, delay);
		} else {
			this.index = 0;
			this.stage = 0;
		}
	}
}
