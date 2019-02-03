export function mergeValues (existing, update) {
	if (typeof existing === 'object') {
		const isArray = Array.isArray(existing);
		const object = isArray ? [] : {};
		
		if (!isArray && typeof update !== 'object') {
			update = { rotation: update };
		}

		for (const key in existing) {
			const { [key]: value = update } = update;
			object[key] = mergeValues(existing[key], value);
		}

		return object;
	} else if (typeof update !== 'number') {
		return existing;
	}

	return update;
}
