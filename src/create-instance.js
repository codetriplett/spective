export function createInstance (geometrySource, ...creationParameters) {
	const { updateItem, loadAsset, geometries } = this;
	const instance = {};
	let anchor;

	if (typeof geometrySource !== 'string') {
		anchor = geometrySource;

		if (!anchor.children) {
			anchor.children = [];
		}

		instance.anchor = anchor;
		anchor.children.push(instance);
		geometrySource = creationParameters[0];
		creationParameters.shift();
	}
	
	let assetSource = creationParameters[0];

	if (typeof assetSource !== 'string') {
		assetSource = '#fff';
	} else {
		creationParameters.shift();
	}

	const asset = loadAsset(geometrySource, assetSource);

	if (!creationParameters.length) {
		return;
	}
	
	asset.instances.push(instance);
	updateItem(instance, ...creationParameters);

	return (...updateParameters) => {
		if (!updateParameters.length) {
			const instances = asset.instances;
			instances.splice(instances.indexOf(instance), 1);
	
			if (!instances.length) {
				const assets = geometries[geometrySource].assets;
				delete assets[assetSource];
	
				if (!Object.keys(assets).length) {
					delete geometries[geometrySource];
				}
			}

			return;
		} else if (typeof updateParameters[0] === 'string') {
			if (!instance.children) {
				instance.children = [];
			}

			const child = createInstance.call(this, instance, ...updateParameters);
			instance.children.push(child);
			return child;
		}

		updateItem(instance, ...updateParameters);
	};
}
