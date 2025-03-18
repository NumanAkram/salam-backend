const config = require('config');

const configProps = [
  'APP_NAME',
  'APP_ENVIRONMENT',
  'API_PREFIX',
  'MONGO_DB.URI',
];

module.exports = () => {
  const notFoundProp = configProps.find((prop) => !config.has(prop));
  if (notFoundProp) {
    throw new Error(`${notFoundProp} not found in the environment`);
  }
  return true;
};
