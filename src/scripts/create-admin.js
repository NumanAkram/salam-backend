const AdminModel = require('../db/models/admin.model');

exports.createAdmin = async (name, email, password) => {
  try {
    await AdminModel.create({
      name: name,
      role: 'SUPER_ADMIN',
      email,
      password,
    });
    console.log('Super admin created');
    return true;
  } catch (e) {
    console.log('Super admin creation failed', e.message);
  }
};
