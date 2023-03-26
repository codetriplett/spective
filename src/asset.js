import Node from './node';

export function parseColor (string) {
	// split into color codes
	const strings = string.slice(1).split('#');
	const integers = [];

	for (const string of strings) {
		// split into chars
		const chars = string.split('');

		// expand rgb values
		if (chars.length < 6) {
			const [r, g, b] = chars.splice(0, 3);
			chars.unshift(r, r, g, g, b, b);
		}

		// expand alpha value
		const remainder = chars.length % 3;
		if (remainder === 1) chars.push(chars[chars.length - 1]);
		else if (!remainder) chars.push('f', 'f');

		// convert to integers
		for (const i of [0, 2, 4, 6]) {
			const first = parseInt(chars[i], 16);
			const second = parseInt(chars[i + 1], 16);
			integers.push((first << 4) + second);
		}
	}

	// convert to proper type
	return new Uint8Array(integers);
}

export function buildCoordinates (cells, sx = 1, sy = 1, width = 1, height = 1) {
	return cells.map(([x, y]) => {
		const x1 = x / width;
		const y1 = y / height;
		const x2 = (x + sx) / width;
		const y2 = (y + sy) / height;

		return [
			x1, y2, x2, y2, x2, y1,
			x2, y1, x1, y1, x1, y2
		];
	});
}

export default class Asset {
	constructor (props = {}) {
		this.texture = undefined;
		this.nodes = new Set();
		this.update(Object.assign(Asset.defaultProps, props));
	}

	static defaultProps = { tags: '', cells: '0:0' };

	update (props = {}) {
		// protect the prototype properties and overwrite the rest
		const { texture } = Object.assign(this, props);

		// create new image or color texture
		if (typeof texture === 'string') {
			if (texture.startsWith('#')) {
				const array = parseColor(texture);
				this._texture = array;
				this._finalizeUpdate(props);
			} else {
				const el = new window.Image();
				el.src = texture;
				this._texture = undefined;

				el.addEventListener('load', () => {
					if (this.texture !== texture) return;
					this._texture = el;
					this._finalizeUpdate(props);
				});

				return;
			}
		}
		
		this._finalizeUpdate(props);
	}

	_finalizeUpdate (props) {
		let { nodes, tags, cells, sx, sy, _texture } = this;
		let scaleAssumed = false;

		// format tags if they are still pending
		if ('tags' in props && tags === props.tags) {
			const { tags } = props;
			const trimedTags = tags.trim();
			this._tags = trimedTags ? trimedTags.split(/\s+/) : [];
		}

		// format cells if they are still pending
		if ('cells' in props && cells === props.cells) {
			const { cells } = props;
			this._cells = cells ? cells.split(' ').map(cell => cell.split(':').map(it => Number(it))) : [];
		}

		// TODO: allow coordinates to be set in geometries that override the default ones here when set
		if ('texture' in props || _texture && 'cells' in props) {
			const isColor = _texture instanceof Uint8Array;
			const width = isColor ? _texture.length >> 2 : _texture?.width;
			const height = isColor ? 1 : _texture?.height;
			if (!('sx' in this)) this.sx = sx = width;
			if (!('sy' in this)) this.sy = sy = height;
			this._coordinates = buildCoordinates(this._cells, sx, sy, width, height);
			scaleAssumed = true;
		}

		// recalculate nodes if origin has changed
		if ('ox' in props || 'oy' in props) {
			for (const node of nodes) {
				node._origin = undefined;
			}
		}

		// recalculate nodes if scale has changed
		if ('sx' in props || 'sy' in props || scaleAssumed) {
			for (const node of nodes) {
				node._scale = undefined;
			}
		}
	}

	add (item = {}) {
		// create as node instance if not already
		if (!(item instanceof Node)) {
			item = new Node(item);
		}

		// add node to asset
		item.asset?.remove?.(item);
		item.asset = this;
		Object.assign(item, { _origin: undefined, _scale: undefined });
		this.nodes.add(item);
		return item;
	}

	remove (item) {
		item.asset = undefined;
		this.nodes.delete(item);
	}

	destroy (relative) {
		const { geometry, nodes } = this;
		if (geometry && geometry !== relative) geometry.remove(this);

		for (const node of nodes) {
			node.destroy(this);
		}
	}
}
