<template>
  <view class="page">
    <!-- 顶部统计与环形进度 -->
    <view class="summary-card">
      <view class="work-status">设备工作状态：</view>
      <view class="circle-wrap">
        <view class="bg-circle">
          <view class="bg-circle-wrap">
            <cmd-progress
              type="circle"
              :percent="percent"
              stroke-color="#574b43"
              :stroke-width="6"
              :width="150"
              :showInfo="false"></cmd-progress>
            <view class="circle-text">
              <view class="circle-text-value">
                {{ percent }}
                <text class="circle-text-value-unit">%</text>
              </view>
              <view class="circle-text-status">正常</view>
            </view>
          </view>
        </view>
      </view>
      <view class="legend">
        <view class="legend-item normal">
          <view class="legend-circle"><text class="font_family data-icon">&#xe638;</text></view>
          <text class="legend-text">正常工作（{{ normalCount }}）</text>
          <text class="legend-value">{{ normalPercent }}%</text>
        </view>
        <view class="legend-item warn">
          <view class="legend-circle"><text class="font_family data-icon">&#xe638;</text></view>
          <text class="legend-text">故障警报（{{ faultCount }}）</text>
          <text class="legend-value">{{ faultPercent }}%</text>
        </view>
      </view>
    </view>

    <!-- 列表区域 -->
    <view class="list">
      <!-- 筛选切换 -->
      <view class="tabs">
        <view :class="['tab', activeTab === 'pending' ? 'active' : '']" @click="activeTab = 'pending'">待处理</view>
        <view :class="['tab', activeTab === 'done' ? 'active' : '']" @click="activeTab = 'done'">已处理</view>
      </view>
      <view v-for="item in currentList" :key="item.id" class="card" v-if="currentList.length > 0">
        <view class="card-header">
          <view class="title-row">
            <view class="model-text">故障产生日期：{{ item.createTime }}</view>
            <view class="model-text" v-if="activeTab === 'done'">故障处理日期：{{ item.updateTime }}</view>
          </view>
        </view>
        <view class="device-wrap">
          <image
            :src="item.img"
            mode="widthFix"
            class="device-img"
            lazy-load
            :placeholder="'/static/images/placeholder.jpg'" />
        </view>
        <view class="desc">
          <view class="place">{{ item.projectName }}</view>
          <view class="sn">型号：{{ item.productModel }}</view>
        </view>

        <view class="bottom-row">
          <view class="battery">
            <text class="font_family battery-icon">&#xe62d;</text>
            <text>{{ item.faultDesc }}</text>
          </view>
          <view v-if="activeTab === 'pending'" class="btn-view" @click="seeDetail(item)">查看</view>
        </view>
      </view>

      <!-- 列表底部加载更多 -->
      <uni-load-more :status="currentLoadStatus" iconType="circle" />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, getCurrentInstance, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { onReachBottom, onShow, onLoad } from '@dcloudio/uni-app';
import { getProjectMessage, getDeviceCount } from '@/api/message';
import cmdProgress from '@/components/cmd-progress/cmd-progress.vue';

import { useStore } from '@/stores/index';
const { projectItem } = storeToRefs(useStore());

// 使用 computed 创建响应式的 projectId
const projectId = computed(() => projectItem.value?.projectId);
const { proxy } = getCurrentInstance();
const activeTab = ref('pending');
// 独立的加载状态
const pendingLoadStatus = ref('more'); // more | loading | noMore
const doneLoadStatus = ref('more');
const percent = ref(80);
// 列表与分页
const pendingList = ref([]);
const doneList = ref([]);
const pendingPage = ref(0);
const donePage = ref(0);
const pageSize = 5;
const pendingHasMore = ref(true);
const doneHasMore = ref(true);

const currentList = computed(() => (activeTab.value === 'pending' ? pendingList.value : doneList.value));
const currentLoadStatus = computed(() =>
  activeTab.value === 'pending' ? pendingLoadStatus.value : doneLoadStatus.value
);
const currentHasMore = computed(() => (activeTab.value === 'pending' ? pendingHasMore.value : doneHasMore.value));
const isLoading = computed(() =>
  activeTab.value === 'pending' ? pendingLoadStatus.value === 'loading' : doneLoadStatus.value === 'loading'
);

const faultCount = ref(0);
const normalCount = ref(0);

const normalPercent = computed(() => {
  const getPercent = (normalCount.value / (normalCount.value + faultCount.value)) * 100 || 0;
  percent.value = Math.round(getPercent);
  return Math.round(getPercent); // 保留2位小数
});
const faultPercent = computed(() => {
  const getPercent = (faultCount.value / (normalCount.value + faultCount.value)) * 100 || 0;
  return Math.round(getPercent); // 保留2位小数
});
onLoad(() => {
  getDeviceCountFn(); // 获取故障设备数量
});

onShow(() => {
  console.log('projectItem', projectItem.value.projectId);
  const url = proxy.$getCurrentRoute();
  const isLogin = proxy.$checkLogin(url);
  if (isLogin) {
    if (pendingList.value.length === 0) loadMore();
  }
});

onReachBottom(() => {
  loadMore();
});

// 获取故障设备数量
async function getDeviceCountFn() {
  if (!projectId.value) return; // 如果 projectId 不存在，直接返回
  const res2 = await getDeviceCount({ projectId: projectId.value });
  if (res2.code === 0) {
    const { normalCount: normalCountData, faultCount: faultCountData } = res2.data || {};
    faultCount.value = faultCountData || 0;
    normalCount.value = normalCountData || 0;
  }
}

async function getList(status = 0, page = 1) {
  if (!projectId.value) return { list: [], hasMore: false }; // 如果 projectId 不存在，直接返回
  const params = {
    current: page,
    size: pageSize,
    projectId: projectId.value, // 项目id
    dealStatus: status, // 处理情况,0未处理，1已处理
  };
  try {
    const res = await getProjectMessage(params);
    if (res.code === 0) {
      const { records = [], total = 0, pages = 0 } = res.data || {};
      return {
        list: records,
        hasMore: pages < total,
      };
    }
  } catch (error) {}

  return {
    list: [],
    hasMore: false,
  };
}

async function loadMore() {
  // 如果正在加载或没有更多数据，则返回
  if (isLoading.value || !currentHasMore.value) return;
  const tab = activeTab.value;
  // 设置加载状态为加载中
  if (tab === 'pending') pendingLoadStatus.value = 'loading';
  else doneLoadStatus.value = 'loading';

  // 计算下一页
  const nextPage = tab === 'pending' ? pendingPage.value + 1 : donePage.value + 1;
  // 调用 getList 获取数据，0未处理，1已处理
  const status = tab === 'pending' ? 0 : 1;
  const { list, hasMore } = await getList(status, nextPage);
  // 更新列表
  if (tab === 'pending') {
    pendingList.value = pendingList.value.concat(list);
    pendingPage.value = nextPage;
    // 更新是否有更多数据
    pendingHasMore.value = hasMore;
    // 更新加载状态
    pendingLoadStatus.value = hasMore ? 'more' : 'noMore';
  } else {
    doneList.value = doneList.value.concat(list);
    donePage.value = nextPage;
    doneHasMore.value = hasMore;
    doneLoadStatus.value = hasMore ? 'more' : 'noMore';
  }
}

// Tab 切换首次加载
watch(activeTab, (val) => {
  if (val === 'pending' && pendingList.value.length === 0) {
    loadMore();
  } else if (val === 'done' && doneList.value.length === 0) {
    loadMore();
  }
});

// 监听 projectId 变化，重新加载数据
watch(
  projectId,
  (newProjectId, oldProjectId) => {
    // 当 projectId 变化且新值存在时，重新加载数据
    if (newProjectId && newProjectId !== oldProjectId) {
      // 重置列表和分页
      pendingList.value = [];
      doneList.value = [];
      pendingPage.value = 0;
      donePage.value = 0;
      pendingHasMore.value = true;
      doneHasMore.value = true;
      pendingLoadStatus.value = 'more';
      doneLoadStatus.value = 'more';
      // 重新获取数据
      getDeviceCountFn();
      loadMore();
    }
  },
  { immediate: false }
);

// 查看详情
const seeDetail = (item) => {
  uni.navigateTo({ url: '/pages/message/diagnosis?device=' + encodeURIComponent(JSON.stringify(item)) });
};
</script>

<style lang="scss" scoped>
$color-title: #222;
$color-label: #7e7e7e;
$color-border: #bdbdbd;
$color-card-bg: #fff;
$color-warning: #ff7108;
$color-good: #34c759;
$color-primary: #4e4036;

.page {
  background: linear-gradient(90deg, #efefef 0%, #f7f7f7 50%, #fff 100%);
  min-height: 100vh;
  overflow: hidden;
}

.summary-card {
  margin: 70rpx 30rpx 0;
  background: linear-gradient(-90deg, #efefef 0%, #fff 100%);
  border-radius: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  padding: 30rpx 0 30rpx;
}
.work-status {
  font-size: 32rpx;
  color: $color-title;
  padding: 0 30rpx;
  margin-top: 30rpx;
}
.circle-wrap {
  display: flex;
  justify-content: center;
  padding: 36rpx 0 30rpx;
  position: relative;
}
.bg-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 410rpx;
  height: 410rpx;
  border-radius: 50%;
  /* 更平滑的亮度过渡，增加中间过渡点 */
  background: linear-gradient(160deg, #ffffff 0%, #fcfcfc 35%, #f7f7f7 70%, #f2f2f2 100%);
  /* 仅右下方向的外投影 */
  box-shadow: 26rpx 30rpx 84rpx rgba(0, 0, 0, 0.12);
}

.bg-circle-wrap {
  background: #fff;
  border-radius: 50%;
  padding: 10px;
  z-index: 900;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.circle-text {
  position: absolute;
  text-align: center;
  top: 34%;
  z-index: 9000;
}

.circle-text-value {
  font-size: 70rpx;
  color: $color-title;
  font-weight: bold;
  line-height: 1;
  padding-bottom: 20rpx;
}

.circle-text-value-unit {
  color: $color-title;
  font-size: 28rpx;
}

.circle-text-status {
  font-size: 32rpx;
}

.legend {
  display: flex;
  justify-content: space-around;
  padding: 8rpx 24rpx 20rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5rpx;
  color: $color-label;
  font-size: 24rpx;
}
.legend-circle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #d7f2dd;
  margin-right: 8rpx;
}
.legend-item .data-icon {
  font-size: 28rpx;
}
.legend-item.normal .data-icon {
  color: #34c759;
}
.legend-item.warn .legend-circle {
  background: #ffe0c9;
}
.legend-item.warn .data-icon {
  color: #ff7108;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 80rpx;
  padding: 10rpx 0 30rpx;
}

.tab {
  min-width: 160rpx;
  text-align: center;
  height: 56rpx;
  line-height: 56rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  border: 1px solid $color-border;
  font-size: 26rpx;
  color: #666;
  background: #dcdcdc;
}

.tab.active {
  background: $color-primary;
  color: #fff;
  border-color: $color-primary;
  box-shadow: 0 4rpx 10rpx rgba(78, 64, 54, 0.18);
}

.list {
  margin: 30rpx;
  display: flex;
  flex-direction: column;
}
.card {
  padding: 60rpx 0;
  border-top: 1px solid $color-border;
}
.card-header {
  padding: 0 24rpx;
}

.title-row {
  color: $color-label;
  font-size: 24rpx;
}
.status-text {
  color: $color-title;
  font-size: 28rpx;
  margin-bottom: 8rpx;
}
.model-text {
  margin-bottom: 8rpx;
}
.device-wrap {
  width: 500rpx;
  margin: 50rpx auto 20rpx;
}

.device-img {
  width: 100%;
  display: block;
}

.desc {
  text-align: center;
  padding: 14rpx 0 10rpx;
  margin-bottom: 61rpx;
}

.place {
  font-size: 28rpx;
  color: $color-title;
}

.sn {
  margin-top: 4rpx;
  font-size: 24rpx;
  color: $color-label;
}

.bottom-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx 24rpx;
  margin: 0 60rpx;
  border-radius: 40rpx;
  background: linear-gradient(90deg, #fff 0%, #e0e0e0 100%);
}

.battery {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: $color-title;
  font-size: 24rpx;
}

.battery .battery-icon {
  color: #ff7108;
  font-size: 28rpx;
  margin-right: 8rpx;
}

.btn-view {
  font-size: 24rpx;
  height: 56rpx;
  line-height: 56rpx;
  padding: 0 26rpx;
  border: 1px solid $color-primary;
  border-radius: 999rpx;
  background: #fff;
  color: $color-primary;
  box-shadow: 0 2rpx 8rpx rgba(78, 64, 54, 0.08);
}
</style>
