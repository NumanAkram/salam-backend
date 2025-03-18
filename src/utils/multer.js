const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomToken } = require('./random-generator');

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dirPath = path.resolve(process.cwd(), 'tmp');
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }
      cb(null, dirPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    const fileName =
      Date.now().toString() + randomToken().toString() + file.originalname;
    cb(null, fileName);
  },
});

module.exports.uploadInstance = multer({ storage: diskStorage });
