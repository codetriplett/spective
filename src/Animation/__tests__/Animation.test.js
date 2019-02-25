import { organizeAnimation } from '../organize-animation';
import { Animation } from '../Animation';

jest.mock('../organize-animation', () => ({ organizeAnimation: jest.fn() }));

describe('Animation', () => {
	const calculate = jest.fn();

	class Instance extends Animation {
		constructor (properties, ...parameters) {
			super();

			this.properties = properties;
			this.activate(...parameters);
		}
	}

	beforeEach(() => { 
		window.Date.now = jest.fn().mockReturnValue(1000);
		organizeAnimation.mockClear();
		Instance.prototype.calculate = calculate.mockClear();
	});

	it('should apply update instantly', () => {
		organizeAnimation.mockReturnValue([[{ update: 3, add: 4 }]]);
		const actual = new Instance({ keep: 1, update: 2 }, 'parameters');
		
		expect(actual).toEqual({
			queue: [],
			properties: { keep: 1, update: 3, add: 4 }
		});

		calculate.mockClear();
		actual.animate(1200);

		expect(calculate).toHaveBeenCalledWith({ keep: 1, update: 3, add: 4 });
		
		expect(actual).toEqual({
			queue: [],
			properties: { keep: 1, update: 3, add: 4 }
		});
	});
	
	it('should apply update over a set amount of time', () => {
		organizeAnimation.mockReturnValue([[{ update: 3, add: 4 }, 200]]);
		const actual = new Instance({ keep: 1, update: 2 }, 'parameters');
		
		expect(actual).toEqual({
			timestamp: 1000,
			queue: [],
			changes: { update: 3, add: 4 },
			iterator: 200,
			looping: false,
			iteration: 0,
			duration: 200,
			existing: { keep: 1, update: 2 },
			properties: { keep: 1, update: 2, add: 0 }
		});

		calculate.mockClear();
		actual.animate(1100);

		expect(calculate).toHaveBeenCalledWith({ keep: 1, update: 2.5, add: 2 });
		
		expect(actual).toEqual({
			timestamp: 1000,
			queue: [],
			changes: { update: 3, add: 4 },
			iterator: 200,
			looping: false,
			iteration: 0,
			duration: 200,
			existing: { keep: 1, update: 2 },
			properties: { keep: 1, update: 2.5, add: 2 }
		});

		calculate.mockClear();
		actual.animate(1200);

		expect(calculate).toHaveBeenCalledWith({ keep: 1, update: 3, add: 4 });
		
		expect(actual).toEqual({
			queue: [],
			properties: { keep: 1, update: 3, add: 4 }
		});

		actual.animate(1500);

		expect(calculate).toHaveBeenCalledWith({ keep: 1, update: 3, add: 4 });
		
		expect(actual).toEqual({
			queue: [],
			properties: { keep: 1, update: 3, add: 4 }
		});
	});
	
	it('should apply update continuously over a set amount of time', () => {
		const iterator = jest.fn().mockReturnValue(200);
		organizeAnimation.mockReturnValue([[{ update: 3, add: 4 }, iterator]]);
		const actual = new Instance({ keep: 1, update: 2 }, 'parameters');
		
		expect(actual).toEqual({
			timestamp: 1000,
			queue: [],
			changes: { update: 3, add: 4 },
			iterator,
			looping: true,
			iteration: 0,
			duration: 200,
			existing: { keep: 1, update: 2 },
			properties: { keep: 1, update: 2, add: 0 }
		});

		calculate.mockClear();
		actual.animate(1300);

		expect(calculate).toHaveBeenCalledWith({ keep: 1, update: 6.5, add: 6 });
		
		expect(actual).toEqual({
			timestamp: 1200,
			queue: [],
			changes: { update: 3, add: 4 },
			iterator,
			looping: true,
			iteration: 1,
			duration: 200,
			existing: { keep: 1, update: 5, add: 4 },
			properties: { keep: 1, update: 6.5, add: 6 }
		});

		iterator.mockReturnValue();
		calculate.mockClear();
		actual.animate(1500);

		expect(calculate).toHaveBeenCalledWith({ keep: 1, update: 8, add: 8 });
		
		expect(actual).toEqual({
			queue: [],
			properties: { keep: 1, update: 8, add: 8 }
		});

		calculate.mockClear();
		actual.animate(2000);

		expect(calculate).toHaveBeenCalledWith({ keep: 1, update: 8, add: 8 });
		
		expect(actual).toEqual({
			queue: [],
			properties: { keep: 1, update: 8, add: 8 }
		});
	});
});
