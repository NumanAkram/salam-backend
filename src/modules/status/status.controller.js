const config = require('config');
const { StatusCodes } = require('http-status-codes');

const StatusController = {
  /**
   * Handle app status
   * @async
   * @method
   * @returns {Promise.<ControllerResponse> }
   */
  appStatus: async (req, res) => {
    const data = {
      status: 'Healthy',
      appName: config.get('APP_NAME'),
      environment: config.get('APP_ENVIRONMENT'),
      time: new Date(),
    };

    return res.status(StatusCodes.OK).send(data);
  },
};

module.exports = StatusController;
