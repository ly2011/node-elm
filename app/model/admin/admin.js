'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  // const ObjectId = Schema.ObjectId;

  const adminSchema = new Schema({
    user_name: String,
    password: String,
    // id: ObjectId,
    create_time: String,
    admin: { type: String, default: '管理员' },
    status: Number, // 1: 普通管理员、 2: 超级管理员
    avatar: { type: String },
    city: String,
  });
  // adminSchema.index({ id: 1 });
  return mongoose.model('Admin', adminSchema);
};
