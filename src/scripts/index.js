/* eslint-disable no-process-exit */
const reader = require('readline-sync'); //npm install readline-sync

require('module-alias/register');
const { createAdmin } = require('./create-admin');
const connect = require('../db/connect');

const dbInitialization = async () => {
  await connect();
  const answer1 = reader.question('Do you want to create super admin (Y/N)?');
  if (['Q', 'N'].includes(answer1)) {
    console.log('Bye');
    process.exit();
  }

  if (answer1 === 'Y') {
    const name = reader.question('name:');
    const email = reader.questionEMail('email:');
    const password = reader.questionNewPassword('password:', {
      min: 6,
      max: 12,
    });
    await createAdmin(name, email, password);
    process.exit();
  }
};

dbInitialization();
