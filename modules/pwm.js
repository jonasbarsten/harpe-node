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
		// process.exit(-1);
  }

  console.log("PWM initialization done");

  // pwm.setPulseRange(0, 42, 255);
  // pwm.setPulseLength(0, 1500);

});

exports.rotate = (channel, value) => {

	const numberChannel = Number(channel);
	const numberValue = Number(value);

	if (numberValue < 0 || numberValue > 1) {
		console.log(`PWM value must be between 0. and 1. (got ${numberValue})`);
		return;
	}

	if (numberChannel < 0 || numberChannel > 15) {
		console.log(`PWM channel must be between 0 and 15 (got ${numberChannel})`);
		return;
	}

	if (numberChannel % 1 != 0) {
		console.log(`PWM channel must be a whole number (got ${numberChannel})`);
		return;
	}

	if (process.argv[2] == 'debug') {
		console.log(`Outgoing PWM channel: ${numberChannel}`);
		console.log(`Outgoing PWM value: ${numberValue}`);
	}

  pwm.setDutyCycle(numberChannel, numberValue);
};