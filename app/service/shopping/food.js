'use strict'

const Service = require('egg').Service

const defaultData = [
  {
    name: '热销榜',
    description: '大家喜欢吃，才叫真好吃。',
    icon_url: '5da3872d782f707b4c82ce4607c73d1ajpeg',
    is_selected: true,
    type: 1
    // foods: []
  },
  {
    name: '优惠',
    description: '美味又实惠, 大家快来抢!',
    icon_url: '4735c4342691749b8e1a531149a46117jpeg',
    type: 1
    // foods: []
  }
]

class FoodService extends Service {
  // 初始化数据
  async initData(restaurant_id) {
    const { ctx } = this

    // defaultData.forEach(async item => { // TODO:  forEach + async await 有坑，彼此间的async并没有等待作用
    for (let i = 0; i < defaultData.length; i++) {
      let category_id
      try {
        category_id = await ctx.model.Ids.getId('category_id')
        console.log('食品分类: ', category_id)
      } catch (err) {
        console.log('获取食品分类id失败')
        throw new Error(err)
      }
      const item = defaultData[i]
      const category = { ...item, id: category_id, restaurant_id }
      const newFood = new ctx.model.Shopping.FoodMenu(category)
      await newFood.save()
    }
    // })
  }
  async getCategory(restaurant_id) {
    const { ctx } = this
    const query = {
      restaurant_id
    }
    const info = ctx.model.Shopping.FoodMenu.find(query)
    return info
  }

  async getCategoryById(id) {
    const { ctx } = this
    const query = {
      id
    }
    const info = ctx.model.Shopping.FoodMenu.findOne(query)
    return info
  }

  async addCategory(params = {}) {
    const { ctx } = this
    const newFood = new ctx.model.Shopping.FoodMenu(params)
    return newFood.save()
  }

  // 更新食品种类
  async updateCategory(id, params = {}) {
    return this.ctx.model.Shopping.FoodMenu.findOneAndUpdate({ id }, { $set: params })
  }

  async addFood(params = {}) {
    const { ctx } = this
    const shop = new ctx.model.Shopping.Food(params)
    return shop.save()
  }

  // 获取食品列表
  async getFoods(params = {}, offset = 0, limit = 10) {
    const query = {}
    Object.keys(params).forEach(key => {
      query[key] = new RegExp(params[key], 'i')
    })
    const foods = this.ctx.model.Shopping.Food
      .find(query)
      .lean() // 必须添加这个，才能对返回后的值修改（https://blog.csdn.net/ei__nino/article/details/41901095）
      .sort({ id: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .exec()
    return foods
  }
  async updateFood(id, params = {}) {
    return this.ctx.model.Shopping.Food.findOneAndUpdate({ item_id: id }, { $set: params })
  }
  /**
   * 获取食品
   * @param {String} id 食品ID
   */
  async getFoodDetail(id) {
    const query = {
      item_id: id
    }
    const info = this.ctx.model.Shopping.Food.findOne(query).exec()
    return info
  }
  /**
   * 获取食品数量
   * @return {Promise}
   */
  async getFoodsCount(params = {}) {
    const query = {}
    Object.keys(params).forEach(key => {
      query[key] = new RegExp(params[key], 'i')
    })
    return this.ctx.model.Shopping.Food
      .find(query)
      .count()
      .exec()
  }
  /**
   * 删除食品
   * @param {String} id
   */
  async deleteFood(id) {
    const query = {
      item_id: id
    }
    return this.ctx.model.Shopping.Food.remove(query)
  }
}

module.exports = FoodService
