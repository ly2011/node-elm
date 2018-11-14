'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {
  constructor(app) {
    super(app);
    this.idList = [
      'restaurant_id',
      'food_id',
      'order_id',
      'user_id',
      'address_id',
      'cart_id',
      'img_id',
      'category_id',
      'item_id',
      'sku_id',
      'admin_id',
      'statis_id',
    ];
    this.imgTypeList = [ 'shop', 'food', 'avatar', 'default' ];
  }

  async getId(type) {
    const { ctx } = this;
    if (!this.idList.includes(type)) {
      console.log('id类型错误');
      throw new Error('id 类型错误');
    }
    try {
      const idData = await ctx.model.Ids.findOne();
      idData[type]++;
      await idData.save();
      return idData[type];
    } catch (err) {
      console.log('获取ID数据失败');
      throw new Error(err);
    }
  }
}

module.exports = BaseController;
