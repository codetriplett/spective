import Node from './node';

// adjust all numbers to desired decimals places
function snap (it, decimals = 3) {
	if (Array.isArray(it)) return it.map(item => snap(item, decimals));
	if (typeof it === 'number') return Number(it.toFixed(decimals));
	if (typeof it !== 'object') return;
	const object = {};

	for (const [name, value] of Object.entries(it)) {
		object[name] = snap(value, decimals);
	}

	return object;
}

let node;

beforeEach(() => {
	node = new Node();
	node._recalculate(0);
});

describe('Node', () => {
	it('creates node', () => {
		const actual = new Node();

		expect(actual).toEqual({
			nodes: new Set(),
			ox: 0, oy: 0, px: 0, py: 0, az: 0, sx: 1, sy: 1,
			oxs: 0, oys: 0, oxa: 0, oya: 0,
			pxs: 0, pys: 0, pxa: 0, pya: 0,
			azs: 0, aza: 0,
			sxs: 0, sys: 0, sxa: 0, sya: 0,
			cell: 0,
		});
	});

	it('updates asset and group', () => {
		const asset = { add: jest.fn() };
		const group = { add: jest.fn() };
		const actual = new Node();
		actual.update({ asset, group });
		expect(asset.add).toHaveBeenCalledWith(actual);
		expect(group.add).toHaveBeenCalledWith(actual);
	});

	it('updates param and oncollide', () => {
		const param = {};
		const oncollide = () => {};
		const actual = new Node();
		actual.update({ param, oncollide });

		expect(actual).toMatchObject({
			param,
			oncollide,
			collisions: new Set(),
		});
	});
});

describe('_recalculateBoundaries', () => {
	it('works with default properties', () => {
		node._recalculateBoundaries();
		const actual = snap(node._boundaries);
		expect(actual).toEqual([0, 1, 0, 1]);
	});

	it('works with updated origin', () => {
		node.update({ ox: 1, oy: 2 });
		node._recalculate(1);
		node._recalculateBoundaries();
		const actual = snap(node._boundaries);
		expect(actual).toEqual([-1, 0, -2, -1]);
	});

	it('works with updated position', () => {
		node.update({ px: 3, py: 4 });
		node._recalculate(1);
		node._recalculateBoundaries();
		const actual = snap(node._boundaries);
		expect(actual).toEqual([3, 4, 4, 5]);
	});

	it('works with quarter rotation', () => {
		node.update({ az: Math.PI / 2 });
		node._recalculate(1);
		node._recalculateBoundaries();
		const actual = snap(node._boundaries);
		expect(snap(actual)).toEqual([-1, 0, 0, 1]);
	});

	it('works with eighth rotation', () => {
		node.update({ az: Math.PI / 4 });
		node._recalculate(1);
		node._recalculateBoundaries();
		const actual = snap(node._boundaries);
		expect(snap(actual)).toEqual([-0.707, 0.707, 0, 1.414]);
	});

	it('works with all updated properties', () => {
		node.update({ ox: 1, oy: 2, px: 3, py: 4, az: Math.PI / 2 });
		node._recalculate(1);
		node._recalculateBoundaries();
		const actual = snap(node._boundaries);
		expect(actual).toEqual([4, 5, 3, 4]);
	});
});

describe('_findFromQueries', () => {
	it('matches against one tag', () => {
		node.tags = ['node'];
		const actual = node._findFromQueries([[['', 'node']]]);
		expect(actual).toEqual([node]);
	});

	it('matches against multiple tags', () => {
		node.tags = ['node', 'valid'];
		const actual = node._findFromQueries([[['', 'node', 'valid']]]);
		expect(actual).toEqual([node]);
	});

	it('does not match when all tags are missing', () => {
		node.tags = ['invalid'];
		const actual = node._findFromQueries([[['', 'valid']]]);
		expect(actual).toEqual([]);
	});

	it('does not match when one tag is missing', () => {
		node.tags = ['node', 'invalid'];
		const actual = node._findFromQueries([[['', 'node', 'valid']]]);
		expect(actual).toEqual([]);
	});

	it('matches parent and child node', () => {
		node.tags = ['node'];
		const child = node.add({ tags: ['child'] });
		const actual = node._findFromQueries([[['', 'node'], ['', 'child']]]);
		expect(actual).toEqual([child]);
	});

	it('matches just child node', () => {
		node.tags = ['node'];
		const child = node.add({ tags: ['child'] });
		const actual = node._findFromQueries([[['', 'child']]]);
		expect(actual).toEqual([child]);
	});
	
	it('matches against asset type', () => {
		node.paint({ type: 'asset' });
		const actual = node._findFromQueries([[['asset']]]);
		expect(actual).toEqual([node]);
	});
	
	it('matches against asset type and tags', () => {
		node.paint({ type: 'asset' });
		node.tags = ['node']
		const actual = node._findFromQueries([[['asset', 'node']]]);
		expect(actual).toEqual([node]);
	});

	// TODO: test limit param
});
