const dgram = require('dgram');
const ip = require('ip');
const PORT = 9092;
const socket = dgram.createSocket('udp4');
const { printError, actionCreator } = require('./Utils');

const verifyAlivePeersTimeout = 3000;
const verifyAlivePeersInterval = 6000;

var listOfPeers = {}
var listOfNotAlivePeers = {}

socket.bind(PORT, () => console.log(`Endereço do STUN: ${ip.address()}:${socket.address().port}`));

function setPIP(info) {
  listOfPeers[info.address] = info;
}

function toWarningPeers(info) {
  for (var [key, value] of Object.entries(listOfPeers)) {
    if (key !== info.address) {
      const { address, port } = value;
      socket.send(actionCreator('toWarningPeers', info), port, address, (error) => printError(error, 'toWarningPeers'));
    }
  }
  console.log('Cliente conectado:', info);
}

function sendPeersList({ port, address }) {
  socket.send(actionCreator('sendPeersList', listOfPeers), port, address, (error) => printError(error, 'sendPeersList'));
}

function connectToSTUN(info) {
  new Promise((resolve, reject) => {
    sendPeersList(info);
    setPIP(info);
    toWarningPeers(info);
    resolve();
  })
}

function removeFromNotAliveList(info) {
  delete listOfNotAlivePeers[info.address];
}

socket.on('message', (msg, info) => {
  let { type } = JSON.parse(msg);
  switch (type) {
    case 'connectToSTUN':
      connectToSTUN(info);
      break
    case 'iAmAlive':
      removeFromNotAliveList(info);
      break
    default:
      break;
  }
});

setInterval(() => {
  listOfNotAlivePeers = {};
  console.log('Verificando peers vivos');
  // listOfAlivePeers = {};
  for (var [key, { address, port }] of Object.entries(listOfPeers)) {
    socket.send(actionCreator('isAlive'), port, address, (error) => printError(error, 'isAlive'));
    listOfNotAlivePeers[key] = 0; // igual a qualquer coisa so pra ter a referencia do peer
  }
  console.log('listOfNotAlive: ', listOfNotAlivePeers);
  setTimeout(() => {
    for (var [key, value] of Object.entries(listOfNotAlivePeers)) {
      delete listOfPeers[key];
    }
    console.log('Peers desconectados: ', listOfNotAlivePeers)
    for (var [key, { address, port }] of Object.entries(listOfPeers)) {
      socket.send(actionCreator('listOfNotAlivePeers', listOfNotAlivePeers), port, address, (error) => printError(error, 'listOfNotAlivePeers'));
    }
  }, verifyAlivePeersTimeout);
}, verifyAlivePeersInterval);

process.stdin.setEncoding('utf-8');
process.stdin.on('data', data => {
  switch (data) {
    case 'listPeers\n':
      console.log('\nPeers :', listOfPeers);
      break;
    default:
      break;
  }
})
