'use strict';

const Service = require('egg').Service;

class CategoryService extends Service {
  /**
   * @return {Promise} 获取所有餐馆分类和数量
   */
  async getAllCategories() {
    return this.ctx.model.Shopping.Category.find({}, '-_id').exec();
  }
  async findById(id) {
    const cateEntity = await this.ctx.model.Shopping.Category.findOne({
      'sub_categories.id': id,
    });
    let categoryName = cateEntity.name;
    categoryName.sub_categories.forEach(item => {
      if (item.id === id) {
        categoryName += '/' + item.name;
      }
    });
    return categoryName;
  }
  /**
   * 删除食品分类
   * @param {String} id
   */
  async deleteCategory(id) {
    const query = {
      _id: id,
    };
    return this.ctx.model.Shopping.Category.remove(query);
  }
  /**
   * 批量删除食品分类
   */
  async deleteAllCategory() {
    return this.ctx.model.Shopping.Category.remove();
  }
}

module.exports = CategoryService;
