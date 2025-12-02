import { defineStore } from 'pinia';

const useProjectTreeStore = defineStore('projectTree', {
  // 原始数据
  state: () => ({
    buildingTree: {},
    selectedId: '', // 选中的id
  }),
  // 修改状态的方法
  actions: {
    setTreeData(data) {
      this.buildingTree = data;
    },
    setSelectedId(id) {
      this.selectedId = id;
    },
  },
});
export default useProjectTreeStore;
