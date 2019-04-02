function extractAction (parameters, fallback, state) {
	const actionable = typeof parameters[0] === 'function';

	if (actionable === !state || !parameters.length) {
		return fallback;
	}

	const action = parameters.shift();
	return state ? action.bind(state) : action;
}

function scheduleMeter (change, item) {
	return Math.abs(change) * (item > 0 ? item : 0);
}

function iterateMeter (change, item) {
	const iterator = 1 / change < 0 ? -1 : 1;
	const { items } = this;
	let { index } = this;

	if (typeof item === 'number') {
		return item + iterator;
	} else if (items) {
		index += iterator;
		this.index = index;
		return items[index]; 
	}
}

export function organizeActions (...parameters) {
	const state = {};
	const schedule = extractAction(parameters, scheduleMeter, state);
	let item = extractAction(parameters, 0);
	let iterate = extractAction(parameters, iterateMeter, state);

	if (iterate === iterateMeter) {
		if (Array.isArray(item)) {
			iterate = iterate.bind({ items: item, index: 0 });
			item = item[0];
		} else {
			iterate = iterate.bind({});
		}
	}

	return [schedule, item, iterate];
}
