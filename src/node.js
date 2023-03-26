import Asset from './asset';
import { addMatrices, multiplyMatrices } from './matrix';

const hitboxVertices = [[0, 0], [1, 0], [1, 1], [0, 1]];

export default class Node {
	constructor (props) {
		Object.assign(this, Node.defaultProps);
		this.nodes = new Set();
		if (props) this.update(props);
	}

	static defaultProps = {
		ox: 0, oy: 0, px: 0, py: 0, az: 0, sx: 1, sy: 1,
		oxs: 0, oys: 0, oxa: 0, oya: 0,
		pxs: 0, pys: 0, pxa: 0, pya: 0,
		azs: 0, aza: 0,
		sxs: 0, sys: 0, sxa: 0, sya: 0,
		cell: 0
	};

	update (props = {}) {
		if ('asset' in props) {
			this.asset?.remove?.(this);
			props.asset.add(this);
		}

		if ('group' in props) {
			this.group?.remove?.(this);
			props.group.add(this);
		}

		// set new properties
		const { oncollide, collisions } = Object.assign(this, props);

		// format tags if they are still pending
		if ('tags' in props) {
			const { tags } = props;
			const trimedTags = tags.trim();
			this._tags = trimedTags ? trimedTags.split(/\s+/) : [];
		}

		if ('oncollide' in props) {
			if (!oncollide) {
				this.collisions = undefined;
			} else if (!collisions) {
				this.collisions = new Set();
			}
		}

		this._finalizeUpdate(props);
	}

	_finalizeUpdate (props) {
		// invalidate precalculated values that need to be updated
		if ('ox' in props || 'oy' in props) this._origin = undefined;
		if ('px' in props || 'py' in props) this._position = undefined;
		if ('az' in props) this._rotation = undefined;
		if ('sx' in props || 'sy' in props) this._scale = undefined;

		// set whether acceleration of any kind is active if any have changed
		if ('oxa' in props || 'oya' in props || 'pxa' in props || 'pya' in props || 'aza' in props || 'sxa' in props || 'sya' in props) {
			const { oxa, oya, pxa, pya, aza, sxa, sya } = this;
			this._aActive = !!(oxa || oya || pxa || pya || aza || sxa || sya);
		}

		// set whether speed of any kind is active if any have changed
		if ('oxs' in props || 'oys' in props || 'pxs' in props || 'pys' in props || 'azs' in props || 'sxs' in props || 'sys' in props) {
			const { oxs, oys, pxs, pys, azs, sxs, sys } = this;
			this._sActive = !!(oxs || oys || pxs || pys || azs || sxs || sys);
		}
	}

	add (item = {}) {
		// create as node instance if not already
		if (!(item instanceof Node)) {
			item = new Node(item);
		}

		// add node to group
		item.group?.remove?.(item);
		item.group = this;
		this.nodes.add(item);
		return item;
	}

	remove (item) {
		item.group = undefined;
		this.nodes.delete(item);
	}

	destroy (relative) {
		const { group, asset, nodes } = this;
		if (group && group !== relative) group.remove(this);
		if (asset && asset !== relative) asset.remove(this);

		for (const node of nodes) {
			node.destroy(this);
		}
	}

	find (query, limit) {
		// return this node if it satisfies callback
		const { nodes } = this;
		const matches = [];

		// check if this node is a match
		if (typeof query === 'string') {
			const queries = query.split(',').map(query => {
				return query.trim().split(/\s+/).map(query => {
					return query.split('.');
				})
			});

			return this._findFromQueries(queries, limit);
		} else if (typeof query !== 'function') {
			return matches;
		} else if (query(this)) {
			matches.push(this);
			limit -= 1;
		}

		// pass callback along to child nodes to find the first match
		for (const node of nodes) {
			if (limit <= 0) break;
			const nodeMatches = node.find(query, limit);
			matches.push(...nodeMatches);
			limit -= nodeMatches.length;
		}

		return matches;
	}

	_findFromQueries (queries, limit) {
		const matches = [];
		const { _tags = [], asset, nodes } = this;
		const allTags = asset ? [...asset._tags, ..._tags] : _tags;
		const type = asset?.type || '';
		const childQueries = [];
		let didMatch = false;

		for (const [expected, ...remaining] of queries) {
			const [expectedType, ...expectedTags] = expected;
			if (expectedType !== type) continue;
			const isMatch = expectedTags.every(expected => allTags.some(tag => tag === expected));
			if (!isMatch) continue;
			if (remaining.length) childQueries.push(remaining);
			else didMatch = true;
		}
	
		if (didMatch) {
			matches.push(this);
			limit -= 1;
		}
	
		childQueries.push(...queries);
	
		for (const node of nodes) {
			if (limit <= 0) break;
			const childMatches = node._findFromQueries(childQueries, limit);
			matches.push(...childMatches);
			limit -= childMatches.length;
		}
	
		return matches;
	}

	paint (item = {}) {
		if (!(item instanceof Asset)) {
			item = new Asset(item);
		}

		const { asset } = this;

		// remove from previous asset
		if (asset) {
			asset.nodes.delete(this);
		}
		
		// add to new asset
		item.add(this);
		return item;
	}

	_applyPhysics (elapsedTime, frameCount) {
		const { group, _lastPhysicsFrame } = this;
		if (_lastPhysicsFrame === frameCount) return;
		if (group) group._applyPhysics(elapsedTime, frameCount);
		this._lastPhysicsFrame = frameCount;
		let { _aActive, _sActive, oxs, oys, pxs, pys, azs, sxs, sys } = this;
		const props = {};

		// use accelerations to adjust speed
		if (_aActive) {
			const { oxa, oya, pxa, pya, aza, sxa, sya } = this;
			if (oxa) props.oxs = oxs += oxa * elapsedTime;
			if (oya) props.oys = oys += oya * elapsedTime;
			if (pxa) props.pxs = pxs += pxa * elapsedTime;
			if (pya) props.pys = pys += pya * elapsedTime;
			if (aza) props.azs = azs += aza * elapsedTime;
			if (sxa) props.sxs = sxs += sxa * elapsedTime;
			if (sya) props.sys = sys += sya * elapsedTime;
		} else if (!_sActive) {
			// skip update if no speed is active
			return;
		}

		// use speed to adjust other values
		const { ox, oy, px, py, az, sx, sy } = this;
		if (oxs) props.ox = ox + oxs * elapsedTime;
		if (oys) props.oy = oy + oys * elapsedTime;
		if (pxs) props.px = px + pxs * elapsedTime;
		if (pys) props.py = py + pys * elapsedTime;
		if (azs) props.az = az + azs * elapsedTime;
		if (sxs) props.sx = sx + sxs * elapsedTime;
		if (sys) props.sy = sy + sys * elapsedTime;

		// update values affected by speed
		this.update(props);
	}

	_recalculate (frameCount, relative) {
		// process parent if needed then check if node needs an update
		const { group } = this;
		if (group) group._recalculate(frameCount, this);

		// only recalculate if any of the previous calculations where invalidated
		let { asset, nodes, _composite, _position, _origin, _rotation, _scale, _inverted } = this;
		if (_composite && _position && _origin && _rotation && _scale) return;
		this._lastCalculatedFrame = frameCount;

		// update rotation, scale and matrix if needed
		if (!_rotation || !_scale) {
			if (!_rotation) {
				const { az } = this;
				const cos = Math.cos(az);
				const sin = Math.sin(az);
				this._rotation = [cos, -sin, sin, cos];
			}
	
			if (!_scale) {
				let { sx, sy } = this;

				// apply asset scale
				if (asset) {
					sx *= asset.sx || 1;
					sy *= asset.sy || 1;
				}

				this._scale = _inverted ? [1 / sx, 0, 0, 1 / sy] : [sx, 0, 0, sy];
			}

			// create new matrix that includes all updates
			({ _rotation, _scale } = this);
			this._matrix = _inverted ? multiplyMatrices(_scale, _rotation) : multiplyMatrices(_rotation, _scale);
			_origin = undefined;
		}

		// update composites
		const { _matrix } = this;
		this._composite = group ? multiplyMatrices(group._composite, _matrix) : _matrix;

		// update position if needed
		if (!_position || !_composite) {
			const { px, py } = this;
			let position = _inverted ? [-px, -py] : [px, py];

			// apply parent composite matrix
			if (group) {
				position = multiplyMatrices(position, group._composite);
				position = addMatrices(position, group._position);
			}

			this._position = position;
		}

		// update origin if needed
		if (!_origin || !_composite) {
			let { ox, oy, _composite } = this;

			// apply asset origin
			if (asset) {
				ox += asset.ox || 0;
				oy += asset.oy || 0;
			}

			this._origin = multiplyMatrices(_inverted ? [ox, oy] : [-ox, -oy], _composite);
		}

		// invalidate child nodes and trigger recalculate for all but the one that is already in progress
		for (const node of nodes) {
			node._composite = undefined;
			if (node === relative) continue;
			node._recalculate(frameCount, this);
		}
	}

	_recalculateBoundaries () {
		const { _composite, _position, _origin, _boundaries } = this;
	
		const vertices = hitboxVertices.map(vertex => {
			const multipliedVertex = multiplyMatrices(vertex, _composite);
			return addMatrices(multipliedVertex, _position, _origin);
		});
	
		const xValues = vertices.map(vertex => vertex[0]);
		const yValues = vertices.map(vertex => vertex[1]);
		const left = Math.min(...xValues);
		const right = Math.max(...xValues);
		const bottom = Math.min(...yValues);
		const top = Math.max(...yValues);
		this._boundaries = [left, right, bottom, top];
	}
}
