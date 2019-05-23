const io = require('socket.io')();
const os = require('os');
const moment = require('moment');
const shell = require('shelljs');
const fs = require('fs');

// var ledController = require('./modules/ledController.js');
const osc = require('./modules/osc.js');
const midi = require('./modules/midi.js');
const pwm = require('./modules/pwm.js');

// const programMap = require('./modules/programMap.js').content;

const update = () => {
  shell.exec('cd /home/pi/harpe-node && git pull && npm install && cd /home/pi/harpe-client && git pull && sudo reboot');
};

// const revertToStable = () => {
//   shell.exec('cd /home/pi/puff-node && git checkout 5d0e2e12ef947f7c62960af37cf741ff9c6742b5 && git fetch && npm install && sudo reboot');
// };

const oscError = (msg) => {
  osc.send(`/harp/${state.localIp}/error`, [
    {
      type: "s",
      value: msg
    }
  ]);
};

io.on('connection', (client) => {
  // client.on('runFunction', (functionName, args) => {
  //   ledController[functionName](...args);
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

// TODO: Get ID from text-doc in user folder
// Do all the validation
// Initial ID is 0
// Show warning if ID is 0 and tell user to change it
// Change ID from GUI (rewrite file)
// If some other harp has the same ID show error

let state = {
  // cableLight: 0,
  // activeLayers: {},
  id: Number(fs.readFileSync('/home/pi/id', 'utf8').split(/\n/g)[0]) || 0,
  lastMidi: {},
  lastOsc: {},
  localIp: getIp(),
  hostName: os.hostname(),
  neighbours: [],
  // piezo: [0,0,0,0,0,0,0,0],
  // piezoThreshold: 0.4,
  // disabledPiezos: [],
  // piezoMax: [0,0,0,0,0,0,0,0],
  // piezoSumMax: 0
};

// const fadeCable = (amount) => {
//   state.cableLight = state.cableLight + amount;
//   midi.noteSend(0, state.cableLight, 1);
// };

// setTimeout(() => {

//   let direction = null;

//   setInterval(() => {
//     if (state.cableLight == 0) {
//       direction = 'up';
//     } else if (state.cableLight == 127) {
//       direction = 'down';
//     };

//     if (direction == 'up') {
//       fadeCable(1);
//     }

//     if (direction == 'down') {
//       fadeCable(-1);
//     }
//   }, 30);
// }, 8000);

// setTimeout(() => {
//   // Calibrate piezos on startup
//   state.piezoThreshold = state.piezoSumMax + 0.05;
//   console.log('Piezo threshold set to ' + state.piezoThreshold + ' :)');
// }, 30000);

// setTimeout(() => {

//   // The piezos in the puffs behave differently
//   switch (state.localIp) {
//     case "10.0.128.131":
//       state.disabledPiezos =  [2, 3];
//       break;
//     case "10.0.128.140":
//       state.disabledPiezos =  [1, 2, 3];
//       break;
//     default:
//       break;
//   }

//   // Waiting since not waiting would cause crashes from time to time
//   midi.noteListen((note, value) => {

//     // Have to mute som piezos due to noise
//     const activePiezo = state.disabledPiezos.indexOf(note);

//     if (activePiezo == -1) {
//       state.piezo[note] = value;
//     }

//     const piezoSum = state.piezo.reduce((a, b) => a + b, 0);

//     if (state.piezo[note] > state.piezoMax[note]) {
//       state.piezoMax[note] = state.piezo[note]; 
//       // console.log(state.piezoMax);
//     }

//     if (piezoSum > state.piezoSumMax) {
//       state.piezoSumMax = piezoSum; 
//       // console.log(state.piezoSumMax);
//     }

//     // Piezo
//     if (note == 0 || note == 1 || note == 2 || note == 3) {
//       osc.send(`/puff/${state.localIp}/piezo/${note}`, [
//         {
//           type: "f",
//           value: value
//         }
//       ]);

//       if (piezoSum > state.piezoThreshold && state.activeLayers["1"]) {
//         osc.sendLocal(`/puff/${state.localIp}/lights/layer/1/master`, [
//           {
//             type: "f",
//             value: 1
//           }
//         ]);
//         setTimeout(() => {
//           osc.sendLocal(`/puff/${state.localIp}/lights/layer/1/master`, [
//             {
//               type: "f",
//               value: 0
//             }
//           ]);
//         }, 500)
//       }

//     };
//   });

//   midi.ccListen((controller, value) => {
//     // Compass
//     if (controller == 1) {
//       osc.send(`/puff/${state.localIp}/orientation`, [
//         {
//           type: "f",
//           value: value * 360
//         }
//       ]);
//     };
//   });
// }, 8000);

osc.listen((message, info) => {
  state.lastOsc = {message, info};

  const messageArray = message.address.split("/");

  const item = messageArray[1] // harp
  // const ip = messageArray[2]; // 10.0.128.142 ...
  const id = messageArray[2]; // 1, 2, 3, 4, 5 ...
  const department = messageArray[3]; // pwm, ping, update
  const subId = messageArray[4]; // 1, 2, 3, 4, 5 ...
  // const lightsGroup = messageArray[4]; // layer or global
  // const layerNumber = messageArray[5]; // 1, 2, 3, 4 ...
  // const layerFunc = messageArray[6]; // start, stop, speed, color, program, piezo, magneticNorth, preOffset or postOffset
  let value = null;

  // console.log('message: ' + messageArray);
  // console.log('item: ' + item);
  // console.log('ip: ' + ip);
  // console.log('department: ' + department);

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

  // console.log('value: ' + value);

  const validIncommingDepartments = ['pwm', 'ping', 'update'];

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

  // Break if message isn't intended for current server
  if (state.id != id || item != 'harp') {
    if (id != 'all') {
      return;
    }
  };

  if (department == 'pwm') {
    const channel = subId ? subId : 0;
    pwm.rotate(channel, value);
  }

  // let globalLayer = false;

  // if (ip == 'all') {
  //   globalLayer = true;
  // }

  // if (department == 'cableLight') {
  //   let velocity = Math.round(127 * value);
  //   if (velocity < 0) {
  //     velocity = 0;
  //   } else if (velocity > 127) {
  //     velocity = 127;
  //   };
  //   midi.noteSend(0, velocity, 1);
  //   return;
  // };

  if (department == 'update') {
    update();
    return;
  };

  // if (lightsGroup == 'global') {
  //   if (value == 'clearAll') {
  //     Object.keys(state.activeLayers).map((key) => {
  //       clearTimeout(state.activeLayers[key].timer);
  //       state.activeLayers[key].running = false;
  //     });
  //     state.activeLayers = {};
  //     ledController.clearAll("0");
  //     return;
  //   };
  // };

  // if (lightsGroup == 'layer') {
  //   const validLayer = Number.isInteger(parseInt(layerNumber));
  //   if (!validLayer) {
  //     console.log('Not a valid layer');
  //     oscError('Not a valid layer number (ex. 2)');
  //     return;
  //   };

  //   const layerIsActive = state.activeLayers[layerNumber];

  //   // New layer
  //   if (!layerIsActive) {
  //     let newLayer = {
  //       speed: 500,
  //       running: false,
  //       color: [20, 20, 20, 20],
  //       preOffset: 0,
  //       postOffset: 0,
  //       piezo: false,
  //       magneticNorth: false,
  //       timer: null,
  //       func: null,
  //       program: 'line-s',
  //       master: 1,
  //       global: globalLayer
  //     };

  //     // TODO: validation on every case
  //     switch (layerFunc) {
  //       case 'start':
  //         newLayer.running = true;
  //         break;
  //       case 'stop':
  //         newLayer.running = false;
  //         break;
  //       case 'speed':
  //         newLayer.speed = value;
  //         break;
  //       case 'color':
  //         newLayer.color = value;
  //         break;
  //       case 'program':
  //         if (programMap[value]) {
  //           newLayer.program = value;
  //         };
  //         break;
  //       case 'piezo':
  //         // Converting string to bool
  //         const isPiezoTrue = (value == 'true');
  //         newLayer.piezo = isPiezoTrue;
  //         break;
  //       case 'magneticNorth':
  //         // Converting string to bool
  //         const isMagneticNorthTrue = (value == 'true');
  //         newLayer.magneticNorth = isMagneticNorthTrue;
  //         break;
  //       case 'preOffset':
  //         newLayer.preOffset = value;
  //         break;
  //       case 'postOffset':
  //         newLayer.postOffset = value;
  //         break;
  //       case 'master':
  //         newLayer.master = value;
  //         break;
  //       default:
  //         console.log('Unknown layer function');
  //         oscError('Unknown layer function')
  //         break;
  //     }

  //     state.activeLayers[layerNumber] = newLayer;
  //     createLayer(layerNumber);

  //     // Starting layer with default values if initial command is "start"
  //     if (state.activeLayers[layerNumber].running) {
  //       startLayer(layerNumber, true);
  //     };


  //   } else {
  //     // Update layer
  //     switch (layerFunc) {
  //       case 'start':
  //         startLayer(layerNumber);
  //         break;
  //       case 'stop':
  //         if (!state.activeLayers[layerNumber].running) {
  //           console.log(`Layer ${layerNumber} is not running`);
  //         } else {
  //           clearTimeout(state.activeLayers[layerNumber].timer);
  //           state.activeLayers[layerNumber].running = false;
  //         }
  //         break;
  //       case 'speed':
  //         state.activeLayers[layerNumber].speed = value;
  //         break;
  //       case 'color':
  //         state.activeLayers[layerNumber].color = value;
  //         state.activeLayers[layerNumber].func.changeColor(value);
  //         break;
  //       case 'program':
  //         if (programMap[value]) {
  //           let command = programMap[value].cmd;
  //           let args = programMap[value].args;
  //           state.activeLayers[layerNumber].program = value;

  //           if (command && args) {
  //             // Deleting relevant layers from state in ledController
  //             state.activeLayers[layerNumber].func.kill();
  //             // The timer runs the chained output function of the function in the layer
  //             // So we can just change the function
  //             state.activeLayers[layerNumber].func = ledController[command](...args);
  //             // Setting color on new layer from state
  //             state.activeLayers[layerNumber].func.changeColor(state.activeLayers[layerNumber].color);
  //           }
  //         }
  //         break;
  //       case 'master':
  //         state.activeLayers[layerNumber].master = value;
  //         state.activeLayers[layerNumber].func.changeMaster(value);
  //         break;
  //       case 'preOffset':
  //         break;
  //       case 'postOffset':
  //         break;
  //       default:
  //         console.log('Unknown layer function');
  //         oscError('Unknown layer function')
  //     }
  //   };

  // };
});

// const createLayer = (layerNumber) => {
//   let command = programMap[state.activeLayers[layerNumber].program].cmd;
//   let args = programMap[state.activeLayers[layerNumber].program].args;
//   // Create new instance
//   state.activeLayers[layerNumber].func = ledController[command](...args);
// };

// const startLayer = (layerNumber, force) => {

//   if (state.activeLayers[layerNumber].running && !force) {
//     console.log(`Layer ${layerNumber} already running`);
//     oscError(`Layer ${layerNumber} already running`);
//     return;
//   }

//   const runOnce = () => {
//     if (state.activeLayers[layerNumber]) {
//       state.activeLayers[layerNumber].func.output();
//       state.activeLayers[layerNumber].timer = setTimeout(runOnce, state.activeLayers[layerNumber].speed);
//     }
//   };

//   runOnce();

//   state.activeLayers[layerNumber].running = true;
// };

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

  // Remove dead neighbours
  state.neighbours.map((neighbour, i) => {
    const lastSeen = Number(neighbour.lastSeen);
    if (moment(lastSeen).isBefore(moment().subtract(2, 'seconds'))) {
      state.neighbours.splice(i, 1);
    };
  }); 

  // Removing timers from active layers from what is emitted to client since that would cause "RangeError: Maximum call stack size exceeded" in socket.io
  // let reducedState = Object.assign({}, state);
  // delete reducedState.activeLayers;
  // Object.keys(reducedState.activeLayers).map((key) => {
  //   delete reducedState.activeLayers[key].timer
  // });

  // Send state to clients
  io.sockets.emit('FromAPI', state);

}, 1000);
