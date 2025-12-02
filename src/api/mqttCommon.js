import request from '@/utils/request';

export function getProductModelDetails(pointId) {
  return request({
    url: `/itemDevice-api/iotProductModel/getProductModelDetails/${pointId}`,
    method: 'get',
  });
}

export function readDevicePidVal(data) {
  return request({
    url: '/itemDevice-api/devicePid/readDevicePidVal',
    method: 'post',
    data: data,
  });
}

export function writeDevicePid(data) {
  return request({
    url: '/itemDevice-api/devicePid/writeDevicePid',
    method: 'post',
    data: data,
  });
}

export function resetDevicePid(data) {
  return request({
    url: '/itemDevice-api/devicePid/resetDevicePid',
    method: 'post',
    data: data,
  });
}

export function ctrlDevice(data) {
  return request({
    url: '/itemDevice-api/device/ctrlDevice',
    method: 'post',
    data: data,
  });
}

export function setSensingDistance(data) {
  return request({
    url: '/itemDevice-api/device/setSensingDistance',
    method: 'post',
    data: data,
  });
}
