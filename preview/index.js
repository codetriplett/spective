(function () {
const { TOP, BOTTOM, controls } = spective;
const PLAYER_TEXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAGUExURQAAAAAAAKVnuc8AAAACdFJOU/8A5bcwSgAAAAlwSFlzAAAOwwAADsMBx2+oZAAAACZJREFUGFdjYGRkYAASjGAMYsE4QALIh4jAGGAWiA8WhKoBIkZGAAWMACXaroMbAAAAAElFTkSuQmCC';
const PLATFORM_TEXTURE = '#000';
const GRAVITY = -100;
const BLOCKING_PARAM = { isBlocking: true };

function ondraw () {
	const { px, py } = player;
	scene.update({ px, py });
}

function oncollide (event) {
	const { action, side, param } = event;

	if (action === 'collide' && param.isBlocking) {
		const { pys } = player;
		return side === BOTTOM && pys < 0 || side === TOP && pys > 0 ? { pys: 0 } : {};
	}
}

const scene = spective({ id: 'scene', width: 160, height: 90, density: 4, ondraw });
const mainLayer = scene.add({ parallax: 1 });
const playerAsset = mainLayer.add({ texture: PLAYER_TEXTURE });
const platformAsset = mainLayer.add({ texture: PLATFORM_TEXTURE, oy: 1 });
const player = playerAsset.add({ id: 'player', pya: GRAVITY, oncollide });
platformAsset.add( { px: -50, sx: 100, sy: 4, param: BLOCKING_PARAM });

function onReleaseAD () {
	player.update({ pxs: controls.has(leftControl) ? -30 : controls.has(rightControl) ? 30 : 0 });
}

spective({ key: ' ' }, () => player.update({ pys: 50 }));
const leftControl = spective({ key: 'a' }, () => player.update({ pxs: -30 }), onReleaseAD);
const rightControl = spective({ key: 'd' }, () => player.update({ pxs: 30 }), onReleaseAD);
})();
