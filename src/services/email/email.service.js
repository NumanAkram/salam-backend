const config = require('config');
const AWS = require('aws-sdk');
const AWS_SES = config.get('AWS_SES');
const { SES_ID, SES_SECRET, SES_REGION, SES_SENDER, SES_ALLOWED } = AWS_SES;

const EmailService = {
  updateConfig: () => {
    AWS.config.update({
      accessKeyId: SES_ID,
      secretAccessKey: SES_SECRET,
      region: SES_REGION,
    });
  },

  send: async (contents) => {
    if (!SES_ALLOWED) {
      console.log({ service: 'email', isOperational: SES_ALLOWED });
      return true;
    }
    EmailService.updateConfig();
    const ses = new AWS.SES({ apiVersion: '2010-12-01' });

    const params = {
      Destination: {
        ToAddresses: [contents.email],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: contents.data,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: `${contents.subject}`,
        },
      },
      Source: 'salam-store' + SES_SENDER,
    };
    try {
      return await ses.sendEmail(params).promise();
    } catch (e) {
      console.log('aws ses: ', e.message);
    }
  },
};

module.exports = EmailService;
