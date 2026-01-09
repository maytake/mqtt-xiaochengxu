<template>
  <view class="page" @tap="handlePageTap">
    <view class="page-content">
      <!-- 顶部地址选择 -->
      <view class="header-section">
        <view class="location-selector" @click="selectAddress">
          <view class="location-icon">
            <text class="font_family location-icon-text">&#xe60c;</text>
          </view>
          <view class="location-text">{{ selectedAddress?.name || 'TCK产业园' }}</view>
          <view class="location-arrow">
            <u-icon name="arrow-down" size="16" color="#666"></u-icon>
          </view>
        </view>
      </view>

      <!-- 楼层选择 -->
      <view class="floor-selector">
        <lk-tree
          style="width: 100%"
          v-model="selectedValue"
          :data="treeData"
          node-key="projectId"
          :props="defaultProps"
          placeholder="请选择部门"
          @node-click="handleNodeClick" />
      </view>

      <!-- 厕所施工图 -->
      <view class="toilet-map-container">
        <view class="toilet-map-card">
          <!-- 厕所地图 -->
          <view class="toilet-map">
            <toilet-map :imageUrl="imageUrl" :devicesList="devicesList" :locationToilet="locationToilet" />
            <view class="screen-content" v-if="imageUrl">
              <view class="screen-inner" @click="handldeGo">
                <text class="font_family m-full">&#xe62e;</text>
                <text class="screen-text">全屏观看</text>
              </view>
            </view>
          </view>
          <!-- 厕所地图-end -->
        </view>
      </view>

      <!-- 统计表格 -->
      <view class="statistical-table-container">
        <charts-bar
          @changeRange="handleChangeRange"
          @changeDate="handleChangeDate"
          :data="statisticalData"
          :ready="statisticalReady"
          :defaultRange="currentRange"
          ref="chartsBarRef"
          :buttonTab="[
            { label: '按月', value: 'month' },
            { label: '按天', value: 'day' },
          ]" />
      </view>
      <!-- 统计表格-end -->
    </view>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue';
import { onLoad, onUnload, onPullDownRefresh } from '@dcloudio/uni-app';
import { storeToRefs } from 'pinia';
const { proxy } = getCurrentInstance();
import toiletMap from '@/components/toilet-map/index.vue';
import LkTree from '@/components/lk-tree/index.vue';
import ChartsBar from '@/components/charts-bar/index.vue';

import { treeProjec, getToiletiemDetails } from '@/api/home';
import { queryHomeStatisticGroup } from '@/api/uEchartsApi';
import { projectList } from '@/api/home';
import useProjectTreeStore from '@/stores/projectTree';
const buildingTreeStore = useProjectTreeStore();
import { useStore } from '@/stores/index';
const mainStore = useStore();
import { formatDate } from '@/utils/common';
const selectedAddress = ref({});
const locationToilet = ref('');
const imageUrl = ref('');
const devicesList = ref([]);
const treeData = ref([]);
const selectedValue = ref(8);
const defaultProps = ref({
  children: 'children',
  label: 'name',
});

const chartsBarRef = ref(null);
const statisticalData = ref({});
const statisticalReady = ref(false);
// 当前选中的统计范围（month/day）
const currentRange = ref('month');
// 当前已展示的按月区间
const currentMonthRange = ref({
  statDateMonth: '',
  endDateMonth: '',
});
// 当前已展示的按天区间
const currentDayRange = ref({
  statrDate: '',
  endDate: '',
});

// 公用：构造“按月，往前推12个月”的统计参数
const buildLastMonthParams = () => {
  const now = new Date();
  const endDate = formatDate(now, 'yyyy-MM');
  // 往前推12个月
  const startDateObj = new Date(now);
  startDateObj.setMonth(now.getMonth() - 6);
  const statrDate = formatDate(startDateObj, 'yyyy-MM');

  return {
    dataType: 1,
    statDateMonth: statrDate,
    endDateMonth: endDate,
  };
};

// 公用：构造“按天，往前推6天”的统计参数
const buildLastDayParams = () => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const endDate = formatDate(now, 'yyyy-MM-dd');
  const startDateObj = new Date(now);
  startDateObj.setDate(now.getDate() - 6);
  const statrDate = formatDate(startDateObj, 'yyyy-MM-dd');
  return {
    dataType: 2,
    statrDate,
    endDate,
  };
};

// 公用：构造“按月，整体往前/往后推6个月”的统计参数（基于当前已展示区间）
const buildMove6MonthParams = (type, currentRange) => {
  const { statDateMonth, endDateMonth } = currentRange || {};
  // 如果当前没有区间，就退回到默认最近区间
  if (!statDateMonth || !endDateMonth) {
    return buildLastMonthParams();
  }

  const parseMonth = (str) => {
    const [year, month] = (str || '').split('-').map(Number);
    return new Date(year || 1970, (month || 1) - 1, 1);
  };

  const addMonths = (date, n) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + n);
    return d;
  };

  const startDate = parseMonth(statDateMonth);
  const endDate = parseMonth(endDateMonth);
  const step = type === 'prev' ? -6 : 6;
  const newStart = addMonths(startDate, step);
  const newEnd = addMonths(endDate, step);

  return {
    dataType: 1,
    statDateMonth: formatDate(newStart, 'yyyy-MM'),
    endDateMonth: formatDate(newEnd, 'yyyy-MM'),
  };
};

// 公用：构造“按天，整体往前/往后推7天”的统计参数（基于当前已展示区间）
const buildMove7DayParams = (type, currentRange) => {
  const { statrDate, endDate } = currentRange || {};
  // 如果当前没有区间，就退回到默认最近区间
  if (!statrDate || !endDate) {
    return buildLastDayParams();
  }

  const parseDay = (str) => new Date((str || '').replace(/-/g, '/'));
  const addDays = (date, n) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  };

  const startDate = parseDay(statrDate);
  const endDateDate = parseDay(endDate);
  const step = type === 'prev' ? -7 : 7;
  const newStart = addDays(startDate, step);
  const newEnd = addDays(endDateDate, step);

  return {
    dataType: 2,
    statrDate: formatDate(newStart, 'yyyy-MM-dd'),
    endDate: formatDate(newEnd, 'yyyy-MM-dd'),
  };
};

onLoad(async () => {
  const url = proxy.$getCurrentRoute();
  const isLogin = proxy.$checkLogin(url);
  if (isLogin) {
    // 加载数据
    initData();
  }

  uni.$on('selected-address', (data) => {
    getFloorTreeByProjectId(data);
  });
  // 刷新首页厕所地图
  uni.$on('refresh-map', () => {
    getToiletFn(selectedValue.value);
  });

   

});

onUnload(() => {
  // 页面卸载时再移除监听，防止重复注册
  uni.$off('selected-address');
  uni.$off('refresh-map');
});

// 下拉刷新首页厕所地图
// 下拉刷新后请求完成主动收起下拉动画
onPullDownRefresh(async () => {
  try {
    getToiletFn(selectedValue.value);
    const params = buildLastMonthParams();
    currentMonthRange.value = {
      statDateMonth: params.statDateMonth,
      endDateMonth: params.endDateMonth,
    };
    getStatisticalData(params);
  } finally {
    console.log('下拉刷新完成');
    uni.stopPullDownRefresh();
  }
});

async function initData() {
  // 获取第一个默认地址
  const res = await getAddressList();
  if (res.code === 0) {
    const data = res.data || [];
    const itemAddress = data[0];
    getFloorTreeByProjectId(itemAddress);
  }
}

// 根据选中的选项，重新获取楼栋楼层树
function getFloorTreeByProjectId(itemAddress) {
  selectedAddress.value = itemAddress; // 选中项目地址
  mainStore.setProjectItem(itemAddress); // 设置项目地址
  selectedValue.value = ''; // 清空楼层选择
  getTreeProject(); // 重新获取楼层树
}

// 获取地址列表
async function getAddressList() {
  const res = await projectList();
  return res;
}

// 处理页面点击事件，用于小程序环境下的点击外部检测
const handlePageTap = (e) => {
  // 触发全局事件，通知所有 lk-tree 组件
  uni.$emit('page-tap', e);
};

const clearToiletData = () => {
  imageUrl.value = '';
  devicesList.value = [];
};

const handleNodeClick = (node) => {
  uni.showToast({
    title: `选中: ${node.nameSr}`,
    icon: 'none',
  });
  console.log('node', node);
  locationToilet.value = node.nameSr;
  buildingTreeStore.setSelectedId(node.projectId);
  clearToiletData();
  if (node.level == 3) {
    // 如果当前选中的是'按天'，重置为默认的'按月'
    currentRange.value = 'month';

    getToiletFn(node.projectId);
    const params = buildLastMonthParams();
    currentMonthRange.value = {
      statDateMonth: params.statDateMonth,
      endDateMonth: params.endDateMonth,
    };
    getStatisticalData(params);
  }
};
// 遍历树节点，找出第一个级最底层的节点并获取projectId的值
const getFirstLeafNode = (node) => {
  for (let i = 0; i < node.length; i++) {
    if (node[i].children && node[i].children.length > 0) {
      return getFirstLeafNode(node[i].children);
    }
    return node[i];
  }
};

const getTreeProject = async () => {
  const { parentCode } = selectedAddress.value;
  if (!parentCode) return;
  const res = await treeProjec(parentCode);
  const { code, data } = res || {};
  if (code === 0) {
    treeData.value = data;
    buildingTreeStore.setTreeData(data);
    // 获取第一个级最底层的节点并获取projectId的值，请求厕所施工图
    const { projectId, level, nameSr } = getFirstLeafNode(data) || {};
    clearToiletData();
    if (level == 3) {
      selectedValue.value = projectId;
      buildingTreeStore.setSelectedId(projectId);
      locationToilet.value = nameSr;

      getToiletFn(projectId);
      currentRange.value = 'month';
      const params = buildLastMonthParams();
      currentMonthRange.value = {
        statDateMonth: params.statDateMonth,
        endDateMonth: params.endDateMonth,
      };
      setTimeout(() => {
        getStatisticalData(params);
      }, 200);
    }
  }
};

const getToiletFn = async (projectId) => {
  const res = await getToiletiemDetails(projectId);
  const { code, data } = res || {};
  if (code === 0) {
    const { imageUrl: imgUrl, projectPointList } = data || {};
    imageUrl.value = imgUrl;
    devicesList.value = projectPointList;
  }
};

const selectAddress = () => {
  const query = encodeURIComponent(JSON.stringify(selectedAddress.value));
  uni.navigateTo({
    url: `/pages/home/addressSelect?selectedAddress=${query}`,
  });
};

const handldeGo = () => {
  const data = { imageUrl: imageUrl.value, devicesList: devicesList.value, locationToilet: locationToilet.value };
  const query = encodeURIComponent(JSON.stringify(data));
  uni.navigateTo({
    url: `/pages/home/toiletMap?data=${query}`,
  });
};

const handleChangeRange = (range) => {
  // 更新当前选中的范围
  currentRange.value = range;
  let params = {};
  if (range === 'month') {
    params = buildLastMonthParams();
    currentMonthRange.value = {
      statDateMonth: params.statDateMonth,
      endDateMonth: params.endDateMonth,
    };
  } else {
    params = buildLastDayParams();
    currentDayRange.value = {
      statrDate: params.statrDate,
      endDate: params.endDate,
    };
  }

  getStatisticalData(params);
};

const handleChangeDate = (type, range = 'month') => {
  let params = {};
  if (range === 'month') {
    if (type === 'prev') {
      // 往前推6个月
      params = buildMove6MonthParams('prev', currentMonthRange.value);
    } else {
      // 往后推6个月
      params = buildMove6MonthParams('next', currentMonthRange.value);
      // 校验：开始时间必须小于当前时间
      const now = new Date();
      const currentMonth = formatDate(now, 'yyyy-MM');
      if (params.statDateMonth >= currentMonth) {
        uni.showToast({
          title: '开始时间不能大于等于当前时间',
          icon: 'none',
          duration: 2000,
        });
        return;
      }
    }
    currentMonthRange.value = {
      statDateMonth: params.statDateMonth,
      endDateMonth: params.endDateMonth,
    };
  } else {
    if (type === 'prev') {
      // 往前推7天
      params = buildMove7DayParams('prev', currentDayRange.value);
    } else {
      // 往后推7天
      params = buildMove7DayParams('next', currentDayRange.value);
      // 校验：开始时间必须小于当前时间
      const now = new Date();
      const today = formatDate(now, 'yyyy-MM-dd');
      if (params.statrDate >= today) {
        uni.showToast({
          title: '开始时间不能大于等于当前时间',
          icon: 'none',
          duration: 2000,
        });
        return;
      }
    }
    currentDayRange.value = {
      statrDate: params.statrDate,
      endDate: params.endDate,
    };
  }

  getStatisticalData(params);
};

async function getStatisticalData(objParams) {
  const params = { homeId: selectedValue.value, infoType: 2, ...objParams };
  try {
    statisticalReady.value = false;
    const res = await queryHomeStatisticGroup(params);
    const { code, data } = res || {};
    if (code === 0) {
      const { y = {} } = data || {};
      y.data = y.data.map((item) => Math.round(item / 1000));
      statisticalData.value = data || {};
    }
  } finally {
    statisticalReady.value = true;
  }
}
</script>

<style lang="scss" scoped>
.page {
  background: linear-gradient(90deg, #efefef 0%, #f7f7f7 50%, #fff 100%);
  min-height: 100vh;
  overflow: hidden;
}
.page-content {
  padding: 24rpx;
}
.header-section {
  margin: 30rpx 0 0;
}

.location-selector {
  display: inline-flex;
  align-items: center;

  padding: 24rpx 0;
  border-radius: 16rpx;

  .location-icon {
    margin-right: 12rpx;
  }
  .location-icon-text {
    font-size: 26rpx;
    color: #333;
  }
  .location-text {
    font-size: 30rpx;
    color: #333;
  }

  .location-arrow {
    margin-left: 16rpx;
  }
}

.floor-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14rpx 32rpx;
  background: linear-gradient(90deg, #e6e6e6 0%, #ebebeb 50%, #f5f5f5 100%);
  border-radius: 16rpx;
  margin-top: 10rpx;
  position: relative;
}

.toilet-map-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 60rpx;
}

.toilet-map-card {
  background: linear-gradient(90deg, #ededed 0%, #e5e5e5 50%, #e8e8e8 100%);
  border-radius: 24rpx;
  padding: 0 32rpx;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.12);
  width: 100%;
  position: relative;
}

// 厕所地图
.toilet-map {
  margin: 42rpx 0;
}
.toilet-map-empty {
  margin: 60rpx 0;
  overflow: hidden;
}
.screen-content {
  margin-top: 30rpx;
  line-height: 70rpx;
  display: flex;
  justify-content: flex-end;
}
.screen-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #574b43;
  background: linear-gradient(90deg, #ededed 0%, #e5e5e5 50%, #e8e8e8 100%);
  line-height: 56rpx;
  width: 180rpx;
  border-radius: 100rpx;
}
.screen-text {
  font-size: 26rpx;
  color: #574b43;
}
.m-full {
  margin-right: 8rpx;
  font-size: 24rpx;
  color: #574b43;
}
.statistical-table-container {
  margin: 60rpx 0 200rpx;
}
</style>
