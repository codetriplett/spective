export function organizeSegments (...parameters) {
	const firstParameter = parameters[0];
	const ranges = [];
	const callbacks = [];
	let range = 1;

	while (parameters.length) {
		const parameter = parameters.shift();

		if (typeof parameter === 'function') {
			callbacks.push(parameter);
			ranges.push(range);
			range = 1;
		} else if (typeof parameter === 'number') {
			range = parameter;
		}
	}

	if (ranges.length > 1 && typeof firstParameter === 'function') {
		ranges[0] = 0;
	} else if (!ranges.length) {
		ranges.push(range);
	}

	let threshold = 0;

	return ranges.map((range, i) => {
		threshold += range;
		return { callback: callbacks[i], threshold }
	});
}
