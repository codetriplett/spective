import Asset from './asset';

export const defaultMesh = [
	0, 0, 0, 1, 0, 0, 1, 1, 0,
	1, 1, 0, 0, 1, 0, 0, 0, 0
];

// TODO: add code to read OBJ files
export default class Geometry {
	constructor (props = {}) {
		this.joints = Object.assign(new Asset(), { geometry: this });
		this.assets = new Set();
		this.update({ ...Geometry.defaultProps, ...props });
	}

	static defaultProps = { mesh: defaultMesh };

	// TODO: force mesh to be a lteral that can be compared between rendered
	// - url to .obj file or primiative definition like in old spective
	// - this isn't needed for sprites, but would need to be implemented for 3D objects
	update (props = {}) {
		Object.assign(this, props);
		if ('mesh' in props) this._mesh = props.mesh;
	}

	add (item = {}) {
		if (!('texture' in item)) {
			// joint properties are locked in once added to create the rigging for the base state skeleton
			// - TODO: figure out how nodes created from a geometry will control how their joints are updated
			const joint = this.joints.add(item);
			joint._recalculate(0);
			return joint;
		} else if (!(item instanceof Asset)) {
			item = new Asset(item);
		}

		// add asset to geometry
		item.geometry?.remove?.(item);
		item.geometry = this;
		this.assets.add(item);
		return item;
	}

	remove (item) {
		this.assets.delete(item);
	}

	destroy (relative) {
		const { layer, assets } = this;
		if (layer && layer !== relative) layer.remove(this);

		for (const asset of assets) {
			asset.destroy(this);
		}
	}
}
