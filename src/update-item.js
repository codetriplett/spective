import { calculateMatrix } from './calculate-matrix';

export function updateItem (render, item, position) {
	item.matrix = calculateMatrix(position);
	item.inverse = calculateMatrix(true, position);
	render();
}
