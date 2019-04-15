function getIndex (index, length) {
	index = index < 0 ? length + index : index;
	return Math.min(Math.max(0, index), length - 1);
}

export function linkItems (items, index = 0) {
	const { length } = items;

	items.forEach(item => {
		item.branches = item.branches.map((branch, i) => {
			if (typeof branch !== 'number') {
				return branch;
			}
			
			return items[getIndex(branch, length)];
		});
	});

	index = typeof index === 'number' ? index : 0;

	return items[getIndex(index, length)];
}
