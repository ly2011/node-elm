'use strict';

module.exports = app => {
  const { router, controller } = app;
  const apiRouter = router.namespace('/api/v1');

  const { captchas } = controller.v1;

  // const pagination = middleware.pagination();

  apiRouter.get('/getCaptchas', captchas.getCaptchas); // 获取验证码
};
