'use strict'

const crypto = require('crypto')
const dayjs = require('dayjs')
// const Controller = require('egg').Controller
const BaseController = require('../../core/base-controller')

class AdminController extends BaseController {
  async login() {
    const { ctx } = this
    const createRule = {
      user_name: { type: 'string' },
      password: { type: 'string' }
      // status: { type: 'number' },
    }
    // 校验参数
    // ctx.validate(createRule);
    // eslint-disable-next-line
    const { user_name, password, status = 1 } = ctx.request.body
    if (!user_name) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '用户名错误'
      }
      return
    }
    if (!password) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '密码错误'
      }
      return
    }
    const newpassword = this._encryption(password)
    try {
      const admin = await ctx.service.admin.admin.getAdminByName(user_name)
      // console.log('admin: ', admin)
      if (!admin) {
        // const adminTip = status === 1 ? '管理员' : '超级管理员';
        // const newAdmin = {
        //   user_name,
        //   password: newpassword,
        //   create_time: dayjs().format('YYYY-MM-DD'),
        //   admin: adminTip,
        //   status,
        //   city: '',
        // };
        // await ctx.service.admin.admin.newAndSave(newAdmin);
        // ctx.status = 200;
        // ctx.body = {
        //   success: true,
        //   error_msg: '注册管理员成功',
        // };
        ctx.status = 200
        ctx.body = {
          success: false,
          error_msg: '您还没注册，请到注册页面注册再登录'
        }
      } else if (newpassword.toString() !== admin.password.toString()) {
        ctx.status = 200
        ctx.body = {
          success: false,
          error_msg: '该用户已存在，密码输入错误'
        }
      } else {
        ctx.session.admin_id = admin.id
        ctx.status = 200
        ctx.body = {
          success: true,
          error_msg: '登录成功'
        }
      }
    } catch (error) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '登录管理员失败'
      }
    }
  }
  async register() {
    const { ctx } = this
    const createRule = {
      user_name: { type: 'string' },
      password: { type: 'string' }
      // status: { type: 'number' },
    }
    // 校验参数
    // ctx.validate(createRule);
    const { user_name, password, status = 1 } = ctx.request.body
    if (!user_name) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '用户名错误'
      }
      return
    }
    if (!password) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '密码错误'
      }
      return
    }
    try {
      const admin = await ctx.service.admin.admin.getAdminByName(user_name)
      if (admin) {
        ctx.status = 200
        ctx.body = {
          success: true,
          error_msg: '该用户已经存在,请去登录页面登录'
        }
      } else {
        const adminTip = status === 1 ? '管理员' : '超级管理员'
        const admin_id = await this.getId('admin_id')
        const newpassword = this._encryption(password)
        const newAdmin = {
          user_name,
          password: newpassword,
          create_time: dayjs().format('YYYY-MM-DD'),
          id: admin_id,
          admin: adminTip,
          status
        }
        await ctx.service.admin.admin.newAndSave(newAdmin)
        ctx.status = 200
        ctx.body = {
          success: true,
          error_msg: '注册管理员成功'
        }
      }
    } catch (error) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '注册管理员失败'
      }
    }
  }
  async singout() {
    const { ctx } = this
    try {
      delete ctx.session.admin_id
      ctx.status = 200
      ctx.body = {
        success: true,
        error_msg: '退出成功'
      }
    } catch (error) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '退出失败'
      }
    }
  }
  async getAllAdmin() {
    const { ctx, service } = this
    const { currentPage = 1, pageSize = 10, ...restParam } = ctx.query
    const offset = (currentPage - 1) * pageSize
    try {
      const allAdmin = await service.admin.admin.getAllAdmin(restParam, offset, pageSize)
      ctx.status = 200
      ctx.body = {
        success: true,
        data: allAdmin,
        error_msg: '获取管理员列表成功'
      }
    } catch (error) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '获取管理员列表失败'
      }
    }
  }
  async getAdminCount() {
    const { ctx, service } = this
    const params = ctx.query
    try {
      const count = await service.admin.admin.getAdminCount(params)
      ctx.status = 200
      ctx.body = {
        success: true,
        data: count,
        error_msg: '获取管理员数量成功'
      }
    } catch (error) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '获取管理员数量失败'
      }
    }
  }
  async getAdminInfo() {
    const { ctx, service } = this
    const admin_id = ctx.session.admin_id
    console.log('getAdminInfo: ', ctx.session)

    if (!admin_id) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '获取管理员信息失败'
      }
      return
    }
    try {
      const info = await service.admin.admin.getAdminInfo(admin_id)
      if (!info) {
        ctx.status = 200
        ctx.body = {
          success: false,
          error_msg: '未找到当前管理员'
        }
        return
      }
      ctx.status = 200
      ctx.body = {
        success: true,
        data: info,
        error_msg: '获取管理员信息成功'
      }
    } catch (error) {
      ctx.status = 200
      ctx.body = {
        success: false,
        error_msg: '获取管理员信息失败'
      }
    }
  }
  _encryption(password) {
    const newpassword = this._Md5(this._Md5(password).substr(2, 7) + this._Md5(password))
    return newpassword
  }
  _Md5(password) {
    const md5 = crypto.createHash('md5')
    return md5.update(password).digest('base64')
  }
}

module.exports = AdminController
