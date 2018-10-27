'use strict';

module.exports = appInfo => {
  const config = (exports = {});

  config.name = '饿了么管理后台';
  config.description = '基于Egg + Mongoose的饿了么管理后台';

  // debug 为 true 时，用于本地调试
  config.debug = true;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1540679595310_294';

  config.session_secret = 'egg_elm';

  // add your config here
  config.middleware = [ 'errorHandler' ];

  /**
   * @see http://mongodb.github.io/node-mongodb-native/2.2/api/Db.html#createCollection
   */
  config.mongoose = {
    client: {
      url: process.env.EGG_MONGODB_URL || 'mongodb://127.0.0.1:27017/egg_elm',
      options: {
        server: { poolSize: 20 },
        reconnectTries: 10,
        reconnectInterval: 500,
      },
    },
  };

  config.default_page = 1;
  config.default_limit = 20;

  return config;
};
