const moment = require('moment');
module.exports = {
  actionCreator: (type, payload) => {
    return JSON.stringify({
      type,
      payload
    })
  },
  printError: (error, location) => {
    if (error)
      console.log(`[Error on ${location}] :`, error);
  },
  milisecondsToTime: (miliseconds) => {
    // miliseconds = parseInt(ms) //because moment js dont know to handle number in string format
    console.log(miliseconds)
    var format = Math.floor(moment.duration(miliseconds).asHours()) + ':' + moment.duration(miliseconds).minutes() + ':' + moment.duration(miliseconds).seconds();
    return format;
  },
  sumHour: (initialHour, hourToSum) => {
    let hourInit = initialHour.split(':');

    let hourSum = hourToSum.split(':');

    let hoursInitToMs = parseInt(hourInit[0]) * 60 * 60 * 1000;
    let minutesInitToMs = parseInt(hourInit[1]) * 60 * 1000;
    let secondsInitToMs = parseInt(hourInit[2]) * 1000;
    let sumInit = hoursInitToMs + minutesInitToMs + secondsInitToMs;

    let hoursToSumToMs = parseInt(hourSum[0]) * 60 * 60 * 1000;
    let minutesToSumToMs = parseInt(hourSum[1]) * 60 * 1000;
    let secondsToSumToMs = parseInt(hourSum[2]) * 1000;

    let sumDiff = hoursToSumToMs + minutesToSumToMs + secondsToSumToMs;
    let ms = sumDiff + sumInit;
    let totalInTime = Math.floor(moment.duration(ms).asHours()) + ':' + moment.duration(ms).minutes() + ':' + moment.duration(ms).seconds();

    return totalInTime
  }
}