const crypto = require('crypto');
const Utils = {
  /**
   * @param {Number} f any length of a number
   * @param {Number} s any length of a number
   * @returns {int} random 6 digit number (default)
   */
  randomDigits: () => Math.floor(100000 + Math.random() * 900000),

  /**
   *
   * @param {Number} [length=64] length of the token string
   * @returns {string} unique string
   */
  randomToken: (length = 64) => crypto.randomBytes(length).toString('hex'),
};

module.exports = Utils;
