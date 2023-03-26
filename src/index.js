import Scene from './scene';
import Layer from './layer';
import Geometry from './geometry';
import Asset from './asset';
import Node from './node';
import Control, { controls } from './control';

const defaultProps = {
	scene: Scene.defaultProps,
	layer: Layer.defaultProps,
	geometry: Geometry.defaultProps,
	asset: Asset.defaultProps,
	node: Node.defaultProps,
};

export const document = {
	createTextNode () {
		return;
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

export function updater (item, props, prevNames) {
	if (prevNames) {
		const { tagName } = item;
		prevNames = new Set(prevNames);

		const changedEntries = Object.entries(props).filter(([name, value]) => {
			prevNames.delete(name);
			return value !== item[name] && (name.length > 3 || value !== undefined);
		});

		for (const name of prevNames) {
			changedEntries.push([name, defaultProps[tagName][name]]);
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
	framework: [document, updater],
	LEFT: 0,
	RIGHT: 1,
	BOTTOM: 2,
	TOP: 3,
});
