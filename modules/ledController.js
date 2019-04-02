'use strict';

const uuid = require('uuid/v4');
const util = require('util');
const logUpdate = require('log-update');
var artnet = require('artnet')(
	{host: '127.0.0.1'}
);

const numberOfPuffs = 4;
const ledsInRow = 4;
const outputRate = 30;
let updateRate = 500;
const rgbwDefault = [20,20,20,20];
let rgbwSum = [0,0,0,0];
let mainTimer = null;

let state = {
	layers: {}
};

const newLayer = () => {
	const layerId = uuid();
	let obj = {};
	state.layers[layerId] = {
		'0': [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
		'1': [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
		'2': [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
	};
	return layerId;
}

// exports.setColor = (newRgbw) => {
// 	rgbw = newRgbw;
// };

// exports.setUpdateRate = (newUpdateRate) => {
// 	console.log(newUpdateRate);
// 	updateRate = newUpdateRate;
// };

exports.clearAll = (puffNumber) => {
	state.layers = {};
};

exports.allOff = (puffNumber) => {
	var self = {};
	let rgbw = rgbwDefault;
	const layerId = newLayer();
	let master = 1;

	const output = () => {
		state.layers[layerId]['0'] = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
		state.layers[layerId]['1'] = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
		state.layers[layerId]['2'] = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
	};

	const kill = () => {
		delete state.layers[layerId];
	};

	const changeColor = (color) => {
		rgbw = color;
	};

	const changeMaster = (value) => {
		master = value;
	};

	self.changeMaster = changeMaster;
	self.output = output;
	self.kill = kill;
	self.changeColor = changeColor;

	return self;
};

exports.allOn = (puffNumber) => {
	var self = {};
	let rgbw = rgbwDefault;
	const layerId = newLayer();
	let master = 1;

	const output = () => {

		let rgbwPostMaster = [];

		rgbw.map((color) => {
			const newColor = Number(color * master).toFixed(0);
			rgbwPostMaster.push(Number(newColor));
		});

		state.layers[layerId]['0'] = [rgbwPostMaster, rgbwPostMaster, rgbwPostMaster, rgbwPostMaster];
		state.layers[layerId]['1'] = [rgbwPostMaster, rgbwPostMaster, rgbwPostMaster, rgbwPostMaster];
		state.layers[layerId]['2'] = [rgbwPostMaster, rgbwPostMaster, rgbwPostMaster, rgbwPostMaster];

		// console.log(state.layers[layerId]);
	};

	const kill = () => {
		delete state.layers[layerId];
	};

	const changeColor = (color) => {
		rgbw = color;
	};

	const changeMaster = (value) => {
		master = value;
	};

	self.changeMaster = changeMaster;
	self.output = output;
	self.kill = kill;
	self.changeColor = changeColor;

	return self;
};

exports.random = (puffNumber, mode, randomColor) => {

	// randomColor = true/false

	var self = {};
	let rgbw = rgbwDefault;
	const layerId = newLayer();
	let randomAmount = 0; // 0 - 100 (0 = max random, 100 = ikke random)
	let master = 1;

	const getRandomInt = (min, max) => {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	const getRandomLed = () => {
		let led = [];

		if (randomColor) {
			// No white because that's cooler
			led = [getRandomInt(0, 255), getRandomInt(0, 255), getRandomInt(0, 255), 0];
		} else {
			let randomIntensityLed = [];
			rgbw.map((color) => {
				const newColor = Number(color * Math.random()).toFixed(0);
				randomIntensityLed.push(Number(newColor));
			});

			led = randomIntensityLed;
		};

		return led;
	};

	const output = () => {

		const newLed = getRandomLed();
		let rgbwPostMaster = [];

		newLed.map((color) => {
			const newColor = Number(color * master).toFixed(0);
			rgbwPostMaster.push(Number(newColor));
		});

		switch(mode) {
			case 1:
				state.layers[layerId]['0'] = [rgbwPostMaster, rgbwPostMaster, rgbwPostMaster, rgbwPostMaster];
				state.layers[layerId]['1'] = [rgbwPostMaster, rgbwPostMaster, rgbwPostMaster, rgbwPostMaster];
				state.layers[layerId]['2'] = [rgbwPostMaster, rgbwPostMaster, rgbwPostMaster, rgbwPostMaster];
				break;
			case 2:
				state.layers[layerId]['0'][getRandomInt(0, 3)] = rgbwPostMaster;
				state.layers[layerId]['1'][getRandomInt(0, 3)] = rgbwPostMaster;
				state.layers[layerId]['2'][getRandomInt(0, 3)] = rgbwPostMaster;
				break;
			case 3:
				const position = getRandomInt(0, 3);
				let newLine = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
				newLine.map((led, i) => {
					if (i == position) {
						newLine[i] = rgbwPostMaster;
					};
				});
				state.layers[layerId]['0'] = newLine;
				state.layers[layerId]['1'] = newLine;
				state.layers[layerId]['2'] = newLine;
				break;
			default:
				state.layers[layerId]['0'] = [rgbwPostMaster, rgbwPostMaster, rgbwPostMaster, rgbwPostMaster];
				state.layers[layerId]['1'] = [rgbwPostMaster, rgbwPostMaster, rgbwPostMaster, rgbwPostMaster];
				state.layers[layerId]['2'] = [rgbwPostMaster, rgbwPostMaster, rgbwPostMaster, rgbwPostMaster];
		}

		
	};

	const kill = () => {
		delete state.layers[layerId];
	};

	const changeColor = (color) => {
		rgbw = color;
	};

	const changeRandomAmount = (randomAmount) => {
		randomAmount = randomAmount;
	};

	const changeMaster = (value) => {
		master = value;
	};

	self.changeMaster = changeMaster;
	self.output = output;
	self.changeRandomAmount = changeRandomAmount;
	self.kill = kill;
	self.changeColor = changeColor;

	return self;
};

exports.rotatePuffHorizontally = (puffNumber, reverse, preDelayTics, postDelayTics) => {

	if (!reverse) {
		let reverse = false;
	};

	var self = {};

	let lines = [
		this.rotateLineHorisontally(puffNumber, "0", reverse, preDelayTics, postDelayTics),
		this.rotateLineHorisontally(puffNumber, "1", reverse, preDelayTics, postDelayTics),
		this.rotateLineHorisontally(puffNumber, "2", reverse, preDelayTics, postDelayTics)
	];

	// Object.keys(state[puffNumber]).map((key, index) => {
	// 	lines.push(this.rotateLineHorisontally(puffNumber, key, reverse, preDelayTics, postDelayTics));
	// });

	const output = () => {
		lines.map((line) => {
			line.output();
		});
	};

	const changeColor = (color) => {
		lines.map((line) => {
			line.changeColor(color);
		});
	};

	const kill = () => {
		lines.map((line) => {
			line.kill();
		});
	};

	const changeMaster = (value) => {
		lines.map((line) => {
			line.changeMaster(value);
		});
	};

	self.changeMaster = changeMaster;
	self.output = output;
	self.kill = kill;
	self.changeColor = changeColor;

	return self;

};

exports.rotatePuffVertically = (puffNumber, reverse) => {

	var self = {};
	let rgbw = rgbwDefault;
	const layerId = newLayer();
	let tic = 1;
	let master = 1;

	if (reverse) {
		tic = 3;
	};

	const output = () => {

		let rgbwPostMaster = [];

		rgbw.map((color) => {
			const newColor = Number(color * master).toFixed(0);
			rgbwPostMaster.push(Number(newColor));
		});

		state.layers[layerId]['0'] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
		state.layers[layerId]['1'] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
		state.layers[layerId]['2'] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

		if (tic == 1) {state.layers[layerId]['0'] = [rgbwPostMaster,rgbwPostMaster,rgbwPostMaster,rgbwPostMaster]};
		if (tic == 2) {state.layers[layerId]['1'] = [rgbwPostMaster,rgbwPostMaster,rgbwPostMaster,rgbwPostMaster]};
		if (tic == 3) {state.layers[layerId]['2'] = [rgbwPostMaster,rgbwPostMaster,rgbwPostMaster,rgbwPostMaster]};

		if (reverse) {
			tic = tic - 1;
		} else {
			tic = tic + 1;
		};
		
		if (reverse) {
			if (tic == 0) {tic = 3};
		} else {
			if (tic == ledsInRow) {tic = 1};
		};
	};

	const changeColor = (color) => {
		rgbw = color;
	};

	const kill = () => {
		delete state.layers[layerId];
	};

	const changeMaster = (value) => {
		master = value;
	};

	self.changeMaster = changeMaster;
	self.output = output;
	self.changeColor = changeColor;
	self.kill = kill;

	return self;

};

exports.rotatePuffDiagonally = (puffNumber, mode, preDelayTics, postDelayTics) => {

	var self = {};
	let lines = [];

	if (!mode) {
		let mode = 1;
	};

	if (!preDelayTics) {
		let preDelayTics = 0;
	};

	if (!postDelayTics) {
		let postDelayTics = 0;
	};

	if (mode == 1) {
		lines.push(this.rotateLineHorisontally(puffNumber, '0', false, 0, 2));
		lines.push(this.rotateLineHorisontally(puffNumber, '1', false, 1, 2));
		lines.push(this.rotateLineHorisontally(puffNumber, '2', false, 2, 2));
	};

	if (mode == 2) {
		lines.push(this.rotateLineHorisontally(puffNumber, '0', true, 0, 2));
		lines.push(this.rotateLineHorisontally(puffNumber, '1', true, 1, 2));
		lines.push(this.rotateLineHorisontally(puffNumber, '2', true, 2, 2));
	};

	if (mode == 3) {
		lines.push(this.rotateLineHorisontally(puffNumber, '0', false, 2, 2));
		lines.push(this.rotateLineHorisontally(puffNumber, '1', false, 1, 2));
		lines.push(this.rotateLineHorisontally(puffNumber, '2', false, 0, 2));
	};

	if (mode == 4) {
		lines.push(this.rotateLineHorisontally(puffNumber, '0', true, 2, 2));
		lines.push(this.rotateLineHorisontally(puffNumber, '1', true, 1, 2));
		lines.push(this.rotateLineHorisontally(puffNumber, '2', true, 0, 2));
	};

	const output = () => {
		lines.map((line) => {
			line.output();
		});
	};

	const changeColor = (color) => {
		lines.map((line) => {
			line.changeColor(color);
		});
	};

	const kill = () => {
		lines.map((line) => {
			line.kill();
		});
	};

	const changeMaster = (value) => {
		lines.map((line) => {
			line.changeMaster(value);
		});
	};

	self.changeMaster = changeMaster;
	self.output = output;
	self.kill = kill;
	self.changeColor = changeColor;

	return self;

};

exports.rotateLineHorisontally = (puffNumber, lineNumber, reverse, preDelayTics, postDelayTics) => {

	var self = {};
	let rgbw = rgbwDefault;
	const layerId = newLayer();
	let tics = 1;
	let master = 1;

	if (preDelayTics) {
		tics = tics - preDelayTics;
	};

	const output = () => {

		let rgbwPostMaster = [];

		rgbw.map((color) => {
			const newColor = Number(color * master).toFixed(0);
			rgbwPostMaster.push(Number(newColor));
		});

		if (tics > 0 && tics < ledsInRow + 1) {
			if (reverse) {
				switch(tics) {
					case 1:
						state.layers[layerId][lineNumber] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], rgbwPostMaster];
						break;
					case 2:
						state.layers[layerId][lineNumber] = [[0, 0, 0, 0], [0, 0, 0, 0], rgbwPostMaster, [0, 0, 0, 0]];
						break;
					case 3:
						state.layers[layerId][lineNumber] = [[0, 0, 0, 0], rgbwPostMaster, [0, 0, 0, 0], [0, 0, 0, 0]];
						break;
					case 4:
						state.layers[layerId][lineNumber] = [rgbwPostMaster, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
						break;
					default:
						state.layers[layerId][lineNumber] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
				}
			} else {
				switch(tics) {
					case 1:
						state.layers[layerId][lineNumber] = [rgbwPostMaster, [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
						break;
					case 2:
						state.layers[layerId][lineNumber] = [[0, 0, 0, 0], rgbwPostMaster, [0, 0, 0, 0], [0, 0, 0, 0]];
						break;
					case 3:
						state.layers[layerId][lineNumber] = [[0, 0, 0, 0], [0, 0, 0, 0], rgbwPostMaster, [0, 0, 0, 0]];
						break;
					case 4:
						state.layers[layerId][lineNumber] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], rgbwPostMaster];
						break;
					default:
						state.layers[layerId][lineNumber] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
				}
			}
		} else {
			state.layers[layerId][lineNumber] = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
		};

		tics = tics + 1;

		if (postDelayTics) {
			if (tics == ledsInRow + 1 + postDelayTics) {
				tics = 1;
			};
		} else {
			if (tics == ledsInRow + 1) {
				if (preDelayTics) {
					tics = tics - preDelayTics;
				} else {
					tics = 1;
				};
			}
		}
	};

	const changeColor = (color) => {
		rgbw = color;
	};

	const kill = () => {
		delete state.layers[layerId];
	}

	const changeMaster = (value) => {
		master = value;
	};

	self.changeMaster = changeMaster;
	self.output = output;
	self.kill = kill;
	self.changeColor = changeColor;

	return self;
};

// exports.stop = () => {
// 	clearTimeout(mainTimer);
// };

exports.outputOnce = () => {

	let sum = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	let allLayers = [];

	// Flatten layers
	Object.keys(state.layers).map((key, index) => {
		const combinedArray = [
			[].concat.apply([], state.layers[key]['0']),
			[].concat.apply([], state.layers[key]['1']),
			[].concat.apply([], state.layers[key]['2'])
		];

		const flatArray = [].concat.apply([], combinedArray);
		allLayers.push(flatArray);
	});

	// Summarize layers
	allLayers.map((layer) => {
		layer.map((color, i) => {
			let newColor = 0;

			if (color == 0) {
				newColor = sum[i];
			} else if (sum[i] == 0) {
				newColor = color;
			} else {
				newColor = (sum[i] + color) / 2;
			};

			if (newColor > 255) {
				newColor = 255;
			} else if (newColor < 0) {
				newColor = 0;
			};

			sum[i] = newColor;
		});
	});

	artnet.set(1, 1, sum);

	// console.log(util.inspect(state.layers, false, null));

  // const lineOne = sum.slice(0, 16);
  // const lineTwo = sum.slice(16, 32);
  // const lineThree = sum.slice(32, 48);

  // console.log(lineOne);
  // console.log(lineTwo);
  // console.log(lineThree);

  // logUpdate(
		// `
		//  ${lineOne}
		//  ${lineTwo}
		//  ${lineThree}
		// `
  // );
}

exports.start = () => {
	this.outputOnce();
	mainTimer = setTimeout(this.start, outputRate);
};

this.start();