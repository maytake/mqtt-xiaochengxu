import request from '@/utils/request';

export function projectList(query) {
  return request({
    url: '/itemDevice-api/project/list',
    method: 'get',
    params: query,
  });
}
export function treeProjec(parentCode) {
  return request({
    url: `/itemDevice-api/project/treeProjec/${parentCode}`,
    method: 'get',
  });
}
export function getToiletiemDetails(projectId) {
  return request({
    url: `/itemDevice-api/project/getToiletiemDetails/${projectId}`,
    method: 'get',
  });
}
