const Clock = require('./Clock');
const dgram = require('dgram');
const ip = require('ip');
const socket = dgram.createSocket('udp4');
const PORT_STUN = 9092;
const IP_STUN = '172.16.103.214';
const CLOCK_INTERVAL = 1100;
const SYNC_INTERVAL = 3000;
const moment = require('moment');

const clock = new Clock(CLOCK_INTERVAL);
const { printError, actionCreator, milisecondsToTime, sumHour } = require('./Utils')

var listOfPeers = {}

var amICoordinator = process.env.COORD;

//O coordenador recebe o objeto completo da info
var coordinator = null;

//Estrutura de dados que grava o tempo que foi pedido o horário, o tempo que foi recebido, e a diferença
var syncTime = {
  request: null,
  receive: null,
  diff: null
}

socket.bind(() => console.log('Cliente conectado na porta: ', socket.address().port));

socket.send(actionCreator('connectToSTUN'), PORT_STUN, IP_STUN, (error) => printError(error, 'connectToSTUN'));

function setNewPeer(peer) {
  console.log('Um novo peer entrou', peer)
  listOfPeers[peer.address] = peer;
}

function setMyPeers(peers) {
  console.log('Lista de peers', peers);

  listOfPeers = {
    ...peers
  };
}

function isAlive() {
  socket.send(actionCreator('iAmAlive'), PORT_STUN, IP_STUN, (error) => printError(error, 'iAmAlive'));
}

function deleteNotAlivePeers(payload) {
  for (var [key, { address, port }] of Object.entries(payload)) {
    delete listOfPeers[key];
  }
}

//Se eu não for coordenador e existir um coordenador eu peço a hora para ele
function requestHour() {
  if (!amICoordinator && coordinator) {
    syncTime['request'] = clock.getTime(); // seto o momento em que pedi para o coordenador o horario na estrutura de dados responsavel por isso
    socket.send(actionCreator('requestHourToCoord'), coordinator.port, coordinator.address, (error) => printError(error, 'requestHourToCoord'));
  }
}

// A cada 7 segundos o peer pede a hora para o coordenador
const requestHourInterval = setInterval(() => requestHour(), 7000);

//Avisando para todos que eu sou o coordenador
const warnIAmCoordinator = setInterval(() => {
  if (amICoordinator) {
    for (var [key, { address, port }] of Object.entries(listOfPeers)) {
      socket.send(actionCreator('warnIAmCoordinator'), port, address, (error) => printError(error, 'warnIAmCoordinator'));
    }
  }
}, 6000);// a cada 6 segundo ele fala que é o coordenador

//Seto meu coordernador com a info dele
function setCoordinator(payload) {
  coordinator = payload;
}

//Manda as horas para o peer que pediu
function sendHourToPeer({ port, address }) {
  socket.send(actionCreator('sendHourToPeer', clock.getTime()), port, address, (error) => printError(error, 'sendHourToPeer'));
}

//Recebo a hora do coordenador e executo o algoritmo de cristian
function receiveHourFromCoord(payload) {
  syncTime['receive'] = clock.getTime();
  // console.log('Receive', syncTime.receive);
  // console.log('request', syncTime.request);
  const diff = moment(syncTime.receive, "HH:mm:ss").diff(moment(syncTime.request, "HH:mm:ss"));
  let halfDiff = diff / 2;
  let diffInTime = milisecondsToTime(halfDiff);
  let sum = sumHour(payload, diffInTime);
  console.log('SOMA', sum);
  clock.setTime(sum);

  // console.log('Relógio do coordenador', payload);
  // console.log('Meu Rélogio', clock.getTime())
}

socket.on('message', (msg, info) => {
  let { type, payload } = JSON.parse(msg);
  switch (type) {
    case 'toWarningPeers':
      setNewPeer(payload);
      break
    case 'sendPeersList':
      setMyPeers(payload);
      break
    case 'isAlive':
      isAlive();
      break
    case 'listOfNotAlivePeers':
      deleteNotAlivePeers(payload);
      break
    case 'warnIAmCoordinator':
      setCoordinator(info);
      break
    case 'requestHourToCoord'://coordenador envia para quem pediu a hora
      sendHourToPeer(info);
      break
    case 'sendHourToPeer':
      receiveHourFromCoord(payload);
      break
    default:
      break;
  }
})

// COMANDOS
process.stdin.setEncoding('utf-8');
process.stdin.on('data', data => {
  switch (data) {
    case 'listPeers\n':
      console.log('Peers :', listOfPeers);
      break;
    case 'addDrift\n':
      let sum = sumHour(clock.getTime(), '00:20:00');
      clock.setTime(sum);
      break;
    default:
      break;
  }
})
