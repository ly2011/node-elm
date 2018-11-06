'use strict';

const Controller = require('egg').Controller;
class SearchController extends Controller {
  async search() {
    const { ctx, service, app } = this;
    const { controller } = app;
    const { cities: citiesController } = controller.v1;
    let { type = 'search', city_id, keyword } = ctx.query;
    console.log('search: ', city_id, keyword);
    if (!keyword) {
      ctx.status = 200;
      ctx.body = {
        success: false,
        error_msg: '参数错误',
      };
      return;
    }
    if (isNaN(city_id)) {
      try {
        console.log('search', city_id);
        // console.log('ctx.controller: ', citiesController); // 不知道为何调用不了controller里面的方法
        const cityname = await service.v1.cities.getCityName();
        console.log('cityname: ', cityname);
        const cityInfo = await ctx.model.V1.Cities.cityGuess(cityname);
        city_id = cityInfo.id;
        console.log('cityInfo: ', cityInfo);
      } catch (err) {
        console.error('搜索地址时，获取定位城失败', err);
        ctx.body = {
          success: false,
          error_msg: '获取数据失败',
        };
        return;
      }
    }

    try {
      const cityInfo = await ctx.model.V1.Cities.getCityById(city_id);
      const resObj = await service.v1.address.searchPlace(keyword, cityInfo.name, type);
      const cityList = [];
      resObj.data.forEach(item => {
        cityList.push({
          name: item.title,
          address: item.address,
          latitude: item.location.lat,
          longitude: item.location.lng,
          geohash: item.location.lat + ',' + item.location.lng,
        });
      });
      ctx.body = {
        success: true,
        data: cityList,
      };
    } catch (err) {
      console.error(err);
      ctx.body = {
        success: false,
        error_msg: '获取地址信息失败',
      };
    }
  }
}

module.exports = SearchController;
