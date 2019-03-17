export function organizeSegments (...parameters) {
	const callbacks = [];
	const ranges = [];
	let totalRange = 0;
	let undefinedRanges = 0;
	let range;

	while (parameters.length) {
		const parameter = parameters.shift();

		if (typeof parameter === 'function') {
			if (range !== undefined) {
				totalRange += range;
			} else {
				undefinedRanges++;
			}

			callbacks.push(parameter);
			ranges.push(range);
			range = undefined;
		} else if (typeof parameter === 'number') {
			range = parameter;
		}
	}
	
	let value = 0;
	let callback;

	if (!ranges.length) {
		ranges.push(range);
		undefinedRanges = 1;
	} else if (ranges.length > 1 && ranges[0] === undefined) {
		ranges.shift();
		undefinedRanges--;
		callback = callbacks.shift();
	}

	const step = undefinedRanges ? (1 - (totalRange % 1)) / undefinedRanges : 0;

	return ranges.map((range, i) => {
		const segment = {
			lowerValue: value,
			lowerCallback: callback
		};

		value += range !== undefined ? range : step;
		callback = callbacks[i];

		return {
			...segment,
			upperValue: value,
			upperCallback: callback
		};
	});
}
