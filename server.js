const io = require('socket.io')();
const os = require('os');
const moment = require('moment');
const shell = require('shelljs');
const fs = require('fs');
// const Gpio = require('onoff').Gpio;

const osc = require('./modules/osc.js');
// const midi = require('./modules/midi.js');
const pwm = require('./modules/pwm.js');

// let localGpio = {
//   '2': null,
//   '3': null,
//   '4': null
// };

const update = () => {
  shell.exec('cd /home/pi/harpe-node && git pull && npm install && cd /home/pi/harpe-client && git pull && sudo reboot');
};

const oscError = (msg) => {
  osc.send(`/harp/${state.id}/error`, [
    {
      type: "s",
      value: msg
    }
  ]);
};

io.on('connection', (client) => {
  client.on('pwm', (channel, value) => {
    if (state.type === 'ebow') {
      const scaledValue = value / 1000;
      pwm.rotate(channel, scaledValue);
    }
  });
  // client.on('solenoid', (number, value) => {
  //   if (state.type === 'solenoid') {
  //     const numberOffset = number + 2;
  //     const numberAsString = numberOffset.toString();
  //     localGpio[numberAsString].writeSync(value);
  //   }
  // });
  client.on('restart', () => {
    shell.exec('sudo reboot');
  });
  client.on('update', () => {
    update();
  });
  client.on('updateAll', () => {
    osc.send('/harp/all/update');
  });
  client.on('oscSend', (address, value) => {
    osc.send(address, [
      {
        type: "s",
        value: value
      }
    ]);
  });
});

const port = 4001;
io.listen(port);

const getIp = () => {
  var interfaces = os.networkInterfaces();
  var addresses = [];
  for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  };

  return addresses[0];
};

// TODO:
// Do all the validation
// Initial ID is 0
// Change ID from GUI (rewrite file)
// If some other harp has the same ID show error

let state = {
  id: Number(fs.readFileSync('/home/pi/id', 'utf8').split(/\n/g)[0]) || 0,
  lastMidi: {},
  lastOsc: {},
  localIp: getIp(),
  hostName: os.hostname(),
  neighbours: [],
  type: null
};

console.log(`Harp ID: ${state.id}`);
console.log(`Harp IP: ${state.localIp}`);

if (state.id == 0) {
  console.log('Set harp ID! (in /home/pi/id)');
};

if (state.id <= 6) {
  // pwm = require('./modules/pwm.js');
  state.type = 'ebow';
  console.log('This is a ebow module');
} else if (state.id <= 12) {
  // localGpio = {
  //   '2': new Gpio(2, 'out'),
  //   '3': new Gpio(3, 'out'),
  //   '4': new Gpio(4, 'out')
  // };
  // localGpio['2'].writeSync(0);
  // localGpio['3'].writeSync(0);
  // localGpio['4'].writeSync(0);
  // state.type = 'solenoid';
  // console.log('This is a solenoid module');
} else {
  console.log('Not a valid ID');
}

osc.listen((message, info) => {
  state.lastOsc = {message, info};

  const messageArray = message.address.split("/");
  const item = messageArray[1] // harp
  const id = messageArray[2]; // 1, 2, 3, 4, 5 ...
  const department = messageArray[3]; // pwm, ping, update, ip, type, gpio
  const subId = messageArray[4]; // 1, 2, 3, 4, 5 ...
  let value = null;

  if (message && message.args[0]) {
    if (message.args.length > 1) {
      const valueArray = [];
      message.args.map((arg) => {
        valueArray.push(arg.value);
      });
      value = valueArray;
    } else {
      value = message.args[0].value;
    }
  };

  const validIncommingDepartments = ['pwm', 'ping', 'update', 'ip', 'type', 'gpio'];

  if (validIncommingDepartments.indexOf(department) == -1) {
    return;
  }

  if (department == 'ping') {

    const position = state.neighbours.map((neighbour) => { 
      return neighbour.id; 
    }).indexOf(id);
    
    if (position == -1) {
      state.neighbours.push({
        id: id,
        lastSeen: value
      });
    } else {
      state.neighbours[position].lastSeen = moment().valueOf();
    };
    return;
  };

  if (department == 'ip') {

    const position = state.neighbours.map((neighbour) => { 
      return neighbour.id; 
    }).indexOf(id);

    if (position == -1) {
      state.neighbours.push({
        id: id,
        ip: value
      });
    } else {
      state.neighbours[position].ip = value;
    };
    return;
  };

  if (department == 'type') {

    const position = state.neighbours.map((neighbour) => { 
      return neighbour.id; 
    }).indexOf(id);

    if (position == -1) {
      state.neighbours.push({
        id: id,
        type: value
      });
    } else {
      state.neighbours[position].type = value;
    };
    return;
  };

  // Break if message isn't intended for current server
  if (state.id != id || item != 'harp') {
    if (id != 'all') {
      return;
    }
  };

  if (department == 'pwm') {
    if (state.type === 'ebow') {
      const channel = subId ? subId : 0;
      pwm.rotate(channel, value);
    }
  }

  // if (department == 'gpio') {
  //   if (state.type === 'solenoid') {
  //     const number = subId ? subId : 0;
  //     const numberAsString = number.toString();
  //     localGpio[numberAsString].writeSync(value);
  //   }
  // }

  if (department == 'update') {
    update();
    return;
  };

});

setInterval(() => {
  // state.localIp = getIp();
  const now = moment().valueOf();

  // Send alive ping to network
  osc.send(`/harp/${state.id}/ping`, [
    {
      type: "s",
      value: now
    }
  ]);

  osc.send(`/harp/${state.id}/ip`, [
    {
      type: "s",
      value: state.localIp
    }
  ]);

  osc.send(`/harp/${state.id}/type`, [
    {
      type: "s",
      value: state.type
    }
  ]);

  // Remove dead neighbours
  state.neighbours.map((neighbour, i) => {
    const lastSeen = Number(neighbour.lastSeen);
    if (moment(lastSeen).isBefore(moment().subtract(2, 'seconds'))) {
      state.neighbours.splice(i, 1);
    };
  }); 

  // Send state to clients
  io.sockets.emit('FromAPI', state);

}, 1000);
