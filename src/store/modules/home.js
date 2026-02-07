import { projectList } from '@/api/home';

const state = {
  addressList: [],
  selectedAddress: null,
  loading: false,
};

const mutations = {
  SET_ADDRESS_LIST(state, list) {
    state.addressList = list;
  },
  SET_SELECTED_ADDRESS(state, address) {
    state.selectedAddress = address;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
};

const actions = {
  // 获取项目列表
  async getProjectList({ commit, state }) {
    try {
      const res = await projectList();
      const data = res.data || [];
      commit('SET_ADDRESS_LIST', data);
      // 如果还没有选中地址且有数据，默认选择第一个
      if (data.length > 0 && !state.selectedAddress) {
        commit('SET_SELECTED_ADDRESS', data[0]);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // 设置选中的地址
  setSelectedAddress({ commit }, address) {
    commit('SET_SELECTED_ADDRESS', address);
  },
};

const getters = {
  addressList: (state) => state.addressList,
  selectedAddress: (state) => state.selectedAddress,
  loading: (state) => state.loading,
  // 根据关键词过滤地址列表
  filteredAddressList: (state) => (keyword) => {
    if (!keyword) return state.addressList;
    return state.addressList.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword.toLowerCase()) ||
        item.provinceName.toLowerCase().includes(keyword.toLowerCase()) ||
        item.cityName.toLowerCase().includes(keyword.toLowerCase()) ||
        (item.areaName && item.areaName.toLowerCase().includes(keyword.toLowerCase()))
    );
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters,
};
