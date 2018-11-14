'use strict';

const Controller = require('egg').Controller;

class CategoryController extends Controller {
  /**
   * 获取所有餐馆分类和数量
   */
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
      ctx.status = 200;
      ctx.body = {
        success: true,
        error_msg: '获取餐馆分类失败',
      };
    }
  }
  /**
   * 添加食品种类
   */
  async addCategory() {
    const { ctx, service } = this;
    const { type } = ctx.params;
    if (!type) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        error_msg: '食品种类错误',
      };
      return;
    }
    try {
      await service.shopping.category.addCategory(type);
      ctx.status = 200;
      ctx.body = {
        success: true,
        error_msg: '增加食品种类成功',
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        error_msg: '增加食品种类失败',
      };
    }
  }
  /**
   * 获取当前店铺食品种类
   */
  async findById() {
    const { ctx, service } = this;
    const { id } = ctx.params;
    if (!id) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        error_msg: '餐馆ID参数错误',
      };
      return;
    }
    try {
      await service.shopping.category.findById(id);
      ctx.status = 200;
      ctx.body = {
        success: true,
        error_msg: '获取当前店铺食品种类成功',
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        error_msg: '获取当前店铺食品种类失败',
      };
    }
  }
  /**
   * 清空食品分类
   */
  async emptyCategory() {
    const { ctx, service } = this;
    try {
      await service.shopping.category.deleteAllCategory();
      ctx.status = 200;
      ctx.body = {
        success: true,
        error_msg: '清空食品分类成功',
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        error_msg: '清空食品分类失败',
      };
    }
  }
}

module.exports = CategoryController;
