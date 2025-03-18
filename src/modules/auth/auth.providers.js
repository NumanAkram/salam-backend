const { AdminUser, Token } = require('@models');
const hashPassword = require('@utils/hashFunction');
const OTPGenerator = require('@utils/random-generator');
const { UnauthorizedError, BadRequestError } = require('@utils/api-error');

const AuthProviders = {
  authByEmailAndPassword: async (email, password) => {
    // get user
    const user = await AdminUser.findOne({ email });

    if (!user) {
      throw new UnauthorizedError({
        en: 'Email is wrong',
        ar: 'البريد الإلكتروني  خاطئة',
      });
    }

    // check if password correct
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new UnauthorizedError({
        en: 'password is wrong',
        ar: 'كلمة المرور خاطئة',
      });
    }

    return user;
  },

  authByIdAndPassword: async (_id, password) => {
    // get user
    const user = await AdminUser.findById(_id);

    if (!user) {
      throw new BadRequestError({
        en: 'no user exist with this id',
        ar: 'لا يوجد مستخدم بهذا المعرف',
      });
    }

    // check if password correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedError({
        en: 'password is wrong',
        ar: 'كلمة المرور خاطئة',
      });
    }

    return user;
  },

  updatePassword: async (newPassword, _id) => {
    const password = await hashPassword(newPassword);
    const user = await AdminUser.findOneAndUpdate(
      { _id },
      { password },
      { runValidators: true, new: true },
    );
    return user;
  },

  getUserByEmail: async (email) => {
    const user = await AdminUser.findOne({ email });
    if (!user) {
      throw new BadRequestError({
        en: `not exist - user with email ${email} not exist`,
        ar: 'لا يوجد - المستخدم بالبريد الإلكتروني ${email} غير موجود',
      });
    }
    return user;
  },

  getUserById: async (_id) => {
    const user = await AdminUser.findOne({ _id });
    if (!user) {
      throw new BadRequestError({
        en: `user not exist`,
        ar: 'المستخدم غير متوفر',
      });
    }
    return user;
  },

  createOTP: async (_userId, purpose, receiver) => {
    //first remove old otp
    await Token.deleteMany({ _userId });
    const token = await Token.create({
      _userId,
      purpose,
      expireAt: new Date(Date.now() + 600000),
      otp: OTPGenerator.randomDigits(),
      receiver,
    });
    return token;
  },

  doVerification: async (otp, _id, purpose, receiver) => {
    const token = await Token.findOneAndUpdate(
      { otp, _userId: _id, purpose, receiver },
      { expireAt: new Date(Date.now() + 600000), isVerified: true },
    );

    if (!token) {
      throw new BadRequestError({
        en: 'Verification token may be expired/invalid',
        ar: 'قد يكون رمز التحقق منتهي الصلاحية/غير صالح',
      });
    }
  },

  resetPasswordConfirmation: async (_id, purpose) => {
    const token = await Token.findOne({
      _userId: _id,
      purpose,
    });
    if (!token) {
      throw new BadRequestError({
        en: 'Verification failed may be expired/invalid try again you had 5 minutes for create new password',
        ar: 'قد يكون فشل التحقق منتهي الصلاحية/غير صالح. حاول مرة أخرى، كان لديك 5 دقائق لإنشاء كلمة مرور جديدة',
      });
    }
    if (!token.isVerified) {
      throw new BadRequestError({
        en: 'Verification failed',
        ar: 'فشل التحقق',
      });
    }
    await Token.deleteMany({ _userId: _id });
    return true;
  },
};

module.exports = AuthProviders;
