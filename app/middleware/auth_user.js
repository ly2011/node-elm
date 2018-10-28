'use strict';
// 验证用户是否登录

module.exports = () => {
  return async (ctx, next) => {
    const admin_id = ctx.session.admin_id;
    if (!admin_id || !Number(admin_id)) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error_msg: '亲，您还没有登录',
      };
    } else {
      const admin = await ctx.service.admin.Admin.getAdminById(admin_id);
      if (!admin) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          error_msg: '亲，您还不是管理员',
        };
        return await next();
      }
    }
    await next();
  };
};
