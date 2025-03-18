const EventHandler = require('./email-handler');

module.exports = (emitter) => {
  EventHandler.triggerEvent(emitter);
  return emitter;
};
