/**
 * API接口管理
 * 统一管理所有接口地址和参数
 */

import request from '@/utils/request'

export function updateSystem(query) {
  return request({
    url: '/system/version',
    method: 'get',
    params: query
  })
}

export function getSystemConfig(data) {
  return request({
    url: '/system/config',
    method: 'post',
    data: data
  })
}