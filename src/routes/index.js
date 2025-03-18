const initUserRoutes = require('./routes');
const initConfig = require('./init-config');
const { emitter, initEvent } = require('./events');
module.exports = {
  initUserRoutes,
  initConfig,
  emitter,
  initEvent,
};
