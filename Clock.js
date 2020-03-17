module.exports = function Clock(interval) {

  this.seconds = 0;
  this.minutes = 0;
  this.hours = 0;

  this.verifySeconds = (seconds) => {
    if (seconds == 60) {
      this.seconds = 0;
      this.minutes += 1;
    }
  }

  this.verifyMinutes = (minutes, seconds) => {
    if (minutes == 59 && seconds == 60) {
      this.minutes = 0;
      this.seconds = 0;
      this.hours += 1;
    }
  }

  this.verifyHours = () => {
    if ((this.hours == 23) && (this.minutes == 59) && (this.seconds == 60)) {
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
    }
  }

  this.getTime = () => {
    let hoursFormated = (this.hours < 10) ? `0${this.hours}` : this.hours;
    let minutesFormated = (this.minutes < 10) ? `0${this.minutes}` : this.minutes;
    let secondsFormated = (this.seconds < 10) ? `0${this.seconds}` : this.seconds;
    let time = `${hoursFormated}:${minutesFormated}:${secondsFormated}`;
    console.log(time)
    return time
  }
  this.setTime = (time) => {
    const timeArray = time.split(':');
    this.seconds = parseInt(timeArray[2]);
    this.minutes = parseInt(timeArray[1]);
    this.hours = parseInt(timeArray[0]);
  }

  this.run = setInterval(() => {
    this.seconds += 1;
    this.verifyHours();
    this.verifyMinutes(this.minutes, this.seconds);
    this.verifySeconds(this.seconds);
    this.getTime()
  }, interval)
}