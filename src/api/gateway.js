import request from '@/utils/request';

export function readDeviceInfo(data) {
  return request({
    url: '/itemDevice-api/device/readDeviceInfo',
    method: 'post',
    data: data,
  });
}

export function delDevice(data) {
  return request({
    url: '/itemDevice-api/device/delDevice',
    method: 'post',
    data: data,
  });
}

export function getBindSubDeviceInfo(query) {
  return request({
    url: '/itemDevice-api/project/getBindSubDeviceInfo',
    method: 'get',
    params: query,
  });
}

export function getSubDeviceInfo(query) {
  return request({
    url: '/itemDevice-api/project/selectNotBindDeviceList',
    method: 'get',
    params: query,
  });
}

export function batchAddSubDevice(data) {
  return request({
    url: '/itemDevice-api/device/batchAddSubDevice',
    method: 'post',
    data: data,
  });
}

export function stopDisc(data) {
  return request({
    url: '/itemDevice-api/device/stopDisc',
    method: 'post',
    data: data,
  });
}

export function getBindDeviceTotal(query) {
  return request({
    url: '/itemDevice-api/project/getBindDeviceTotal',
    method: 'get',
    params: query
  });
}