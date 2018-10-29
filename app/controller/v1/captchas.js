'use strict';

const captchapng = require('captchapng');

const Controller = require('egg').Controller;

class CaptchasController extends Controller {
  async getCaptchas() {
    const { ctx } = this;
    const cap = parseInt(Math.random() * 9000 + 1000, 10);
    const p = new captchapng(80, 30, cap);
    p.color(0, 0, 0, 0);
    p.color(80, 80, 80, 255);
    const base64 = p.getBase64();
    ctx.cookies.set('cap', cap, {
      maxAge: 60 * 1000,
      httpOnly: true,
    });
    ctx.status = 200;
    ctx.body = {
      success: true,
      code: 'data:image/png;base64,' + base64,
      error_msg: '获取验证码成功',
    };
  }
}

module.exports = CaptchasController;
