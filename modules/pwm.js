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

  if (value < 0 || value > 1) {
    console.log('Value less than 0 or more than 1');
    return;
  }

	pwm.setDutyCycle(Number(channel), value);
};