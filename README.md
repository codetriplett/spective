# Spective
This library provides a simple way to create 2D graphics in your browser. Scenes are made up of a hierarchy of just a few types of nodes, and support physics and collisions.

## Scene
A scene will add a canvas to your page to display graphics and also serves as the camera node. It can be created in the following ways.

```js
const scene = spective({ ...props });
const scene = new Scene({ ...props });
```

### Canvas Properties
|Name|Default|Description|
|----|-------|-----------|
|density|2|Higher values will render more pixels to improve the sharpness of your scene.|
|width|640|The width of the canvas on your page.|
|height|360|The height of the canvas on your page.|
|canvas||Allows you to set your own canvas element instead of having a new one created.|
|div||Allows you to set a div, meant to hold your UI, that will be positioned over the canvas that was created.|

### Camera Properties
Allows the same orientation props as Node instances, described further down.

## Layer
Layers are flat planes that sprites can be placed into and can be set up to support parallax effects. They are added directly to the scene instance.

```js
const layer = scene(new Layer({ ...props }))
const layer = scene({ ...props }) // must have parallax prop
```

### Properties
|Name|Default|Description|
|----|-------|-----------|
|parallax|1|Determines how much sprites will move when camera position is updated. Movement will be reduced as value approaches zero and will reverse for negative numbers. Movement will increase for numbers greater than 1.|

## Asset
Assets are images that can be reused within your scene. They can be added to a layer instance to have them move in relation to the camera position, or directly to the scene to make them a part of the UI.

```js
// add to layer
const asset = layer(new Asset({ ...props }))
const asset = layer({ ...props }) // must have texture prop

// add to UI
const asset = scene(new Asset({ ...props }))
const asset = scene({ ...props }) // must have texture prop
```

### Properties
|Name|Default|Description|
|----|-------|-----------|
|texture||The image used for the sprite instances created from this asset. Can either be a path to an image, or a hexadecimal color value as a string starting with '#'.|
|cells|0:0|Allows you to create sepearate cells from the image for nodes to use. Colon separates x and y coordinates and space can be used to create more cells.|
|sx||A custom width for cells of the image.|
|sy||A custom height for cells of the image.|
|ox||A custom adjustment to the X position of the pivot point of the image.|
|oy||A custom adjustment to the Y position of the pivot point of the image.|

## Node
Nodes are instances of sprites. They can also hold other nodes to form a group of sprites that move as one group. They can also add code that will run when collisions occur with other nodes.

```js
// add to asset (harder to manage, but can avoid setting asset prop)
const node = asset(new Asset({ ...props }))
const node = asset({ ...props }) // if no parallax, mesh, or texture prop is found

// add to layer
const node = layer(new Asset({ ...props }))
const node = layer({ ...props }) // if no parallax, mesh, or texture prop is found

// add to UI
const node = scene(new Asset({ ...props }))
const node = scene({ ...props }) // if no parallax, mesh, or texture prop is found
```

### Hierarchy Properties
|Name|Default|Description|
|----|-------|-----------|
|group||The group to tie node to. Can also add node to group node directly instead of setting this prop.|
|asset||The asset to paint the sprite with. Can also add node to asset directly instead of setting this prop.|
|cell|0|The cell to use from the ones the asset has set up.|

### Orientation Properties
|Name|Default|Description|
|----|-------|-----------|
|px|0|X position.|
|py|0|Y position.|
|az|0|Z angle (counter-clockwise around axis into screen).|
|ox|0|X position of the pivot point.|
|oy|0|Y position of the pivot point.|
|sx|1|X scale.|
|sy|1|Y scale.|

### Animation
Any of the above properties can be given a speed and/or acceleration to update the values over time. The names of these animation props match the orientation props they will affect, except with an 's' or 'a' appended to them.

### Collision Properties
|Name|Default|Description|
|----|-------|-----------|
|param||Marks node as collidable and is passed to any oncollide functions that are called as a result.|
|oncollide||A function that will be called if this node intersects with any other nodes with a param set.|

oncollide function will recieve an event object with the following props.

|Name|Options|Description|
|----|-------|-----------|
|action|'collide', 'separate'|The type of even that has occured. 'separate' indicates that two previously collided objects no longer intersect.|
|type|'COLLIDE_ACTION', 'SEPARATE_ACTION'|Constant form of action value. Should use spective.COLLIDE_ACTION and spective.SEPARATE_ACTION when making comparisions.
|side|0, 1, 2, 3|The side of the node that called oncollide that has collided with the node sending the param. The LEFT, RIGHT, BOTTOM, TOP constants, read from the spective module, map to these values and should be used instead of comparing the number values directly.

## Declarative Layouts
Declarative programming is a method of describing what the layout of your scene should be in response to state changes. It is a great way to abstract many of the complex tasks needed to manage your scene. Spective can be used along with another library, named Stew to make this possible. Just be sure to pass it the framework object for spective to switch it from its normal front-end mode. The following example assumes you have included both the stew and spective scripts onto your page. Intructions for how Stew works can be found here, .

```js
stew('', ['scene', {},
	['layer', {},
		['asset', { texture: '/player.png' }
			['node', { pya: -100, oncollide: () => {} }]
		],
		['asset', { texture: '#000', oy: 1 }
			['node', { px: -50, sx: 100, sy: 4, param: {} }]
		],
	],
], spective.framework);
```

## Controls
Controls listen for changes to various inputs you choose. Create an instance by passing info on what to listen for to the Control class, followed by the hold and release callback functions. Controls can listen to multiple types of input in one instance and the state of the control can be found by checking if it currently exists in the 'controls' set read from the spective function.

```js
const spaceControl = new spective.Control({ key: ' ' }, onHold, onRelease) // triggered by space key
const touchControl = new spective.Control({ touch: touchEl }, onHold, onRelease) // triggered by touch events on touchEl
const comboControl = new spective.Control({ key: ' ', touch: touchEl }, onHold, onRelease) // triggered by either
spective.controls.has(spaceControl); // check if spaceControl is currently held
```

### Initialization Properties
|Name|Default|Description|
|----|-------|-----------|
|key||Listen for keyboard events. The values match the ones used by the 'key' prop in JavaScript's 'keydown' and 'keyup' listeners.|
|click||Listen for left clicks on HTML element.|
|context||Listen for right clicks on HTML element.|
|touch||Listen for touchscreen events on an HTML element.|

### Callback Properties
The hold and release callback functions will receive an event object with the following properties.

|Name|Options|Description|
|----|-------|-----------|
|input|'key', 'click', 'context', 'touch'|The input type that triggered the callback.|
|type|'KEY_INPUT', 'CLICK_INPUT', 'CONTEXT_INPUT', 'TOUCH_INPUT'|Constant form of input value. Should use spective.KEY_INPUT, spective.CLICK_INPUT, spective.CONTEXT_INPUT, and spective.TOUCH_INPUT when making comparisions.|
|control||The Control instance that triggered the callback.|

## Geometries (coming soon)
Technically 3D objects are allowed and exist in the hierarchy between layers and assets. Assets simply defualt to using a square. Currently, the ability to set custom UV coordinates is still be worked out. It should also be able to parse OBJ files once finished.
