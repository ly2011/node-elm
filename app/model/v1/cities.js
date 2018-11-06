'use strict';

const cityData = require('../../initData/cities');

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const citySchema = new Schema({
    data: {},
  });

  citySchema.statics.cityGuess = function(name) {
    return new Promise(async (resolve, reject) => {
      const firstWord = name ? name.substr(0, 1).toUpperCase() : null;
      try {
        const city = await this.findOne();
        Object.entries(city.data).forEach(item => {
          if (item[0] == firstWord) {
            item[1].forEach(cityItem => {
              if (cityItem.pinyin == name) {
                resolve(cityItem);
              }
            });
          }
        });
      } catch (error) {
        reject({
          success: false,
          message: '查找数据失败',
        });
        console.error(error);
      }
    });
  };

  citySchema.statics.cityHot = function() {
    return new Promise(async (resolve, reject) => {
      try {
        const city = await this.findOne();
        resolve(city.data.hotCities);
      } catch (error) {
        reject({
          success: false,
          message: '查找数据失败',
        });
        console.error(error);
      }
    });
  };

  citySchema.statics.cityGroup = function() {
    return new Promise(async (resolve, reject) => {
      try {
        const city = await this.findOne();
        const cityObj = city.data;
        delete cityObj._id;
        delete cityObj.hotCities;
        resolve(cityObj);
      } catch (error) {
        reject({
          success: false,
          message: '查找数据失败',
        });
        console.error(error);
      }
    });
  };

  citySchema.statics.getCityById = function(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const city = await this.findOne();
        Object.entries(city.data).forEach(item => {
          if (item[0] !== '_id' && item[0] !== 'hotCities') {
            item[1].forEach(cityItem => {
              if (cityItem.id == id) {
                resolve(cityItem);
              }
            });
          }
        });
      } catch (error) {
        reject({
          success: false,
          message: '查找数据失败',
        });
      }
    });
  };

  const Cities = mongoose.model('Cities', citySchema);

  // 初始化城市数据
  Cities.findOne((err, data) => {
    if (!data) {
      Cities.create({ data: cityData });
    }
  });

  return Cities;
};
