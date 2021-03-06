'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  require('./router/admin')(app);
  require('./router/shopping')(app);
  require('./router/v1')(app);
  router.get('/', controller.home.index);
};
