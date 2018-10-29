'use strict';

const Controller = require('egg').Controller;
const path = require('path');
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const awaitWriteStream = require('await-stream-ready').write;

class ShopController extends Controller {
  async addShop() {
    const { ctx, service } = this;
    const {
      name,
      address,
      phone,
      latitude,
      longitude,
      image_path,
      category,
      startTime,
      endTime,
      description,
      float_delivery_fee = 0,
      float_minimum_order_amount = 0,
      is_premium = false,
      is_new = false,
      promotion_info = '欢迎光临，用餐高峰请提前下单，谢谢',
      business_license_image = '',
      catering_service_license_image = '',
    } = ctx.request.body;
    try {
      if (!name) {
        throw new Error('必须填写商店名称');
      } else if (!address) {
        throw new Error('必须填写商店地址');
      } else if (!phone) {
        throw new Error('必须填写联系电话');
      } else if (!latitude || !longitude) {
        throw new Error('商店位置信息错误');
      } else if (!image_path) {
        throw new Error('必须上传商铺图片');
      } else if (!category) {
        throw new Error('必须上传食品种类');
      }
    } catch (err) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error_msg: err.message,
      };
      return;
    }
    try {
      const exists = await service.shopping.shop.getShopByName(name);
      if (exists) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: '店铺已存在，请尝试其他店铺名称',
        };
        return;
      }
      const opening_hours = startTime && endTime ? startTime + '/' + endTime : '8:30/20:30';
      const newShop = {
        name,
        address,
        description,
        float_delivery_fee,
        float_minimum_order_amount,
        is_premium,
        is_new,
        latitude,
        longitude,
        location: [ longitude, latitude ],
        opening_hours: [ opening_hours ],
        phone,
        promotion_info,
        rating: (4 + Math.random()).toFixed(1),
        rating_count: Math.ceil(Math.random() * 1000),
        recent_order_num: Math.ceil(Math.random() * 1000),
        status: Math.round(Math.random()),
        image_path,
        category,
        piecewise_agent_fee: {
          tips: '配送费约¥' + float_delivery_fee,
        },
        activities: [],
        supports: [],
        license: {
          business_license_image,
          catering_service_license_image,
        },
        identification: {
          company_name: '',
          identificate_agency: '',
          identificate_date: '',
          legal_person: '',
          licenses_date: '',
          licenses_number: '',
          licenses_scope: '',
          operation_period: '',
          registered_address: '',
          registered_number: '',
        },
      };

      // 保存数据，并增加对应食品种类的数量
      // eslint-disable-next-line
      const shop = await service.shopping.shop.newAndSave(newShop)
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: shop,
        error_msg: '添加餐厅成功',
      };
    } catch (error) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error_msg: '添加商铺失败',
      };
    }
  }
  // 获取餐馆列表
  async getRestaurants() {
    // eslint-disable-next-line
    const { ctx, service } = this
    const { offset = 0, limit = 0, name } = ctx.query;
    try {
      const shops = await service.shopping.shop.getRestaurants(name, offset, limit);
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: shops,
        error_msg: '获取店铺列表数据成功',
      };
    } catch (error) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error_msg: '获取店铺列表失败',
      };
    }
  }
  async getRestaurantDetail() {
    const { ctx, service } = this;
    const id = ctx.params.id;
    if (!id) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error_msg: '餐馆ID参数错误',
      };
      return;
    }
    try {
      const restaurant = await service.shopping.shop.getRestaurantDetail();
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: restaurant,
        error_msg: '获取餐馆详情成功',
      };
    } catch (error) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error_msg: '获取餐馆详情失败',
      };
    }
  }
  async getShopCount() {
    const { ctx, service } = this;
    try {
      const count = await service.shopping.shop.getShopCount();
      ctx.status = 401;
      ctx.body = {
        success: true,
        data: count,
        error_msg: '获取餐馆数量成功',
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        error_msg: '获取餐馆数量失败',
      };
    }
  }
  async updateShop() {
    const { ctx, service } = this;
    const { name, address, description = '', phone, category, id, latitude, longitude, image_path } = ctx.request.body;
    try {
      if (!name) {
        throw new Error('餐馆名称错误');
      } else if (!address) {
        throw new Error('餐馆地址错误');
      } else if (!phone) {
        throw new Error('餐馆联系电话错误');
      } else if (!image_path) {
        throw new Error('餐馆图片地址错误');
      } else if (!category) {
        throw new Error('餐馆分类错误');
      } else if (!id) {
        throw new Error('餐馆ID错误');
      }
    } catch (err) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error_msg: err.message,
      };
      return;
    }
    const newData = {
      name,
      address,
      description,
      phone,
      category,
      image_path,
    };
    if (latitude && longitude) {
      newData.latitude = latitude;
      newData.longitude = longitude;
    }
    try {
      await service.shopping.shop.updateShop(newData);
      ctx.status = 200;
      ctx.body = {
        success: true,
        error_msg: '修改餐馆信息成功',
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        error_msg: '修改餐馆信息失败',
      };
    }
  }

  async deleteRestaurant() {
    const { ctx, service } = this;
    const { id } = ctx.params;
    if (!id) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error_msg: '餐馆ID参数错误',
      };
      return;
    }
    try {
      await service.shopping.shop.deleteShop(id);
      ctx.status = 200;
      ctx.body = {
        success: true,
        error_msg: '删除餐馆成功',
      };
    } catch (error) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error_msg: '删除餐馆失败',
      };
    }
  }

  /**
   * 上传文件
   */
  async upload() {
    const { ctx, config, service } = this;
    const uid = uuidv1();
    const stream = await ctx.getFileStream();
    const filename = uid + path.extname(stream.filename).toLowerCase();

    // 如果有七牛云的配置，优先上传七牛云
    if (config.qn_access && config.qn_access.secretKey) {
      try {
        const result = await service.shopping.shop.qnUpload(stream, filename);
        ctx.body = {
          success: true,
          url: config.qn_access.origin + '/' + result.key,
        };
      } catch (err) {
        throw err;
      }
    } else {
      const target = path.join(config.upload.path, filename);
      const writeStream = fs.createWriteStream(target);
      try {
        await awaitWriteStream(stream.pipe(writeStream));
        ctx.body = {
          success: true,
          url: config.upload.url + filename,
        };
      } catch (err) {
        throw err;
      }
    }
  }
}

module.exports = ShopController;
