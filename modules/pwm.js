'use strict';

var i2cBus = require("i2c-bus");
var Pca9685Driver = require("pca9685").Pca9685Driver;
 
var options = {
	i2c: i2cBus.openSync(1),
	address: 0x40,
	frequency: 50,
	debug: true
};

var pwm = new Pca9685Driver(options, function(err) {
  if (err) {
		console.error("Error initializing PCA9685");
		process.exit(-1);
  }

  console.log("Initialization done");

  pwm.setPulseRange(0, 42, 255);

  // Set the pulse length to 1500 microseconds for channel 2
  pwm.setPulseLength(0, 1500);

 //  function turnOn() {
	// 	pwm.channelOn(0);
	// }
	// function turnOff() {
	// 	pwm.channelOff(0);
	// }
	// turnOn();
	// setTimeout(turnOff,2000);
});


exports.rotate = (channel, value) => {
	pwm.setDutyCycle(channel, value);
};