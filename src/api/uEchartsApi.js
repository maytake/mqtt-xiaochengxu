import request from '@/utils/request';

export function queryDeviceStatisticGroup(data) {
  return request({
    url: '/data-api/group/queryDeviceStatisticGroup',
    method: 'post',
    data: data,
  });
}

export function queryHomeStatisticGroup(data) {
  return request({
    url: '/data-api/group/queryHomeStatisticGroup',
    method: 'post',
    data: data,
  });
}
