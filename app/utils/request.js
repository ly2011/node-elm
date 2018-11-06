const fetch = require('node-fetch');

/**
 * 请求数据接口
 * @param {String} url
 * @param {Object} data
 * @param {String} method
 * @param {String} resType
 */
const request = async (url = '', data = {}, method = 'GET', resType = 'JSON') => {
  // let { method = 'GET', resType = 'JSON', data = {} } = options;
  method = method.toUpperCase();
  resType = resType.toUpperCase();
  if (method == 'GET') {
    let dataStr = ''; // 数据拼接字符串
    Object.keys(data).forEach(key => {
      dataStr += key + '=' + data[key] + '&';
    });

    if (dataStr !== '') {
      dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
      url = url + '?' + dataStr;
    }
  }

  const requestConfig = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  if (method == 'POST') {
    Object.defineProperty(requestConfig, 'body', {
      value: JSON.stringify(data),
    });
  }
  let responseJson;
  try {
    const response = await fetch(url, requestConfig);
    if (resType === 'TEXT') {
      responseJson = await response.text();
    } else {
      responseJson = await response.json();
    }
  } catch (err) {
    console.log('获取http数据失败', err);
    throw new Error(err);
  }
  return responseJson;
};

module.exports = request;
