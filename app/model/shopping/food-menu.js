/**
 * 食品分类
 */
'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ObjectId = Schema.ObjectId;

  const foodMenuSchema = new Schema({
    description: String,
    is_selected: { type: Boolean, default: true },
    icon_url: { type: String, default: '' },
    name: { type: String, isRequired: true },
    id: { type: Number, isRequired: true },
    restaurant_id: { type: Number, isRequired: true },
    type: { type: Number, default: 1 },
    foods: [{ type: ObjectId, ref: 'Food' }], // TODO: 食品 _id, ref 关联操作必须要使用_id(ObjectId)
  });

  foodMenuSchema.index({ id: 1 });

  const FoodMenu = mongoose.model('FoodMenu', foodMenuSchema);
  return FoodMenu;
};
