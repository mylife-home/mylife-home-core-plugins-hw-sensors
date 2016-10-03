'use strict';

const log4js  = require('log4js');
const logger  = log4js.getLogger('core-plugins-hw-sensors.Temperature');
const ds18b20 = require('ds18b20');

module.exports = class Mpd {
  constructor(config) {

    this._sensorId = config.sensorId;
    this._end = false;

    this._setup();
  }

  _setup() {
    this.value = -1000;

    this._worker = setInterval(this._read.bind(this), 10000);
  }

  _read() {
    ds18b20.temperature(this._sensorId, function(err, value) {
      if(err) { return logger.error('Error reading temperator (%s) : %s', this._sensorId, err); }
      if(this._end) { return; }
      this.value = Math.round(value * 10);
    });
  }

  close(done) {
    this._end = true;
    clearInterval(this._worker);
    setImmediate(done);
  }

  static metadata(builder) {
    const temp = builder.range(-1000, 9000);

    builder.usage.driver();

    builder.attribute('value', temp);

    builder.config('sensorId', 'string');
  }
};
