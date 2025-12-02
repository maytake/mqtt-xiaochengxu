import { defineStore } from 'pinia';

export const useStore = defineStore('globalMqttInfo', {
  // 原始数据
  state: () => ({
    globalTopicInfo: {},
  }),
  // 修改状态的方法
  actions: {
    setUserInfo(info) {
      this.globalTopicInfo = info;
    },
  },
});
