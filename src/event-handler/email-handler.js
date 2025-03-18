const config = require('config');
const EMAIL_EVENTS = config.get('EMAIL_EVENTS');
const { EmailService } = require('@services');

const EventHandler = {
  log: (eventType) => {
    console.log(`email:${eventType} at ${Date.now()} => ${new Date()}`);
  },
  triggerEvent: (emitter) => {
    emitter.on(EMAIL_EVENTS.SEND_OTP, EventHandler.sendOTP);
  },

  sendOTP: (OTP, email) => {
    const contents = {
      email: email,
      subject: 'OTP',
      data: OTP,
    };
    EmailService.send(contents);
  },
};

module.exports = EventHandler;
