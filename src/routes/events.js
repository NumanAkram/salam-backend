const { EventEmitter } = require('events');
const emitter = new EventEmitter();
const loadListenersfrom = require('../event-handler');

const initEvent = async () => {
  return loadListenersfrom(emitter);
};

module.exports = { emitter, initEvent };
