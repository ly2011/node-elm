'use strict';

module.exports = app => {
  const { router, controller } = app;
  const apiRouter = router.namespace('/api/v1');

  const { captchas, cities, search } = controller.v1;

  apiRouter.get('/cities', cities.getCity); // 根据搜索类型获取城市信息
  apiRouter.get('/cities/:id', cities.getCityById); // 根据city_id获取城市信息
  apiRouter.get('/pois', search.search); // 搜索地址
  apiRouter.get('/getCaptchas', captchas.getCaptchas); // 获取验证码
};
