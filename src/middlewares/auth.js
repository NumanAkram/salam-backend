const JWTService = require('@services/jwt.service');
const { UnauthorizedError, BadRequestError } = require('@utils/api-error');

module.exports = async (req, res, next) => {
  const token =
    req.headers['auth-token'] ||
    req.headers['token'] ||
    req.headers['authorization'];

  if (!token) {
    throw new UnauthorizedError({
      en: 'Authorization failed',
      ar: 'فشل التفويض',
    });
  }

  JWTService.verify({ token, key: JWTService.SECRET_KEY }, (err, decoded) => {
    if (err) {
      console.log('***** JWT authentication error ****');
      console.log({
        name: err.name,
        message: err.message,
        expiredAt: err?.expiredAt,
      });
      console.log('***** JWT authentication error ****');

      throw new BadRequestError({
        en: 'The token you are trying to use is not valid',
        ar: 'الرمز المميز الذي تحاول استخدامه غير صالح',
      });
    }
    if (!decoded || !decoded._userId) {
      throw new BadRequestError({
        en: 'The token you are trying to use is not valid',
        ar: 'الرمز المميز الذي تحاول استخدامه غير صالح',
      });
    }
    req.context = { _userId: decoded._userId };
    next();
  });
};
