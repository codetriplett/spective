import spective, { Scene, Layer, Geometry, Asset, Node, Control, controls, framework, LEFT, RIGHT, BOTTOM, TOP, COLLIDE_ACTION, SEPARATE_ACTION, KEY_INPUT, TOUCH_INPUT } from './module';

Object.assign(spective, {
	Scene,
	Layer,
	Geometry,
	Asset,
	Node,
	Control,
	controls,
	framework,
	LEFT,
	RIGHT,
	BOTTOM,
	TOP,
	COLLIDE_ACTION,
	SEPARATE_ACTION,
	KEY_INPUT,
	TOUCH_INPUT,
});

if (typeof window === 'object') {
	window.spective = spective;
} else if (typeof module === 'object') {
	module.exports = spective;
}
