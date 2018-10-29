'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  const apiRouter = router.namespace('/api/shopping');

  const { shop, category } = controller.shopping;

  // const pagination = middleware.pagination();
  const authUser = middleware.authUser();

  // 店铺
  apiRouter.post('/addShop', authUser, shop.addShop); // 添加商铺
  apiRouter.get('/restaurants', shop.getRestaurants); // 获取餐馆列表
  apiRouter.get('/restaurant/:id', shop.getRestaurantDetail); // 获取餐馆详细信息
  apiRouter.delete('/restaurant/:id', authUser, shop.deleteRestaurant); // 删除餐馆
  apiRouter.get('/restaurants/count', shop.getShopCount); // 获取餐馆数量
  apiRouter.post('/updateshop', authUser, shop.updateShop); // 更新餐馆信息
  apiRouter.post('/addImg', authUser, shop.upload); // 上传图片

  // 店铺食品种类
  apiRouter.get('/getCategory/:id', category.findById); // 获取当前店铺食品种类
  apiRouter.post('/addCategory', authUser, category.addCategory); // 添加食品种类
};
