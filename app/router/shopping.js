'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  const apiRouter = router.namespace('/api/shopping');

  const { shop, category, food } = controller.shopping;

  // const pagination = middleware.pagination();
  const authUser = middleware.authUser();

  // 店铺
  apiRouter.post('/addShop', authUser, shop.addShop); // 添加商铺
  apiRouter.get('/restaurants', shop.getRestaurants); // 获取餐馆列表
  // apiRouter.get('/restaurant/:id', shop.getRestaurantDetail); // 获取餐馆详细信息 (不知道是什么原因导致覆盖掉 `restaurant/category` 这个路由了)
  apiRouter.delete('/restaurant/:id', authUser, shop.deleteRestaurant); // 删除餐馆
  apiRouter.get('/restaurants/count', shop.getShopCount); // 获取餐馆数量
  apiRouter.post('/updateShop', authUser, shop.updateShop); // 更新餐馆信息
  apiRouter.post('/addImg', authUser, shop.upload); // 上传图片

  // 店铺食品种类
  apiRouter.get('/restaurant/category', category.getCategories); // 获取所有餐馆分类和数量
  // apiRouter.get('/getCategory/:id', category.findById); // 获取当前店铺食品种类
  // apiRouter.post('/addCategory', authUser, category.addCategory); // 添加食品种类
  apiRouter.get('/emptyCategory', category.emptyCategory); // 清空所有食品种类

  // 食品
  apiRouter.get('/getFoodCategory', food.getCategory);
  apiRouter.post('/addFoodCategory', food.addCategory);
  // apiRouter.get('/getFoodMenus, Food.getMenu)
  // apiRouter.get('/getFoodMenu/:category_id', Food.getMenuDetail)
  // apiRouter.get('/getFoods', Food.gteFoods)
  // apiRouter.get('/getFoodsCount', Food.getFoodsCount)
  apiRouter.post('/addFood', food.addFood);
  // apiRouter.post('/updateFood', Food.updateFood)
  // apiRouter.get('/deleteFood', Foo.deleteFood)
};
