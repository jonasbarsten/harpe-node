'use strict';

var osc = require('osc');

let oscPortReady = false;
let outAddress = "192.168.1.255";
let outPort = 8050;
let inPort = 8050;
let udpPort = null;

exports.open = () => {
	udpPort = new osc.UDPPort({
	  localAddress: "0.0.0.0",
	  localPort: inPort,
	  metadata: true,
	  broadcast: true
	});

	udpPort.open();

	udpPort.on("ready", () => {
	  oscPortReady = true;
	});
};

exports.listen = (callback) => {
	// No need to wait for port to open since it opens at the end of this file
	return udpPort.on("osc", (message, info) => {
		callback(message, info);
	});
};

exports.close = () => {
	oscPortReady = false;
	udpPort.close();
};

exports.send = (address, args) => {
	if (oscPortReady) {
	  udpPort.send({
		  address: address,
		  args: args
		}, outAddress, outPort);
	}
};

exports.sendLocal = (address, args) => {
	if (oscPortReady) {
		udpPort.send({
			address: address,
			args: args
		}, "127.0.0.1", outPort);
	}
};

exports.changeOutPort = (port) => {
	this.close();
	outPort = port;
	this.open();
};

exports.changeInPort = (port) => {
	this.close();
	inPort = port;
	this.open();
};

this.open();