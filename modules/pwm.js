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
	// TODO: validation
	console.log(channel);
	console.log(value);
  pwm.setDutyCycle(channel, value);
};