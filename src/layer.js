import Geometry from './geometry';

export default class Layer {
	constructor (props = {}) {
		this.library = Object.assign(new Geometry(), { layer: this });
		this.geometries = new Set();
		this.update({ ...Layer.defaultProps, ...props });
	}

	static defaultProps = { parallax: 1 };

	update (props = {}) {
		Object.assign(this, props);
	}

	add (item = {}) {
		if (!('mesh' in item)) {
			return this.library.add(item);
		} else if (!(item instanceof Geometry)) {
			item = new Geometry(item);
		}

		// add geometry to layer
		item.layer?.remove?.(item);
		item.layer = this;
		this.geometries.add(item);
		return item;
	}

	remove (item) {
		this.geometries.delete(item);
	}

	destroy (relative) {
		const { scene, geometries } = this;
		if (scene && scene !== relative) scene.remove(this);

		for (const geometry of geometries) {
			geometry.destroy(this);
		}
	}
}
