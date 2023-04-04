import spective, { Scene, Layer, Geometry, Asset, Node, Control, controls, framework, LEFT, RIGHT, BOTTOM, TOP } from './module';

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
});

if (typeof window === 'object') {
	window.spective = spective;
} else if (typeof module === 'object') {
	module.exports = spective;
}
