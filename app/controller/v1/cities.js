/**
 * 暂已废弃
 */

'use strict';

const Controller = require('egg').Controller;
const pinyin = require('pinyin');

class CitiesController extends Controller {
  async getCity() {
    const { ctx } = this;
    const { type } = ctx.query;
    let cityInfo;
    try {
      switch (type) {
        case 'guess':
          const city = await this.getCityName();
          cityInfo = await ctx.model.V1.Cities.cityGuess(city);
          break;
        case 'hot':
          cityInfo = await ctx.model.V1.Cities.cityHot();
          break;
        case 'group':
          cityInfo = await ctx.model.V1.Cities.cityGroup();
          break;
        default:
          ctx.body = {
            success: false,
            error_msg: '参数错误',
          };
          return;
      }
      ctx.body = {
        success: true,
        data: cityInfo,
      };
    } catch (err) {
      ctx.body = {
        success: false,
        error_smg: '获取数据失败',
      };
    }
  }
  async getCityById() {
    const { ctx } = this;
    const city_id = ctx.query.city_id || ctx.params.id;
    if (isNaN(city_id)) {
      ctx.body = {
        success: false,
        error_msg: '参数错误',
      };
      return;
    }
    try {
      const cityInfo = await ctx.model.V1.Cities.getCityById(city_id);
      ctx.body = {
        success: true,
        data: cityInfo,
      };
    } catch (err) {
      ctx.body = {
        success: false,
        error_msg: '获取数据失败',
      };
    }
  }
  async getCityName() {
    const { ctx, service } = this;
    let cityInfo;
    console.log('0000');
    try {
      console.log('1111');
      cityInfo = await service.v1.address.guessPosition();
      console.log('2222');
      /* 汉字转拼音 */
      const pinyinArr = pinyin(cityInfo.city, {
        style: pinyin.STYLE_NORMAL,
      });
      let cityName = '';
      pinyinArr.forEach(item => {
        cityName += item[0];
      });
      return cityName;
    } catch (err) {
      console.error('获取IP地址信息失败', err);
      ctx.body = {
        success: false,
        error_msg: '获取数据失败',
      };
      return;
    }
  }
  // 通过ip地址获取精确位置
  async getExactAddress() {
    const { ctx, service } = this;
    try {
      const position = await service.v1.address.geocoder();
      ctx.body = {
        success: true,
        data: position,
      };
    } catch (err) {
      console.error('获取精确位置信息失败');
      ctx.body = {
        success: false,
        error_msg: '获取精确位置信息失败',
      };
    }
  }
  // 通过geohash获取精确位置
  async pois() {
    const { ctx, service } = this;
    const geohash = ctx.params.geohash;
    try {
      if (geohash.indexOf(',') == -1) {
        throw new Error('参数错误');
      }
    } catch (err) {
      console.log('参数错误');
      ctx.body = {
        success: false,
        message: '参数错误',
      };
      return;
    }
    const poisArr = geohash.split(',');
    try {
      const result = await service.v1.address.getpois(poisArr[0], poisArr[1]);
      const address = {
        address: result.result.address,
        city: result.result.address_component.province,
        geohash,
        latitude: poisArr[0],
        longitude: poisArr[1],
        name: result.result.formatted_addresses.recommend,
      };
      ctx.body = {
        success: false,
        data: address,
      };
    } catch (err) {
      console.log('getpois返回信息失败');
      ctx.body = {
        success: false,
        error_msg: '获取数据失败',
      };
    }
  }
}

module.exports = CitiesController;
