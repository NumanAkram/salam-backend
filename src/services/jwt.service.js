const JWT = require('jsonwebtoken');
const config = require('config');

const JWTService = {
  SECRET_KEY: config.get('JWT.SECRET_KEY'),
  EXPIRES_IN: config.get('JWT.EXPIRES_IN'),

  encrypt: (
    payload,
    key = JWTService.SECRET_KEY,
    expiresIn = JWTService.EXPIRES_IN,
  ) => {
    return JWT.sign(payload, key, {
      expiresIn,
    });
  },

  verify: ({ token, key = JWTService.SECRET_KEY }, callback) =>
    JWT.verify(token, key, callback),
};

module.exports = JWTService;
