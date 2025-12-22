import request from '@/utils/request';

export function getDeviceCount(data) {
  return request({
    url: '/maintain-api/deviceMessage/getDeviceCount',
    method: 'post',
    data: data,
  });
}

export function getProjectMessage(data) {
  return request({
    url: `/maintain-api/deviceMessage/page?current=${data.current}&size=${data.size}`,
    method: 'post',
    data: data,
  });
}

export function updateDiagnose(data) {
  return request({
    url: '/maintain-api/deviceMessage/updateDiagnose',
    method: 'post',
    data: data,
  });
}

export function getMessageDetail(data) {
  return request({
    url: '/maintain-api/deviceMessage/getMessageDetail',
    method: 'post',
    data: data,
  });
}
