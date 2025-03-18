const mongoose = require('mongoose');
const config = require('config');

module.exports = (url = config.get('MONGO_DB.URI')) => {
  return mongoose.connect(url, { family: 4 });
};
