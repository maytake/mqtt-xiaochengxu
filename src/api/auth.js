/**
 * API接口管理
 * 统一管理所有接口地址和参数
 */

import request from '@/utils/request';

export function getCode(query) {
  return request({
    url: '/code',
    method: 'get',
    header: {
      noNeedToken: true,
    },
    loading: false,
    params: query,
  });
}

export function loginIn(data) {
  return request({
    url: '/auth/oauth/token',
    method: 'post',
    header: {
      noNeedToken: true,
      'content-Type': 'application/x-www-form-urlencoded',
      Client_type: 'applet',
    },
    data: data,
  });
}

export function loginOut(data) {
  return request({
    url: '/auth/token/logout',
    method: 'delete',
    data: data,
  });
}

export function getMqttUserInfo(data) {
  return request({
    url: '/itemDevice-api/user/getMqttUserInfo',
    method: 'post',
    data: data,
  });
}
