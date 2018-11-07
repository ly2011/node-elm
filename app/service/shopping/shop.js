'use strict';

const Service = require('egg').Service;
const qiniu = require('qiniu');

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
  async getRestaurants(name = '', offset = 0, limit = 10) {
    const query = {
      name: new RegExp(name, 'i'),
    };
    const shops = this.ctx.model.Shopping.Shop
      .find(query, '_id name address description phone rating status category image_path')
      .sort({ _id: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .exec();
    return shops;
  }
  /**
   * 获取餐馆
   * @param {String} id 餐馆ID
   */
  async getRestaurantDetail(id) {
    const query = {
      _id: id,
    };
    const info = this.ctx.model.Shopping.Shop.findOne(query).exec();
    return info;
  }
  /**
   * 获取餐馆数量
   * @return {Promise}
   */
  async getShopCount() {
    return this.ctx.model.Shopping.Shop.count().exec();
  }
  /**
   *
   * @param {String} id 餐馆id
   * @param {Object} params 餐馆参数
   */
  async updateShop(id, params = {}) {
    return this.ctx.model.Shopping.Shop.findOneAndUpdate({ _id: id }, { $set: params });
  }
  /**
   *
   * @param {String} id
   */
  async deleteShop(id) {
    const query = {
      _id: id,
    };
    return this.ctx.model.Shopping.Shop.remove(query);
  }

  /**
   * 七牛上传
   * @param {Stream} readableStream 流
   * @param {String} key 文件名key
   * @param {Function} callback 回调函数
   */
  qnUpload(readableStream, key) {
    const { accessKey, secretKey, bucket } = this.config.qn_access;
    const hashName = (new Date().getTime() + Math.ceil(Math.random() * 10000)).toString(16);
    const hashKey = hashName + 'jpg';
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    const putPolicy = new qiniu.rs.PutPolicy({ scope: bucket + ':' + hashKey });
    const uploadToken = putPolicy.uploadToken(mac);

    const config = new qiniu.conf.Config();
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.putStream(uploadToken, key, readableStream, putExtra, (respErr, respBody, respInfo) => {
        if (respErr) {
          reject(respErr);
          return;
        }
        if (respInfo.statusCode === 200) {
          resolve(respBody);
        } else {
          reject(new Error('上传失败: statusCode !== 200'));
        }
      });
    });
  }
}

module.exports = ShopService;
