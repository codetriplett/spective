export function formatItem (item, branches = [], index = 0) {
	const items = [{ item }];
	const indices = [];
	let location = index + 1;

	branches.forEach(branch => {
		if (typeof branch === 'number') {
			indices.push(branch);
		} else if (Array.isArray(branch)) {
			indices.push(location);
			items.push(...branch);

			branch[0].previous = index;
			location += branch.length;
		}
	});

	if (indices.length) {
		items[0].branches = indices;
	}

	return items;
}
