export class Button {
	constructor (name, instant, eventual) {
		const schedule = this.schedule.bind(this);
		const state = {};

		this.resolve = this.resolve.bind(this);
		this.instant = instant.bind(state);
		this.eventual = eventual.bind(state);
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
					schedule(true);
				}
			}
		});
		
		window.addEventListener('keyup', ({ key }) => {
			if (key === name) {
				schedule(false);
			}
		});
	}

	resolve () {
		this.eventual(this.stage);
		this.stage = 0;
	}

	schedule (down) {
		let { stage } = this;

		if (down && stage > 0 || !down && stage < 0) {
			return;
		}

		stage = -stage + (down ? 1 : -1);

		const { resolve, instant, timeout } = this;
		const delay = instant(stage);
		
		clearTimeout(timeout);

		if (delay >= 0) {
			this.stage = stage;
			this.timeout = setTimeout(resolve, delay);
		} else {
			this.stage = 0;
		}
	}
}
