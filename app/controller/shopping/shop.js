'use strict'

// const Controller = require('egg').Controller
const BaseController = require('../../core/base-controller')
const path = require('path')
const fs = require('fs')
const uuidv1 = require('uuid/v1')
const awaitWriteStream = require('await-stream-ready').write
const sendToWormhole = require('stream-wormhole')

class ShopController extends BaseController {
  async addShop() {
    const { ctx, service } = this
    let restaurant_id
    try {
      restaurant_id = await this.getId('restaurant_id')
    } catch (err) {
      console.log('获取商店id失败')
      ctx.body = {
        success: false,
        message: '获取数据失败'
      }
      return
    }

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
      delivery_mode,
      activities = [],
      bao,
      zhun,
      piao
    } = ctx.request.body
    // console.log('addShop: ', name, category, latitude, longitude)
    try {
      if (!name) {
        throw new Error('必须填写商店名称')
      } else if (!address) {
        throw new Error('必须填写商店地址')
      } else if (!phone) {
        throw new Error('必须填写联系电话')
      } else if (!latitude || !longitude) {
        throw new Error('商店位置信息错误')
      } else if (!image_path) {
        throw new Error('必须上传商铺图片')
      } else if (!category) {
        throw new Error('必须上传食品种类')
      }
    } catch (err) {
      console.log('失败： ', err.message)
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: err.message
      }
      return
    }
    try {
      const exists = await service.shopping.shop.getShopByName(name)
      // console.log('exists: ', exists);
      if (exists) {
        console.log('店铺已存在，请尝试其他店铺名称')
        ctx.status = 200
        ctx.body = {
          success: false,
          message: '店铺已存在，请尝试其他店铺名称'
        }
        return
        // throw new Error('店铺已存在，请尝试其他店铺名称');
      }
      const opening_hours = startTime && endTime ? startTime + '/' + endTime : '8:30/20:30'
      const newShop = {
        name,
        address,
        description,
        float_delivery_fee,
        float_minimum_order_amount,
        id: restaurant_id,
        is_premium,
        is_new,
        latitude,
        longitude,
        location: [longitude, latitude],
        opening_hours: [opening_hours],
        phone,
        promotion_info,
        rating: (4 + Math.random()).toFixed(1),
        rating_count: Math.ceil(Math.random() * 1000),
        recent_order_num: Math.ceil(Math.random() * 1000),
        status: Math.round(Math.random()),
        image_path,
        category,
        piecewise_agent_fee: {
          tips: '配送费约¥' + float_delivery_fee
        },
        activities: [],
        supports: [],
        license: {
          business_license_image,
          catering_service_license_image
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
          registered_number: ''
        }
      }

      //配送方式
      if (delivery_mode) {
        Object.assign(newShop, {
          delivery_mode: {
            color: '57A9FF',
            id: 1,
            is_solid: true,
            text: '蜂鸟专送'
          }
        })
      }
      //商店支持的活动
      activities.forEach((item, index) => {
        switch (item.icon_name) {
          case '减':
            item.icon_color = 'f07373'
            item.id = index + 1
            break
          case '特':
            item.icon_color = 'EDC123'
            item.id = index + 1
            break
          case '新':
            item.icon_color = '70bc46'
            item.id = index + 1
            break
          case '领':
            item.icon_color = 'E3EE0D'
            item.id = index + 1
            break
        }
        newShop.activities.push(item)
      })
      if (bao) {
        newShop.supports.push({
          description: '已加入“外卖保”计划，食品安全有保障',
          icon_color: '999999',
          icon_name: '保',
          id: 7,
          name: '外卖保'
        })
      }
      if (zhun) {
        newShop.supports.push({
          description: '准时必达，超时秒赔',
          icon_color: '57A9FF',
          icon_name: '准',
          id: 9,
          name: '准时达'
        })
      }
      if (piao) {
        newShop.supports.push({
          description: '该商家支持开发票，请在下单时填写好发票抬头',
          icon_color: '999999',
          icon_name: '票',
          id: 4,
          name: '开发票'
        })
      }
      // 保存数据，并增加对应食品种类的数量
      // 初始化店铺数据
      const shop = await service.shopping.shop.newAndSave(newShop)

      // 添加商铺分类
      await ctx.model.Shopping.Category.addCategory(category)
      // await ctx.model.UGC.Rating.initData(restaurant_id)
      // 初始化食品分类数据
      await service.shopping.food.initData(restaurant_id)

      ctx.status = 200
      ctx.body = {
        success: true,
        data: shop,
        error_msg: '添加商铺成功'
      }
    } catch (error) {
      console.log('添加失败：', error)
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '添加商铺失败'
      }
    }
  }
  // 获取餐馆列表
  async getRestaurants() {
    // eslint-disable-next-line
    const { ctx, service } = this
    const { currentPage = 1, pageSize = 10, ...restParam } = ctx.query
    const offset = (currentPage - 1) * pageSize
    try {
      const shops = await service.shopping.shop.getRestaurants(restParam, offset, pageSize)
      ctx.status = 200
      ctx.body = {
        success: true,
        data: shops,
        error_msg: '获取店铺列表数据成功'
      }
    } catch (error) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '获取店铺列表失败'
      }
    }
  }
  async getRestaurantDetail() {
    const { ctx, service } = this
    const id = ctx.params.id
    if (!id) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '餐馆ID参数错误'
      }
      return
    }
    try {
      const restaurant = await service.shopping.shop.getRestaurantDetail(id)
      ctx.status = 200
      ctx.body = {
        success: true,
        data: restaurant,
        error_msg: '获取餐馆详情成功'
      }
    } catch (error) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '获取餐馆详情失败'
      }
    }
  }
  async getShopCount() {
    const { ctx, service } = this
    const params = ctx.query
    try {
      const count = await service.shopping.shop.getShopCount(params)
      ctx.status = 200
      ctx.body = {
        success: true,
        data: count,
        error_msg: '获取餐馆数量成功'
      }
    } catch (error) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '获取餐馆数量失败'
      }
    }
  }
  async updateShop() {
    // console.log('updateShop')
    const { ctx, service } = this
    const { name, address, description = '', phone, category, id, latitude, longitude, image_path } = ctx.request.body
    try {
      if (!name) {
        throw new Error('餐馆名称错误')
      } else if (!address) {
        throw new Error('餐馆地址错误')
      } else if (!phone) {
        throw new Error('餐馆联系电话错误')
      } else if (!image_path) {
        throw new Error('餐馆图片地址错误')
      } else if (!category) {
        throw new Error('餐馆分类错误')
      } else if (!id) {
        throw new Error('餐馆ID错误')
      }
    } catch (err) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: err.message
      }
      return
    }
    const newData = {
      name,
      address,
      description,
      phone,
      category,
      image_path
    }
    if (latitude && longitude) {
      newData.latitude = latitude
      newData.longitude = longitude
    }
    try {
      await service.shopping.shop.updateShop(id, newData)
      ctx.status = 200
      ctx.body = {
        success: true,
        error_msg: '修改餐馆信息成功'
      }
    } catch (error) {
      console.log('修改餐馆信息失败: ', error)
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '修改餐馆信息失败'
      }
    }
  }

  async deleteRestaurant() {
    const { ctx, service } = this
    const { id } = ctx.params
    if (!id) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '餐馆ID参数错误'
      }
      return
    }
    try {
      await service.shopping.shop.deleteShop(id)
      ctx.status = 200
      ctx.body = {
        success: true,
        error_msg: '删除餐馆成功'
      }
    } catch (error) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '删除餐馆失败'
      }
    }
  }

  /**
   * 上传文件
   */
  async upload() {
    const { ctx, config, service } = this
    const uid = uuidv1()
    const stream = await ctx.getFileStream()
    const filename = uid + path.extname(stream.filename).toLowerCase()

    // 如果有七牛云的配置，优先上传七牛云
    if (config.qn_access && config.qn_access.secretKey) {
      try {
        const result = await service.shopping.shop.qnUpload(stream, filename)
        ctx.body = {
          success: true,
          url: config.qn_access.origin + '/' + result.key
        }
      } catch (err) {
        await sendToWormhole(stream)
        throw err
      }
    } else {
      const target = path.join(config.upload.path, filename)
      const writeStream = fs.createWriteStream(target)
      try {
        await awaitWriteStream(stream.pipe(writeStream))
        ctx.body = {
          success: true,
          url: config.upload.url + filename
        }
      } catch (err) {
        await sendToWormhole(stream)
        throw err
      }
    }
  }
}

module.exports = ShopController
