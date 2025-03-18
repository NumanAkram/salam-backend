const { StatusCodes } = require('http-status-codes');
const AuthProviders = require('./auth.providers');
const JWTService = require('@services/jwt.service');
const { emitter } = require('@routes/events');
const config = require('config');

const AuthControllers = {
  login: async (req, res) => {
    const { email, password } = req.body;
    const user = await AuthProviders.authByEmailAndPassword(email, password);

    //get jwt token
    const accessToken = JWTService.encrypt({ _userId: user._id });

    const data = {
      message: {
        en: `You've logged-in successfully`,
        ar: 'لقد قمت بتسجيل الدخول بنجاح',
      },
      user: user,
      token: accessToken,
    };

    return res.status(StatusCodes.OK).json({ data });
  },

  updatePassword: async (req, res) => {
    const { _userId } = req.context;
    const { oldPassword, newPassword } = req.body;
    await AuthProviders.authByIdAndPassword(_userId, oldPassword);
    await AuthProviders.updatePassword(newPassword, _userId);
    res.status(StatusCodes.OK).json({
      data: { message: { en: 'password updated', ar: 'تم تحديث كلمة السر' } },
    });
  },

  forgotPassword: async (req, res) => {
    const { email } = req.body;
    // check if user exist
    const user = await AuthProviders.getUserByEmail(email);
    //get OTP
    const token = await AuthProviders.createOTP(
      user._id,
      'forgot_password',
      email,
    );
    //send mail with OTP
    const EMAIL_EVENTS = config.get('EMAIL_EVENTS');
    emitter.emit(EMAIL_EVENTS.SEND_OTP, token.otp, user.email);
    return res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: `Password reset OTP and instructions has been sent to ${email} successfully you have 5 minutes before OTP expire`,
          ar: `تم إرسال رمز التحقق والتعليمات لإعادة تعيين كلمة المرور إلى ${email} بنجاح لديك 5 دقائق قبل انتهاء رمز التحقق`,
        },
      },
    });
  },

  verifyOTP: async (req, res) => {
    const { email, otp } = req.body;

    // check if user exist
    const user = await AuthProviders.getUserByEmail(email);

    //verify OTP
    await AuthProviders.doVerification(otp, user._id, 'forgot_password', email);

    //get jwt token
    const accessToken = JWTService.encrypt({ _userId: user._id });

    return res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: 'Reset password token has been verified successfully',
          ar: 'تم التحقق من رمز إعادة تعيين كلمة المرور بنجاح',
        },
        token: accessToken,
      },
    });
  },

  resetPassword: async (req, res) => {
    const { _userId } = req.context;
    const { password } = req.body;

    // check if user exist
    await AuthProviders.getUserById(_userId);

    //step two check if user have access to change password
    await AuthProviders.resetPasswordConfirmation(_userId, 'forgot_password');

    //step three change password
    await AuthProviders.updatePassword(password, _userId);

    return res.status(StatusCodes.OK).json({
      data: {
        message: {
          en: 'Your account password has been updated successfully, login to your account',
          ar: 'لقد تم تحديث كلمة مرور حسابك بنجاح، قم بتسجيل الدخول إلى حسابك',
        },
      },
    });
  },
};

module.exports = AuthControllers;
