<template>
  <view class="page-bg">
    <!-- 头部信息 -->
    <view class="header-card">
      <image class="toilet-img" src="/static/images/touxiang.jpg" />
      <view class="info">
        <view class="title">
          {{ device.name || '1号马桶' }}
          <text class="online-text">在线</text>
        </view>
        <view class="location">
          <text class="font_family m-icon">&#xe60c;</text>
          厦门万象城
        </view>
      </view>
    </view>

    <!-- 功能区 -->
    <view class="main-title">功能</view>
    <view class="function-card">
      <view class="function-btns">
        <button
          v-for="func in funcList"
          :key="func.name"
          class="func-btn"
          :class="{ active: func.active }"
          @click="handleFuncClick(func)">
          {{ func.name }}
        </button>
      </view>

      <!-- 温度控制区域 -->
      <view class="temp-row">
        <view class="temp-card">
          <button class="temp-btn minus-btn" @click="changeTemp('water', -1)">-</button>
          <view class="temp-info">
            <view class="temp-value">
              <text class="temp-num">{{ waterTemp }}</text>
              <text class="temp-unit">℃</text>
            </view>
            <view class="temp-label">水温</view>
          </view>
          <button class="temp-btn plus-btn" @click="changeTemp('water', 1)">+</button>
        </view>
        <view class="temp-card">
          <button class="temp-btn minus-btn" @click="changeTemp('wind', -1)">-</button>
          <view class="temp-info">
            <view class="temp-value">
              <text class="temp-num">{{ windTemp }}</text>
              <text class="temp-unit">℃</text>
            </view>
            <view class="temp-label">风温</view>
          </view>
          <button class="temp-btn plus-btn" @click="changeTemp('wind', 1)">+</button>
        </view>
      </view>

      <view class="group-wrap">
        <view class="slider-row">
          <text class="slider-label">烘干温度</text>
          <up-slider
            v-model="dryTemp"
            :min="0"
            :max="100"
            height="24rpx"
            class="main-slider flex-slider"
            inactiveColor="#ededed"
            blockSize="60rpx" />
          <text class="slider-value">{{ dryTemp }}℃</text>
        </view>

        <view class="slider-row">
          <text class="slider-label">喷头高度</text>
          <up-slider
            v-model="nozzleHeight"
            :min="0"
            :max="100"
            height="24rpx"
            class="main-slider flex-slider"
            inactiveColor="#ededed"
            blockSize="60rpx" />
          <text class="slider-value">{{ nozzleHeight }}%</text>
        </view>

        <view class="slider-row switch-row">
          <text class="slider-label">开关东西</text>
          <up-switch v-model="switchValue" class="main-switch" />
        </view>
      </view>
    </view>

    <!-- 设置区 -->
    <view class="main-title">设置</view>
    <view class="setting-card">
      <view class="setting-row" @click="openPicker('warmWater')">
        <text class="setting-label">温水温度</text>
        <view class="setting-value">{{ warmWaterLevel }}</view>
        <text class="font_family m-arrow">&#xe60d;</text>
      </view>

      <view class="setting-row" @click="openPicker('cleaningFlow')">
        <text class="setting-label">清洗流量</text>
        <view class="setting-value">{{ cleaningFlow }}</view>
        <text class="font_family m-arrow">&#xe60d;</text>
      </view>

      <view class="setting-row" @click="openPicker('bluetooth')">
        <text class="setting-label">蓝牙设置</text>
        <view class="setting-value">{{ bluetoothStatus }}</view>
        <text class="font_family m-arrow">&#xe60d;</text>
      </view>
    </view>
    <up-picker
      :show="showPicker"
      :columns="pickerColumns"
      :title="pickerTitle"
      @confirm="onPickerConfirm"
      @cancel="showPicker = false"></up-picker>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
const waterTemp = ref(20);
const windTemp = ref(20);
const dryTemp = ref(50);
const nozzleHeight = ref(50);
const switchValue = ref(true);

// 使用对象存储每个按钮的激活状态
const funcList = reactive([
  { name: '翻盖', active: true },
  { name: '清洗', active: false },
  { name: '烘干', active: false },
  { name: '加热', active: false },
]);

const device = ref({});
onLoad((options) => {
  if (options && options.device) {
    device.value = JSON.parse(decodeURIComponent(options.device));
  }
});
function handleFuncClick(func) {
  func.active = !func.active;
  uni.showToast({
    icon: 'loading',
    title: '正在操作中',
    duration: 200,
  });
}

function changeTemp(type, delta) {
  if (type === 'water') {
    waterTemp.value = Math.min(50, Math.max(20, waterTemp.value + delta));
  } else if (type === 'wind') {
    windTemp.value = Math.min(50, Math.max(20, windTemp.value + delta));
  }
}

// Settings state
const warmWaterLevel = ref('五档');
const cleaningFlow = ref('五档');
const bluetoothStatus = ref('关闭');

// Picker state
const showPicker = ref(false);
const pickerColumns = ref([]);
const pickerTitle = ref('');
const currentSetting = ref(''); // To track which setting is being edited

const settingOptions = {
  warmWater: [['一档', '二档', '三档', '四档', '五档']],
  cleaningFlow: [['一档', '二档', '三档', '四档', '五档']],
  bluetooth: [['开启', '关闭']],
};

function openPicker(setting) {
  currentSetting.value = setting;
  pickerColumns.value = settingOptions[setting];
  if (setting === 'warmWater') {
    pickerTitle.value = '选择温水温度';
  } else if (setting === 'cleaningFlow') {
    pickerTitle.value = '选择清洗流量';
  } else if (setting === 'bluetooth') {
    pickerTitle.value = '选择蓝牙状态';
  }
  showPicker.value = true;
}

function onPickerConfirm(e) {
  const value = e.value.join('');
  if (currentSetting.value === 'warmWater') {
    warmWaterLevel.value = value;
  } else if (currentSetting.value === 'cleaningFlow') {
    cleaningFlow.value = value;
  } else if (currentSetting.value === 'bluetooth') {
    bluetoothStatus.value = value;
  }
  showPicker.value = false;
}
</script>

<style scoped>
.page-bg {
  min-height: 100vh;
  background: #f6f8fc;
  padding-bottom: 40rpx;
  overflow: hidden;
}
.header-card {
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  margin: 100rpx 24rpx 0 24rpx;
  padding: 50rpx 42rpx;
  display: flex;
  align-items: center;
}
.toilet-img {
  width: 162rpx;
  height: 162rpx;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.online-text {
  color: #217aff;
  font-size: 26rpx;
  margin-left: 12rpx;
}
.location {
  color: #999;
  font-size: 24rpx;
  margin-top: 10rpx;
}
.m-icon {
  font-size: 24rpx;
  color: #999;
  margin-right: 10rpx;
}
.main-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #222;
  margin: 60rpx 0 40rpx 24rpx;
}

.function-card {
  border-radius: 32rpx;
  margin: 0 24rpx;
}
.function-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 30rpx;
  margin-bottom: 50rpx;
}
.func-btn {
  width: calc((100% - 90rpx) / 4);
  margin-bottom: 0;
  flex: none;
  border-radius: 32rpx;
  background: #fff;
  color: #333;
  font-size: 30rpx;
  padding: 22rpx 0;
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  transition: background 0.2s;
  margin: 0;
}
.func-btn:after {
  border: none;
}
.func-btn.active {
  background: linear-gradient(90deg, #7f8fff 0%, #b8aaff 100%);
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(123, 104, 238, 0.18);
}
.func-btn:disabled {
  opacity: 1;
  color: #bbb;
  background: #fff;
}

/* 温度控制区域样式 - 更新为设计图样式 */
.temp-row {
  margin: 0 0 50rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 30rpx;
}
.temp-card {
  width: calc((100% - 30rpx) / 2);
  box-sizing: border-box;
  background: #fff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
}
.temp-btn {
  width: 80rpx;
  height: 80rpx;
  padding: 0;
  line-height: 80rpx;
  font-size: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  background: none;
  border: none;
}
.temp-btn:after {
  border: none;
}
.temp-btn.minus-btn {
  font-weight: normal;
}
.temp-btn.plus-btn {
  font-weight: normal;
}
.temp-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10rpx;
}
.temp-value {
  display: flex;
  align-items: flex-end;
}
.temp-num {
  font-size: 26rpx;
  font-weight: 500;
  color: #999;
  line-height: 1;
}
.temp-unit {
  font-size: 24rpx;
  color: #999;
  margin-left: 2rpx;
}
.temp-label {
  font-size: 30rpx;

  color: #333;
  margin-top: 8rpx;
}

.slider-group {
  margin-bottom: 32rpx;
}
.slider-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 18rpx 0 8rpx 0;
}

.slider-label {
  font-size: 30rpx;

  color: #333;
}
.slider-value {
  font-size: 28rpx;
  color: #888;
}
/*
要覆盖子组件 <up-slider> 的内部样式，需要使用 :deep() 深度选择器。
因为 <style scoped> 中的样式默认只作用于当前组件，无法影响子组件。
*/

.main-slider :deep(.u-slider__base) {
  border-radius: 12rpx;
}

.main-slider :deep(.u-slider__button) {
  box-shadow: 0 4rpx 12rpx rgba(33, 122, 255, 0.2);
}

.group-wrap {
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  margin: 24rpx 0;
  padding: 0 30rpx;
}
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 124rpx;
}

.setting-card {
  background: #fff;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
  margin: 0 24rpx 100rpx 24rpx;
  padding: 0 30rpx;
}
.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 124rpx;
  border-bottom: 1px solid #eaebed;
}
.setting-row:last-child {
  border-bottom: none;
}
.setting-label {
  font-size: 30rpx;

  color: #333;
  margin-right: auto;
}
.setting-value {
  font-size: 28rpx;
  color: #bbb;
  margin-right: 10rpx;
}
.m-arrow {
  font-size: 26rpx;
  color: #bbb;
}

.divider {
  height: 1px;
  background: #f0f0f0;
}
.slider-row {
  display: flex;
  line-height: 124rpx;
  border-bottom: 1px solid #eaebed;
}
.slider-row :deep(.u-slider__gap) {
  border-radius: 999px 0 0 999px;
}
.slider-row:last-child {
  border-bottom: none;
}
.flex-slider {
  flex: 1;
  margin: 0 12rpx;
}
.slider-value {
  font-size: 28rpx;
  color: #888;
  flex-shrink: 0;
  width: 90rpx;
  text-align: right;
}
</style>
