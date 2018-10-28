'use strict';

const Service = require('egg').Service;

class ShopService extends Service {
  async getShopByName(name) {
    const query = {
      name,
    };
    return this.ctx.model.Shopping.Shop.findOne(query);
  }
  /**
   * 创建一个新的店铺
   * @param {Object} params
   */
  async newAndSave(params = {}) {
    const shop = new this.ctx.model.Shopping.Shop();
    Object.keys(params).forEach(key => {
      shop[key] = params[key];
    });
    return shop.save();
  }
  /**
   * 获取店铺列表
   * @param {Number} offset 偏移量
   * @param {Number} limit 每页显示条数
   */
  async getRestaurants(name = '', offset = 0, limit = 20) {
    const query = {
      name: new RegExp(name, 'i'),
    };
    const shops = this.ctx.model.Shopping.Shop
      .find(query, 'name address description phone rating status')
      .sort({ _id: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .exec();
    return shops;
  }
}

module.exports = ShopService;
