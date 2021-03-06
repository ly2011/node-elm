'use strict';

module.exports = app => {
  const { router, controller } = app;
  const apiRouter = router.namespace('/api/admin');

  const { admin } = controller.admin;

  // const pagination = middleware.pagination();

  // 管理员
  apiRouter.post('/login', admin.login); // 登录
  apiRouter.post('/register', admin.register); // 注册
  apiRouter.get('/singout', admin.singout); // 登出
  apiRouter.get('/info', admin.getAdminInfo); // 获取用户信息
  apiRouter.get('/all', admin.getAllAdmin); // 管理员列表
  apiRouter.get('/count', admin.getAdminCount); // 管理员数量
};
