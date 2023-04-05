import spective, {
	Scene, Layer, Geometry, Asset, Node, COLLIDE_ACTION, SEPARATE_ACTION,
	Control, controls, KEY_INPUT, CLICK_INPUT, CONTEXT_INPUT, TOUCH_INPUT,
	framework, LEFT, RIGHT, BOTTOM, TOP,
} from './module';

Object.assign(spective, {
	Scene, Layer, Geometry, Asset, Node, COLLIDE_ACTION, SEPARATE_ACTION,
	Control, controls, KEY_INPUT, CLICK_INPUT, CONTEXT_INPUT, TOUCH_INPUT,
	framework, LEFT, RIGHT, BOTTOM, TOP,
});

if (typeof window === 'object') {
	window.spective = spective;
} else if (typeof module === 'object') {
	module.exports = spective;
}
