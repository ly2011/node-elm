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
    const info = ctx.model.Shopping.FoodMenu.find(query).exec()
    return info
  }

  async getCategoryById(id) {
    const { ctx } = this
    const query = {
      id
    }
    const info = ctx.model.Shopping.FoodMenu.findOne(query).exec()
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

  async getFoods() {}
}

module.exports = FoodService
