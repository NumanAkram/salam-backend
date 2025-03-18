const { APIError } = require('@utils/api-error');
const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err);
  const customError = {
    statusCode:
      err?.status || err?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message:
      err?.message ||
      err?.description ||
      'Internal server error, please contact support team',
  };

  //catch api error
  if (err instanceof APIError) {
    return res.status(err.status).json({
      message: err.message,
      code: err.status,
      _customError: true,
    });
  }

  // check if the error from mongoose validator
  if (err?.name && err?.name === 'ValidationError') {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: err._message, error: err.errors });
  }
  return res
    .status(customError.statusCode)
    .json({ message: customError.message, error: err });
};

module.exports = errorHandlerMiddleware;
