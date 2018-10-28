'use strict';

const Service = require('egg').Service;

class AdminService extends Service {
  /**
   * 根据管理员名称查找管理员
   * @param {String} name 管理员名称
   * @return {Promse[admin]} 承载管理员的 Promise 对象
   */
  async getAdminByName(name) {
    const query = {
      user_name: new RegExp('^' + name + '$', 'i'),
    };
    // console.log(this.ctx.model);
    return this.ctx.model.Admin.Admin.findOne(query).exec();
  }
  /**
   * 根据管理员ID，查找管理员
   * @param {String} id 管理员id
   * @return {Promise[admin]} 承载管理员的 Promise 对象
   */
  async getAdminById(id) {
    const query = {
      _id: id,
    };
    return this.ctx.model.Admin.Admin.findOne(query).exec();
  }
  /**
   * 根据用户ID列表，获取一组用户
   * @param {Array} ids 管理员ID列表
   * @return {Promise[admins]} 承载用户列表的 Promise 对象
   */
  async getUsersByIds(ids = []) {
    const query = {
      _id: { $in: ids },
    };
    return this.ctx.model.Admin.Admin.find(query).exec();
  }
  /**
   * 创建一个新的管理员
   * @param {Object} params
   */
  async newAndSave(params = {}) {
    const admin = new this.ctx.model.Admin.Admin();
    Object.keys(params).forEach(key => {
      admin[key] = params[key];
    });
    return admin.save();
  }
  /**
   * 获取管理员列表
   * @param {Number} offset 偏移量
   * @param {Number} limit 每页显示条数
   */
  async getAllAdmin(offset = 0, limit = 20) {
    const allAdmin = this.ctx.model.Admin.Admin
      .find({}, '-password')
      .sort({ _id: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .exec();
    return allAdmin;
  }

  /**
   * 获取关键词能搜索到的管理员数量
   * @param {String} query 搜索关键词
   */
  async getAdminCount(query) {
    const count = this.ctx.model.Admin.Admin.count(query).exec();
    return count;
  }

  /**
   * 获取管理员信息
   * @param {String} id 管理员ID
   */
  async getAdminInfo(id) {
    const query = {
      _id: id,
    };
    const info = this.ctx.model.Admin.Admin.findOne(query, '-_id -__v -password').exec();
    return info;
  }
}

module.exports = AdminService;
