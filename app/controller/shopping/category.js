'use strict';

const Controller = require('egg').Controller;

class CategoryController extends Controller {
  async getCategories() {
    const { ctx, service } = this;
    try {
      const categories = await service.shopping.category.getAllCategories();
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: categories,
        error_msg: '获取餐馆分类成功',
      };
    } catch (error) {
      ctx.status = 401;
      ctx.body = {
        success: true,
        error_msg: '获取餐馆分类失败',
      };
    }
  }
  async addCategory() {
    const { ctx, service } = this;
    try {
      await service.shopping.category.addCategory(type);
      ctx.status = 200;
      ctx.body = {
        success: true,
        error_msg: '增加餐馆分类成功',
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        error_msg: '增加餐馆分类失败',
      };
    }
  }
  async findById() {
    try {
    } catch (error) {}
  }
}

module.exports = CategoryController;
