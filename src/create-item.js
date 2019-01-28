import { loadResource } from './load-resource';

export function createItem (render, items, initialize, update, ...parameters) {
	const source = parameters[0];
	const callback = parameters[1];
	const item = {};
	
	if (initialize !== update) {
		item.items = [];
	}

	items.push(item);

	if (typeof source === 'string') {
		loadResource(source, resource => {
			if (typeof initialize === 'string') {
				item[initialize] = resource;
			} else {
				initialize(item, resource);
			}

			if (typeof callback === 'function') {
				callback(!!resource, source);
			}
			
			render();
		});
	} else {
		initialize(render, item, ...parameters);
		render();
	}

	return (...parameters) => {
		if (parameters.length === 0) {
			items.splice(items.indexOf(item), 1);
			render();
			return;
		}

		return update(render, item.items || item, ...parameters);
	};
}
