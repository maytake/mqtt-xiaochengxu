<template>
  <view class="page">
    <!-- 顶部欢迎与位置选择 -->
    <view class="header">
      <view class="header-top">
        <view class="welcome">Hi，欢迎进入</view>
        <view class="font_family plus-btn" @click="showMenu = !showMenu">&#xe611;</view>
        <view v-if="showMenu" class="mask" @click="onCloseMenu"></view>
        <view v-if="showMenu" class="menu-popup" @click.stop>
          <view class="menu-arrow"></view>
          <view class="menu-item" @click="handleScan">
            <text class="font_family menu-icon">&#xe606;</text>
            扫一扫
          </view>
          <view class="menu-item">
            <text class="font_family menu-icon">&#xe611;</text>
            添加设备
          </view>
        </view>
      </view>
      <view class="location-box">
        <view class="location-row bottom-line">
          <text class="font_family m-icon">&#xe60c;</text>
          <view class="location-text" @click="open">{{ region || '请选择省市区' }}</view>
          <cityPicker
            :column="column"
            :default-value="defaultValue"
            :mask-close-able="maskCloseAble"
            @confirm="confirm"
            @cancel="handleCancel"
            :visible="visible" />
        </view>
        <view class="location-row">
          <text class="font_family m-icon">&#xe607;</text>
          <view class="location-text" @click="pickerClick">{{ projectPlace }}</view>
          <up-picker
            :show="show"
            ref="uPickerRef"
            :columns="columns"
            @confirm="pickConfirm"
            @change="changeHandler"
            class="m-picker"></up-picker>
        </view>
      </view>
    </view>

    <!-- 常用设备 -->
    <view class="section-title">常用设备</view>
    <view class="section-waterfall">
      <view class="device-waterfall">
        <view v-for="(item, idx) in leftList" :key="item.id" class="device-card">
          <view class="device-hd" @click="handleDeviceClick(item)">
            <image class="device-img" :src="item.img" mode="aspectFill" />
            <view class="device-info">
              <view class="device-name">{{ item.name }}</view>
              <view :class="['device-status', item.status === '故障中' ? 'error' : 'online']">
                {{ item.status }}
              </view>
            </view>
          </view>
          <view class="device-actions" v-if="item.actions && item.actions.length">
            <button
              v-for="(btn, bidx) in item.actions"
              :key="bidx"
              :class="['action-btn', btn.active ? 'active' : '']"
              @click="toggleButtonActive(item.id, bidx)">
              {{ btn.label }}
            </button>
          </view>
        </view>
      </view>
      <view class="device-waterfall">
        <view v-for="(item, idx) in rightList" :key="item.id" class="device-card">
          <view class="device-hd" @click="handleDeviceClick(item)">
            <image class="device-img" :src="item.img" mode="aspectFill" />
            <view class="device-info">
              <view class="device-name">{{ item.name }}</view>
              <view :class="['device-status', item.status === '故障中' ? 'error' : 'online']">
                {{ item.status }}
              </view>
            </view>
          </view>
          <view class="device-actions" v-if="item.actions && item.actions.length">
            <button
              v-for="(btn, bidx) in item.actions"
              :key="bidx"
              :class="['action-btn', btn.active ? 'active' : '']"
              @click="toggleButtonActive(item.id, bidx)">
              {{ btn.label }}
            </button>
          </view>
        </view>
      </view>
    </view>
    <uni-load-more iconType="circle" :status="loadStatus" @loadmore="addRandomData"></uni-load-more>
  </view>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, computed } from 'vue';
import { onReachBottom, onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import cityPicker from '@/components/piaoyi-cityPicker/piaoyi-cityPicker';
import cloneDeep from 'lodash/cloneDeep';

const { proxy } = getCurrentInstance();
const showMenu = ref(false);

const column = ref(3);
const region = ref('请选择省市区');
const defaultValue = ref(['', '', '']);
const maskCloseAble = ref(true);
const visible = ref(false);

const show = ref(false);
const projectPlace = ref('请选择项目地址');
const columns = reactive([
  ['SM城市广场', '万象城'],
  ['SM一期', 'SM二期', 'SM三期'],
]);
const columnData = reactive([
  ['SM一期', 'SM二期', 'SM三期'],
  ['万象城一期', '万象城二期'],
]);
const uPickerRef = ref(null);

const pickerClick = () => {
  show.value = true;
};

const changeHandler = (e) => {
  const { columnIndex, value, values, index } = e;

  if (columnIndex === 0) {
    uPickerRef.value.setColumnValues(1, columnData[index]);
  }
};

const pickConfirm = (e) => {
  projectPlace.value = e.value.join('-');
  show.value = false;
};

// 具体项目位置
function open() {
  visible.value = true;
}

function confirm(val) {
  region.value = val.provinceName + '-' + val.cityName + '-' + val.areaName;
  visible.value = false;
}

function handleCancel() {
  visible.value = false;
}

// 示例设备数据
const list = [
  {
    id: 1,
    name: '1号马桶',
    status: '在线',
    img: '/static/images/touxiang.jpg',
    actions: [
      { label: '翻盖', active: true },
      { label: '清洗', active: false },
      { label: '烘干', active: false },
      { label: '加热', active: false },
    ],
  },
  {
    id: 2,
    name: '2号小便池',
    status: '在线',
    img: '/static/images/touxiang.jpg',
    actions: [{ label: '清洗', active: false }],
  },
  {
    id: 3,
    name: '洗手池1号水龙头',
    status: '故障中',
    img: '/static/images/touxiang.jpg',
    actions: [
      { label: '清洗', active: false },
      { label: '烘干', active: false },
    ],
  },
  {
    id: 4,
    name: '2号小便池',
    status: '在线',
    img: '/static/images/touxiang.jpg',
    actions: [{ label: '清洗', active: false }],
  },
  {
    id: 5,
    name: '洗手池1号水龙头',
    status: '故障中',
    img: '/static/images/touxiang.jpg',
    actions: [],
  },
  {
    id: 6,
    name: '2号小便池',
    status: '在线',
    img: '/static/images/touxiang.jpg',
    actions: [{ label: '清洗', active: false }],
  },
];
const flowList = ref(list);

// 计算左右两列数据
const leftList = computed(() => flowList.value.filter((_, idx) => idx % 2 === 0));
const rightList = computed(() => flowList.value.filter((_, idx) => idx % 2 === 1));

onShow(() => {
  const url = proxy.$getCurrentRoute();
  const isLogin =  proxy.$checkLogin(url);
  if (isLogin) {
   // 加载数据
  }
});

onPullDownRefresh(() => {
  loadStatus.value = 'more';
  setTimeout(() => {
    flowList.value = cloneDeep(list);
    uni.stopPullDownRefresh();
  }, 1000);
});

onReachBottom(() => {
  addRandomData();
});

async function handleScan() {
  showMenu.value = false;
  // #ifdef APP-PLUS
  let status = await checkPermission();
  if (status !== 1) {
    return;
  }
  // #endif
  uni.scanCode({
    success: (res) => {
      uni.showToast({ title: '扫码成功' });
    },
    fail: (err) => {
      uni.showToast({ title: '扫码失败' });
    },
  });
}
// #ifdef APP-PLUS
async function checkPermission(code) {
  let status;
  onCloseMenu();
  if (permision.isIOS) {
    status = await permision.requestIOS('camera');
  } else {
    status = await permision.requestAndroid('android.permission.CAMERA');
  }

  if (status === null || status === 1) {
    status = 1;
  } else {
    uni.showModal({
      content: '需要相机权限',
      confirmText: '设置',
      success: function (res) {
        if (res.confirm) {
          permision.gotoAppSetting();
        }
      },
    });
  }
  return status;
}
// #endif

function onCloseMenu() {
  showMenu.value = false;
}

const loadStatus = ref('more');

// 生成随机设备数据
function generateRandomDevice(id) {
  const deviceTypes = [
    { name: '马桶', actions: ['翻盖', '清洗', '烘干', '加热'] },
    { name: '小便池', actions: ['清洗'] },
    { name: '洗手池水龙头', actions: [] },
    { name: '烘干机', actions: ['开启', '关闭'] },
    { name: '感应器', actions: ['开启', '关闭'] },
  ];

  const statuses = ['在线', '故障中', '离线'];
  const randomType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  // 生成随机操作按钮
  const actions = randomType.actions.map((action) => ({
    label: action,
    active: Math.random() > 0.7, // 30% 概率为激活状态
  }));

  return {
    id: id,
    name: `${Math.floor(Math.random() * 10) + 1}号${randomType.name}`,
    status: randomStatus,
    img: '/static/images/touxiang.jpg',
    actions: actions,
  };
}

// 在 setup 顶部定义
let nextDeviceId = flowList.value.length + 1;

function addRandomData() {
  loadStatus.value = 'loading';
  setTimeout(() => {
    const newCount = Math.floor(Math.random() * 3) + 3;
    const newDevices = [];
    for (let i = 0; i < newCount; i++) {
      newDevices.push(generateRandomDevice(nextDeviceId++));
    }
    flowList.value.push(...newDevices);
    if (flowList.value.length >= 20) {
      loadStatus.value = 'noMore';
    } else {
      loadStatus.value = 'loading';
    }
  }, 1000);
}

// 切换按钮激活状态
function toggleButtonActive(deviceId, buttonIndex) {
  uni.showToast({
    icon: 'loading',
    title: '正在操作中',
    duration: 200,
  });

  // 用 id 查找 flowList 中的设备
  const device = flowList.value.find((d) => d.id === deviceId);
  if (device && device.actions && device.actions[buttonIndex]) {
    // 切换按钮的 active 状态
    device.actions[buttonIndex].active = !device.actions[buttonIndex].active;
    // 关键：强制刷新 flowList 的引用，触发 up-waterfall 重新渲染
    flowList.value = cloneDeep(flowList.value);
  }
}

function handleDeviceClick(device) {
  uni.navigateTo({
    url: `/pages/intelligent/detail?device=${encodeURIComponent(JSON.stringify(device))}`,
  });
}
</script>

<style lang="scss" scoped>
.page {
  background: #f6f8fc;
  min-height: 100vh;
}

.header {
  padding: 52rpx 24rpx 0 24rpx;
  position: relative;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60rpx;
  margin-bottom: 46rpx;
}

.welcome {
  font-size: 36rpx;
  font-weight: bold;
}

.location-box {
  position: relative;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.location-row {
  display: flex;
  align-items: center;
  font-size: 30rpx;
  padding: 0 30rpx;
  color: #000;
}

.bottom-line {
  border-bottom: 1px solid #eeeeee;
}

.m-icon {
  font-size: 30rpx;
  color: #7e7e7e;
  margin-right: 24rpx;
}

.m-picker {
  color: #1777ff;
}

.location-text {
  font-size: 30rpx;
  color: #000;
  padding: 30rpx 0;
  display: block;
  width: 100%;
}

.plus-btn {
  width: 60rpx;
  height: 60rpx;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  z-index: 2;
}

.menu-popup {
  position: absolute;
  top: 122rpx;
  right: 36rpx;
  background: #333;
  color: #fff;
  border-radius: 16rpx;
  padding: 16rpx 0;
  min-width: 200rpx;
  z-index: 10;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.12);
}

.menu-arrow {
  position: absolute;
  top: -16rpx;
  right: 24rpx;
  width: 0;
  height: 0;
  border-left: 16rpx solid transparent;
  border-right: 16rpx solid transparent;
  border-bottom: 16rpx solid #333;
}

.menu-item {
  padding: 16rpx 32rpx;
  display: flex;
  align-items: center;
  font-size: 28rpx;
  border-bottom: 1rpx solid #444;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  margin-right: 12rpx;
  font-size: 32rpx;
  color: #a6a6a6;
  margin-right: 26rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  margin: 50rpx 24rpx 40rpx 24rpx;
}

.section-waterfall {
  display: flex;
  padding: 0 12rpx;
}

.device-waterfall {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.device-card {
  background: #fff;
  border-radius: 20rpx;
  margin: 0 12rpx 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
}

.device-hd {
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  padding: 30rpx 30rpx 30rpx;
  width: 100%;
}

.device-img {
  width: 100rpx;
  height: 100rpx;
  background: #eee;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
  object-fit: cover;
}

.device-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.device-name {
  font-size: 28rpx;
  font-weight: bold;
  word-wrap: break-word;
  word-break: break-all;
}

.device-status {
  font-size: 24rpx;
}

.device-status.online {
  color: #2979ff;
}

.device-status.error {
  color: #fa3534;
}

.device-actions {
  border-top: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
  gap: 30rpx;
  padding: 30rpx;
  justify-content: space-between;
}

.action-btn {
  display: block;
  background: #f6f8fc;
  border: none;
  width: 108rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #7e7e7e;
  margin: 0;
  border: 1px solid #cccccc;
}

.action-btn.active {
  background: #f2f6ff;
  color: #1777ff;
  border: 1px solid #78b0ff;
}

.action-btn:after {
  border: none;
  background: none;
}

.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0);
  z-index: 9;
}
</style>
