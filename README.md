# Spective
This library provides a simple way to create 3d scenes in your browser. spective.min.js can be found in the dist folder and is around 6kB.

## Scenes
Call the main function to have it create a scene that takes up the full size of the window and automatically resizes. You can set up multiple scenes on one page by passing existing canvas elements each time you call the main function.

### Create Scene
```js
var scene = spective();
```

### Update Camera
```js
scene({
	rotation: Math.PI / 4,
	tilt: Math.PI / 4
});
```

### Update Camera with Multiple Properties
The transformation of each set of properties will be processed fully before moving on to the next. The following example will rotate the camera around a fixed point 6 units away from the center of the scene.
```js
scene({
	rotation: Math.PI / 4,
	tilt: Math.PI / 4
}, {
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
Array of RGB integers from 0 to 255.

### Coordinates
Every two numbers in the array define the horizontal and vertical placement of each vertex in the image. Values must be between 0 and 1. 0 places it at the left or bottom edge of the image. 1 places it at the right or top edge.

### Image
Path to an image to be loaded.

### Create Asset with Color
```js
var asset = geometry([63, 127, 255);
```

### Create Asset with Image
```js
var asset = geometry('image.jpg', [
	0, 0, 1, 0, 0, 1, 1, 1
]);
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
```js
instance({
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
The relative size.

### Rotation
The angle in radians along the y axis.

### Tilt
The angle in radians along the x axis.

### Spin
The angle in radians along the z axis.

### Position
The placement along the x, y and z axis.
