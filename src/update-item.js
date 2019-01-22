import { calculateMatrix } from './calculate-matrix';

export function updateItem (render, item, ...matrices) {
	item.matrix = calculateMatrix(...matrices);
	item.inverse = calculateMatrix(true, ...matrices);
	render();
}
