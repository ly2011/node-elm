'use strict';

const Service = require('egg').Service;
const request = require('../../utils/request');

class AddressService extends Service {
  // 获取定位地址
  async guessPosition() {
    const { ctx } = this;
    const { tencentkey, tencentkey2, tencentkey3 } = this.config.tencent_map;
    console.log('tencentkey, tencentkey2, tencentkey3', this.config.tencent_map);
    return new Promise(async (resolve, reject) => {
      let ip = ctx.request.ip || '';
      console.log('ip: ', ip);
      if (process.env.NODE_ENV == 'development') {
        ip = '218.13.14.202';
      }
      try {
        console.log('3333');
        let result = await request('http://apis.map.qq.com/ws/location/v1/ip', {
          ip,
          key: tencentkey,
        });
        console.log('4444');
        if (result.status != 0) {
          result = await request('http://apis.map.qq.com/ws/location/v1/ip', {
            ip,
            key: tencentkey2,
          });
        }
        if (result.status != 0) {
          result = await request('http://apis.map.qq.com/ws/location/v1/ip', {
            ip,
            key: tencentkey3,
          });
        }
        if (result.status == 0) {
          const cityInfo = {
            lat: result.result.location.lat,
            lng: result.result.location.lng,
            city: result.result.ad_info.city,
          };
          cityInfo.city = cityInfo.city.replace(/市$/, '');
          console.log('service: ', cityInfo);
          resolve(cityInfo);
        } else {
          console.log('定位失败', result);
          reject('定位失败');
        }
      } catch (err) {
        console.log('guessPosition: ', err);
        reject(err);
      }
    });
  }
  // 搜索地址
  async searchPlace(keyword, cityName, type = 'search') {
    const { tencentkey } = this.config.tencent_map;
    try {
      const resObj = await request('http://apis.map.qq.com/ws/place/v1/search', {
        key: tencentkey,
        keyword: encodeURIComponent(keyword),
        boundary: 'region(' + encodeURIComponent(cityName) + ',0)',
        page_size: 10,
      });
      if (resObj.status == 0) {
        return resObj;
      }
      throw new Error('搜索位置信息失败');
    } catch (err) {
      throw new Error(err);
    }
  }
  // 测量距离
  async getDistance(from, to, type) {
    const { baidukey, baidukey2 } = this.config.baidu_map;
    try {
      let res;
      res = await request('http://api.map.baidu.com/routematrix/v2/driving', {
        ak: baidukey,
        output: 'json',
        origins: from,
        destinations: to,
      });
      if (res.status !== 0) {
        res = await request('http://api.map.baidu.com/routematrix/v2/driving', {
          ak: baidukey2,
          output: 'json',
          origins: from,
          destinations: to,
        });
      }
      if (res.status == 0) {
        const positionArr = [];
        let timevalue;
        res.result.forEach(item => {
          timevalue = parseInt(item.duration.value) + 1200;
          let durationtime = Math.ceil((timevalue % 3600) / 60) + '分钟';
          if (Math.floor(timevalue / 3600)) {
            durationtime = Math.floor(timevalue / 3600) + '小时' + durationtime;
          }
          positionArr.push({
            distance: item.distance.text,
            order_lead_time: durationtime,
          });
        });
        if (type == 'tiemvalue') {
          return timevalue;
        }
        return positionArr;
      }
      throw new Error('调用百度地图测距失败');
    } catch (err) {
      console.log('获取位置距离失败');
      throw new Error(err);
    }
  }
  // 通过ip地址获取精确位置
  async geocoder() {
    const { tencentkey } = this.config.tencent_map;
    try {
      const address = await this.guessPosition();
      const res = await request('http://apis.map.qq.com/ws/geocoder/v1/', {
        key: tencentkey,
        location: address.lat + ',' + address.lng,
      });
      if (res.status == 0) {
        return res;
      }
      throw new Error('获取具体位置信息失败');
    } catch (err) {
      console.log('geocoder获取定位失败');
      throw new Error(err);
    }
  }
  // 通过geohash获取精确位置
  async getpois(lat, lng) {
    const { tencentkey } = this.config.tencent_map;
    try {
      const res = await request('http://apis.map.qq.com/ws/geocoder/v1/', {
        key: tencentkey,
        location: lat + ',' + lng,
      });
      if (res.status == 0) {
        return res;
      }
      throw new Error('通过获geohash取具体位置失败');
    } catch (err) {
      console.log('getpois获取定位失败');
      throw new Error(err);
    }
  }
}

module.exports = AddressService;
