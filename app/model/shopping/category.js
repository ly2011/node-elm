/**
 * 店铺分类
 */
'use strict';

const categoryData = require('../../initData/shop-category');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const categorySchema = new Schema({
    count: Number,
    id: Number,
    ids: [],
    image_url: String,
    level: Number,
    name: String,
    sub_categories: [
      {
        id: Number,
        count: Number,
        image_url: String,
        level: Number,
        name: String,
      },
    ],
  });

  categorySchema.statics.addCategory = async function(type) {
    const categoryName = type.split('/');
    try {
      const allcate = await this.findOne();
      const subcate = await this.findOne({ name: categoryName[0] });
      allcate.count++;
      subcate.count++;
      subcate.sub_categories.map(item => {
        if (item.name === categoryName[1]) {
          return item.count++;
        }
      });
      await allcate.save();
      await subcate.save();
      console.log('保存店铺分类成功');
      return;
    } catch (error) {
      console.log('保存店铺分类失败');
      return;
    }
  };
  const Category = mongoose.model('Category', categorySchema);

  // 初始化店铺分类数据
  Category.findOne((err, data) => {
    if (!data) {
      categoryData.forEach(cate => {
        Category.create(cate);
      });
    }
  });

  return Category;
};
