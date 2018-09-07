# Spective
This library provides a simple way to create 3d scenes in your browser. Each function call will either update an entity or create a child. spective.min.js can be found in the dist folder and is less than 7kB.

## Scenes
Call the main function to have it create a scene that takes up the full size of the window and automatically resizes. You can set up multiple scenes on one page by passing existing canvas elements as the first parameter each time you call the main function. Any properties that are passed when creating the scene will be used to place the camera in that scene.

### Create Scene
A function can also be passed as the last parameter. This function will be called before each render and provides the time that has passed since the previous render. This is useful for incrementally updating properties for animations or determining the frames per second.
```js
var scene = spective({
	rotation: Math.PI / 4,
	tilt: Math.PI / 4
}, function (elapsedTime) {
	// scene upates
});
```

### Update Camera
Properties that were used to create the scene or in previous updates will not be remembered in future updates.
```js
scene({
	rotation: Math.PI / 2,
	tilt: Math.PI / 4,
	position: [0, 0, -6]
});
```

### Update Camera with Multiple Properties
The transformation of each set of properties will be processed fully before moving on to the next. The following example will move the camera 1 unit up, rotate and tilt it and then move it 6 units back.
```js
scene({
	position: [0, 1, 0]
}, {
	rotation: Math.PI / 4,
	tilt: Math.PI / 4,
	position: [0, 0, -6]
});
```

### Resize Camera
```js
scene({});
```

### Pause and Resume Camera
```js
scene();
```

## Geometries
Geometries define each unique shape in the scene. The first value defines the faces and the second defines the vertices.

### Faces
Every three integers in the array define the index of first, second and third vertex of each face.

### Vertices
Every three numbers in the array define the x, y and z positions of each vertex.

### Create Geometry
```js
var geometry = scene([
	0, 1, 2, 3, 2, 1
], [
	-1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, 1
]);
```

### Delete Geometry
```js
geometry();
```

## Assets
Assets provide painted versions of a geometry. The first value defines either the color or an image and the second defines the coordinates for the image.

### Color
Array of RGB integers from 0 to 255. Multple colors can be defined and used in the same asset.

### Coordinates
When using an image, every two numbers in the array will define the horizontal and vertical placement in the image for each vertex. 0 places it at the left or bottom edge of the image. 1 places it at the right or top edge. The image will repeat if numbers less than 0 or greater than 1 are used. When using a set of colors, each number will be the index of the color to use for each vertex.

### Image
Path to an image to be loaded.

### Create Asset with Color
```js
var asset = geometry([63, 127, 255]);
```

### Create Asset with Multiple Colors
You must include the alpha channel when defining multiple colors.
```js
var asset = geometry([
	255, 0, 0, 255,
	0, 255, 0, 255,
	0, 0, 255, 255
], [
	0, 1, 2
]);
```

### Create Asset with Image
A function can be passed as a last parameter. That function will be called once the image has finished loading or if it fails. The first parameter will be the name of the image and the second will tell whether it was successful. This is useful for checking if all images have been loaded before displaying the scene.
```js
var asset = geometry('image.jpg', [
	0, 0, 1, 0, 0, 1, 1, 1
], function (name, loaded) {
	// check image
});
```

### Delete Asset
```js
asset();
```

## Instances
Instances place assets in a scene.

### Create Instance
```js
var instance = asset({
	position: [0, 0.5, 0],
	rotation: Math.PI / 4
});
```

### Update Instance
Properties that were used to create the instance or in previous updates will not be remembered in future updates.
```js
instance({
	position: [0, 0.5, 0],
	rotation: 0.5
});
```

### Update Instance with Multiple Properties
The transformation of each set of properties will be processed fully before moving on to the next. The following example will set a radius of 1 unit to the right before rotating the object around the center of the scene.
```js
instance({
	position: [1, 0, 0]
}, {
	rotation: 0.5
});
```

### Delete Instance
```js
instance();
```

## Properties
Cameras and instances all use the same properties. Transformations occur in the order below.

### Scale
The relative size along the x, y and z axis. A single value can also be used instead of an array.

### Rotation
The angle in radians along the y axis.

### Tilt
The angle in radians along the x axis.

### Spin
The angle in radians along the z axis.

### Position
The placement along the x, y and z axis.
