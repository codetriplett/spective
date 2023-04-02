/**
 * @license MIT
 * Copyright (c) 2023 Jeff Triplett
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import Scene from './scene';
import Layer from './layer';
import Geometry from './geometry';
import Asset from './asset';
import Node from './node';
import Control, { controls } from './control';

export const document = {
	createTextNode () {
		return;
	},
	createDocumentFragment () {
		return {
			childNodes: [],
			appendChild (child) {
				this.removeChild(child);
				this.childNodes.push(child);
				child.parentElement = this;
			},
			insertBefore (child, sibling) {
				const { childNodes } = this;
				this.removeChild(child);
				const index = childNodes.indexOf(sibling);
				childNodes.splice(index, 0, child);
				child.parentElement = this;
			},
			removeChild (child) {
				const { childNodes } = this;
				const index = childNodes.indexOf(child);
				if (index === -1) return;
				childNodes.splice(index, 1);
				child.parentElement = null;
			},
		};
	},
	createElement (tagName) {
		tagName = tagName.toLowerCase();

		// instantiate appropriate class
		const element = new {
			scene: Scene,
			layer: Layer,
			geometry: Geometry,
			asset: Asset,
			node: Node,
		}[tagName]();

		// add document expected add/remove functions
		return Object.assign(element, {
			tagName,
			childNodes: [],
			appendChild: item => element.add(item),
			insertBefore: item => element.add(item),
			removeChild: item => item.destroy(),
		});
	},
};

export function updater (item, props, prevNames, defaultProps) {
	if (prevNames) {
		prevNames = new Set(prevNames);

		const changedEntries = Object.entries(props).filter(([name, value]) => {
			prevNames.delete(name);
			return value !== item[name] && (name.length > 3 || value !== undefined);
		});

		for (const name of prevNames) {
			changedEntries.push([name, defaultProps[name]]);
		}

		if (!changedEntries.length) return;
		props = Object.fromEntries(changedEntries);
	} else {
		const id = props.id;

		if (id && (!Object.prototype.hasOwnProperty.call(window, id) || window[id]._instance === item)) {
			window[id] = item;
		}
	}

	item.update(props);
};

const defaultProps = {
	scene: Scene.defaultProps,
	layer: Layer.defaultProps,
	geometry: Geometry.defaultProps,
	asset: Asset.defaultProps,
	node: Node.defaultProps,
};

export const LEFT = 0;
export const RIGHT = 1;
export const BOTTOM = 2;
export const TOP = 3;

function spective (...params) {
	const [props = {}] = params;
	return 'key' in props ? new Control(...params) : new Scene(...params);
}

window.spective = Object.assign(spective, {
	Scene,
	Layer,
	Geometry,
	Asset,
	Node,
	Control,
	controls,
	framework: [document, updater, defaultProps],
	LEFT: 0,
	RIGHT: 1,
	BOTTOM: 2,
	TOP: 3,
});
