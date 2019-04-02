'use strict';

var easymidi = require('easymidi');

var inputs = [];
// Inputs == outputs
// var outputs = [];
let teensy = '';
let input = null;
let output = null;

// Waiting since not waiting would cause crashes from time to time
setTimeout(() => {
	inputs = easymidi.getInputs();

	// Finding teensy with piezo (Fiskehest)
	for (var i = 0; i < inputs.length; i++) {
	  let value = inputs[i];
	  if (value.substring(0, 9) === 'Fiskehest') {
	    teensy = value;
	  }
	};

	if (teensy) {
	  input = new easymidi.Input(teensy);
	  output = new easymidi.Output(teensy);
	};

	exports.noteListen = (callback) => {
		if (input) {
			return input.on('noteon', (msg) => {
			  const velocityFloat = msg.velocity / 127;
			  const note = msg.note;
			  callback(note, velocityFloat);
			});
		} else {
			callback('No teensy found', null);
		}
	};

	exports.ccListen = (callback) => {
		if (input) {
			return input.on('cc', (msg) => {
			  const valueFloat = msg.value / 127;
			  const controller = msg.controller;
			  callback(controller, valueFloat);
			});
		} else {
			callback('No teensy found', null);
		}
	};

	exports.noteSend = (note, velocity, channel) => {
		if (input) {
			output.send('noteon', {
			  note: note,
			  velocity: velocity,
			  channel: channel
			});
		} else {
			// console.log('No teensy found');
		}
	};

}, 5000);