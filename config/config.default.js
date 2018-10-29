'use strict';
const path = require('path');

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

  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.cors = {
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    credentials: true,
    origin: () => '*',
  };

  config.bodyParser = {
    // enable: true,
    formLimit: '300mb',
    jsonLimit: '300mb',
    textLimit: '300mb',
    // strict: true,
    // // @see https://github.com/hapijs/qs/blob/master/lib/parse.js#L8 for more options
    // queryString: {
    //   arrayLimit: 10000,
    //   depth: 50,
    //   parameterLimit: 100000,
    // }
  };

  // 下面两个配置都是文件上传的配置
  config.qn_access = {
    accessKey: 'Ep714TDrVhrhZzV2VJJxDYgGHBAX-KmU1xV1SQdS',
    secretKey: 'XNIW2dNffPBdaAhvm9dadBlJ-H6yyCTIJLxNM_N6',
    bucket: 'node-elm',
    origin: '//elm.cangdu.org/img/',
    uploadURL: '',
  };

  // 文件上传配置
  // 注：如果填写 qn_access，则会上传到 7牛，以下配置无效
  config.upload = {
    path: path.join(__dirname, '../app/public/upload/'),
    url: '/public/upload/',
  };

  config.default_page = 1;
  config.default_limit = 20;

  return config;
};
