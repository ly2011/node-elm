'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../../core/base-controller');

class FoodController extends BaseController {
  async getCategory() {
    const { ctx, service } = this;
    const { restaurant_id } = ctx.query;
    console.log('restaurant_id: ', restaurant_id);
    try {
      const category_list = await service.shopping.food.getCategory(restaurant_id);
      ctx.body = {
        success: true,
        data: category_list,
        message: '获取餐馆食品种类成功',
      };
    } catch (e) {
      ctx.body = {
        success: false,
        data: null,
        message: '获取餐馆食品种类失败',
      };
    }
  }
  async addCategory() {
    const { ctx, service } = this;
    const { name, description, restaurant_id } = ctx.request.body;
    let category_id;
    try {
      category_id = await this.getId('category_id');
    } catch (e) {
      ctx.body = {
        success: false,
        message: '获取数据失败',
      };
      return;
    }
    const foodObj = {
      name,
      description,
      restaurant_id,
      id: category_id,
      // foods: [],
    };
    try {
      const category = await service.shopping.food.addCategory(foodObj);
      ctx.body = {
        success: true,
        data: category,
        message: '添加食品种类成功',
      };
    } catch (e) {
      ctx.body = {
        success: false,
        data: null,
        message: '添加食品种类失败',
      };
    }
  }
  async addFood() {
    const { ctx, service } = this;
    let item_id;
    try {
      item_id = await this.getId('item_id');
    } catch (err) {
      console.log('获取item_id失败');
      ctx.body = {
        success: false,
        message: '添加食品失败',
      };
      return;
    }

    const {
      name,
      image_path,
      description,
      specs = [],
      category_id,
      restaurant_id,
      activity,
      attributes = [],
    } = ctx.request.body;
    try {
      if (!name) {
        throw new Error('必须填写食品名称');
      } else if (!image_path) {
        throw new Error('必须上传食品图片');
      } else if (!specs.length) {
        throw new Error('至少填写一种规格');
      } else if (!category_id) {
        throw new Error('食品类型ID错误');
      } else if (!restaurant_id) {
        throw new Error('餐馆ID错误');
      }
    } catch (err) {
      console.log('参数错误： ', err.message);
      ctx.body = {
        success: false,
        message: err.message,
      };
      return;
    }

    let category;
    let restaurant;
    try {
      category = await ctx.model.Shopping.FoodMenu.findOne({ id: category_id });
      restaurant = await ctx.model.Shopping.Shop.findOne({ id: restaurant_id });
    } catch (error) {
      console.log('获取食品类型和餐馆信息失败');
      ctx.body = {
        success: false,
        message: '添加食品失败',
      };
      return;
    }
    const rating_count = Math.ceil(Math.random() * 1000);
    const month_sales = Math.ceil(Math.random() * 1000);
    const tips = rating_count + '评价 月售' + month_sales + '份';
    const newFood = {
      name,
      description,
      image_path,
      activity: null,
      attributes: [],
      restaurant_id,
      category_id,
      satisfy_rate: Math.ceil(Math.random() * 100),
      satisfy_count: Math.ceil(Math.random() * 1000),
      item_id,
      rating: (4 + Math.random()).toFixed(1),
      rating_count,
      month_sales,
      tips,
      specfoods: [],
      specifications: [],
    };
    if (activity) {
      newFood.activity = {
        image_text_color: 'f1884f',
        icon_color: 'f07373',
        image_text: activity,
      };
    }
    if (attributes.length) {
      attributes.forEach(item => {
        let attr;
        switch (item) {
          case '新':
            attr = {
              icon_color: '5ec452',
              icon_name: '新',
            };
            break;
          case '招牌':
            attr = {
              icon_color: 'f07373',
              icon_name: '招牌',
            };
            break;
        }
        newFood.attributes.push(attr);
      });
    }

    try {
      const [ specfoods, specifications ] = await this.getSpecfoods(ctx.request.body, item_id);
      newFood.specfoods = specfoods;
      newFood.specifications = specifications;
    } catch (err) {
      console.log('添加sepecs失败', err);
      ctx.body = {
        success: false,
        message: '添加食品失败',
      };
      return;
    }
    try {
      console.log('addFood: ', category);
      // const { Food } = ctx.model.Shopping.Food;
      // const foodEntity = await Food.create(newFood);
      // category.foods.push(foodEntity);
      // category.markModified('foods');
      // await category.save();

      const food = await service.shopping.food.addFood(newFood);
      const food_id = food._id;
      category.foods.push(food_id);
      service.shopping.food.updateCategory(category_id, category);

      ctx.body = {
        success: true,
        data: food,
        message: '添加食品成功',
      };
    } catch (err) {
      console.log('保存食品到数据库失败', err);
      ctx.body = {
        success: false,
        message: '添加食品失败',
      };
    }
  }
  async getSpecfoods(fields, item_id) {
    let specfoods = [],
      specifications = [];
    if (fields.specs.length < 2) {
      let food_id,
        sku_id;
      try {
        sku_id = await this.getId('sku_id');
        food_id = await this.getId('food_id');
      } catch (err) {
        throw new Error('获取sku_id、food_id失败');
      }
      specfoods.push({
        packing_fee: fields.specs[0].packing_fee,
        price: fields.specs[0].price,
        specs: [],
        specs_name: fields.specs[0].specs,
        name: fields.name,
        item_id,
        sku_id,
        food_id,
        restaurant_id: fields.restaurant_id,
        recent_rating: (Math.random() * 5).toFixed(1),
        recent_popularity: Math.ceil(Math.random() * 1000),
      });
    } else {
      specifications.push({
        values: [],
        name: '规格',
      });
      for (let i = 0; i < fields.specs.length; i++) {
        let food_id,
          sku_id;
        try {
          sku_id = await this.getId('sku_id');
          food_id = await this.getId('food_id');
        } catch (err) {
          throw new Error('获取sku_id、food_id失败');
        }
        specfoods.push({
          packing_fee: fields.specs[i].packing_fee,
          price: fields.specs[i].price,
          specs: [
            {
              name: '规格',
              value: fields.specs[i].specs,
            },
          ],
          specs_name: fields.specs[i].specs,
          name: fields.name,
          item_id,
          sku_id,
          food_id,
          restaurant_id: fields.restaurant_id,
          recent_rating: (Math.random() * 5).toFixed(1),
          recent_popularity: Math.ceil(Math.random() * 1000),
        });
        specifications[0].values.push(fields.specs[i].specs);
      }
    }
    return [ specfoods, specifications ];
  }
}

module.exports = FoodController;
