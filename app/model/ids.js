/**
 * 维护系统的ids
 */
'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const idsSchema = new Schema({
    restaurant_id: Number,
    food_id: Number,
    order_id: Number,
    user_id: Number,
    address_id: Number,
    cart_id: Number,
    img_id: Number,
    category_id: Number,
    item_id: Number,
    sku_id: Number,
    admin_id: Number,
    statis_id: Number,
  });
  // TODO:
  idsSchema.statics.getId = async function(type) {
    const idList = [
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

    if (!idList.includes(type)) {
      console.log('id类型错误');
      throw new Error('id 类型错误');
    }
    try {
      const idData = await this.findOne();
      idData[type]++;
      await idData.save();
      return idData[type];
    } catch (err) {
      console.log('获取ID数据失败');
      throw new Error(err);
    }
  };

  const Ids = mongoose.model('Ids', idsSchema);

  // 初始化Ids
  Ids.findOne((err, data) => {
    if (!data) {
      const newIds = new Ids({
        restaurant_id: 0,
        food_id: 0,
        order_id: 0,
        user_id: 0,
        address_id: 0,
        cart_id: 0,
        img_id: 0,
        category_id: 0,
        item_id: 0,
        sku_id: 0,
        admin_id: 0,
        statis_id: 0,
      });
      newIds.save();
    }
  });
  return Ids;
};
