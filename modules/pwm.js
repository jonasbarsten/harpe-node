'use strict';

const i2cBus = require("i2c-bus");
const Pca9685Driver = require("pca9685").Pca9685Driver;
 
const options = {
	i2c: i2cBus.openSync(1),
	address: 0x40,
	frequency: 50,
	debug: false
};

const pwm = new Pca9685Driver(options, function(err) {
  if (err) {
		console.error("Error initializing PCA9685");
		process.exit(-1);
  }

  console.log("PWM initialization done");

  pwm.setPulseRange(0, 42, 255);
  pwm.setPulseLength(0, 1500);

});

exports.rotate = (channel, value) => {

	console.log(channel);
	console.log(value);

	let validChannel = true;
	let validValue = true;

  if (Number(value) < 0 || Number(value) > 1) {
    console.log('Value must be between 0 and 1');
    validValue = false;
  };

  if (Number(channel) < 0 || Number(channel) > 15) {
    console.log('Channel must be from 0 to 15');
    validChannel = false;
  }

  if (validChannel && validValue) {
  	pwm.setDutyCycle(channel, value);
  }
};