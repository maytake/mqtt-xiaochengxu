/**
 * API接口管理
 * 统一管理所有接口地址和参数
 */

import request from '@/utils/request'

export function triggerPidReport(data) {
  return request({
    url: '/itemDevice-api/devicePid/triggerPidReport',
    method: 'post',
    data: data
  })
}