function isConnected (first, second) {
	const { previous, next } = first;
	return previous === second || next === second;
}

export function gatherBranches (item, opposite) {
	const { previous, next } = item;
	const reversed = opposite.previous === item;
	const main = reversed ? [previous, next] : [next, previous];
	let { branches = [] } = item;

	branches = [...main, ...branches].reduce((branches, branch) => {
		if (branch === undefined || branch === opposite) {
			return branches;
		} else if (isConnected(branch, item) || isConnected(item, branch)) {
			return [...branches, [branch, item]];
		}

		return [...branches, ...gatherBranches(branch, item)];
	}, []);

	return branches;
}
