const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const DEFAULT_PORT = process.env.PORT || 3021;
const app = express();
const { notFoundError, errorHandlerMiddleware } = require('@middlewares');

async function init() {
  app.use(cors());
  app.use(helmet());
  app.use(express.json({ extended: false }));

  // load routes and events
  require('@routes/routes')(app);
  require('@routes/events')['initEvent']();

  // load and validate env variables
  require('@routes/init-config')();

  // error middleware
  app.use(notFoundError); // handle 404 not found error
  app.use(errorHandlerMiddleware); // handle Errors
}

async function run() {
  try {
    init();

    // connect to the database before run the server and start receive request
    await require('./db/connect')();

    const server = http.createServer(app);
    server.listen(DEFAULT_PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Salam Store server listening on port:${DEFAULT_PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = { run };
