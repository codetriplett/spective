import { loadResource } from '../load-resource';
import { createItem } from '../create-item';

jest.mock('../load-resource', () => ({ loadResource: jest.fn() }));

const render = jest.fn();
const initialize = jest.fn();
const update = jest.fn();
const callback = jest.fn();
let items;

describe('create-item', () => {
	beforeEach(() => {
		loadResource.mockClear().mockImplementation((source, complete) => complete('mockResource'));
		render.mockClear();
		initialize.mockClear();
		update.mockClear().mockReturnValue('mockUpdate');
		callback.mockClear();
		items = [];
	});

	it('should create an item', () => {
		const actual = createItem(render, items, initialize, update, 'source', callback);
		expect(items).toEqual([{ items: [] }]);
		expect(actual).toEqual(expect.any(Function));
	});

	it('should load resource', () => {
		createItem(render, items, initialize, update, 'source', callback);
		expect(loadResource).toHaveBeenCalledWith('source', expect.any(Function));
		expect(render).toHaveBeenCalledWith();
	});

	it('should run initialize function with loaded resource', () => {
		createItem(render, items, initialize, update, 'source', callback);
		expect(initialize).toHaveBeenCalledWith({ items: [] }, 'mockResource');
	});

	it('should set initialize property with loaded resource', () => {
		createItem(render, items, 'property', update, 'source', callback);
		expect(items[0].property).toBe('mockResource');
	});

	it('should run callback function with loaded resource if provided', () => {
		createItem(render, items, initialize, update, 'source', callback);
		expect(callback).toHaveBeenCalledWith(true, 'source');
	});

	it('should run callback function with empty resource if provided', () => {
		loadResource.mockImplementation((source, complete) => complete(undefined));
		createItem(render, items, initialize, update, 'source', callback);
		expect(callback).toHaveBeenCalledWith(false, 'source');
	});

	it('should not run callback function if one is not provided', () => {
		createItem(render, items, initialize, update, 'source', 'asdf');
		expect(callback).not.toHaveBeenCalled();
	});

	it('should run update function if properties are passed', () => {
		const actual = createItem(render, items, initialize, update, 'source', callback);
		actual('mockParameter');
		expect(update).toHaveBeenCalledWith(render, [], 'mockParameter');
	});

	it('should remove an item if no parameters are passed', () => {
		const actual = createItem(render, items, initialize, update, 'source', callback);
		render.mockClear();
		actual();

		expect(items).toEqual([]);
		expect(render).toHaveBeenCalled();
	});
});
