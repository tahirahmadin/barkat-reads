require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'barkat-learn-dev-secret',
  nodeEnv: process.env.NODE_ENV || 'development',
};
