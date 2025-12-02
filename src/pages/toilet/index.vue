<template>
  <view class="page">
    <view class="page-bg">
      <!-- 设置按钮 -->
      <view class="settings-btn">
        <text class="settings-text" @click="goToSetting">设置</text>
      </view>

      <!-- 设备信息卡片 -->
      <view class="card product-card">
        <view class="product-header">
          <view>
            <view class="productName">五号楼一层厕所01</view>
            <view class="productModel">
              型号：
              <text>U101</text>
            </view>
          </view>
        </view>
        <view class="product-hero">
          <image class="product-img" lazy-load src="https://smart.tck.com.cn/itemDevice-api/images_product/matong.png" mode="aspectFit"></image>
        </view>
        <view class="product-footer">
          <view class="status-item">
            <text class="font_family icon">&#xe61b;</text>
            <text>
              状态：
              <text class="status-online">在线</text>
            </text>
          </view>
        </view>
      </view>

      <!-- 基础控制宫格 -->
      <view class="card basic-controls">
        <view class="control-grid">
          <view
            v-for="(item, index) in basicControls"
            :key="index"
            class="control-item"
            :class="{ active: item.active }"
            @click="handleBasicControl(item, index)">
            <text class="font_family control-icon" :class="item.icon"></text>
            <text class="control-text">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- 水温控制模块 -->
      <view v-if="showWaterTempModule" class="card water-temp-card">
        <view class="temp-header">
          <text class="temp-title">水温</text>
        </view>
        <view class="temp-content">
          <view class="temp-display">
            <text class="temp-value">{{ waterTemp }}℃</text>
          </view>
          <view class="temp-controls">
            <view class="temp-btn" @click="decreaseTemp">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="temp-btn" @click="increaseTemp">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>
      <!-- 位置调节模块 -->
      <view v-if="showPositionModule" class="card position-card">
        <view class="position-header">
          <text class="position-title">位置调节</text>
        </view>
        <view class="position-content">
          <view class="position-display">
            <text class="position-value">{{ positionLevel }}档</text>
          </view>
          <view class="position-controls">
            <view class="position-btn" @click="decreasePosition">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="position-btn" @click="increasePosition">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 夜灯模块 -->
      <view v-if="showNightLightModule" class="card night-light-card">
        <view class="night-light-header">
          <text class="night-light-title">夜灯</text>
        </view>
        <view class="night-light-content">
          <view class="night-light">
            <text v-if="nightLightOn" class="font_family night-light-icon light-on">&#xe637;</text>
            <text v-else class="font_family night-light-icon icon-off">&#xe61e;</text>
          </view>
          <view class="night-light-divider"></view>
          <view class="night-light-switch" :class="{ active: nightLightOn }" @click="toggleNightLight">
            <view class="switch-thumb"></view>
          </view>
        </view>
      </view>

      <!-- 妇洗模块 -->
      <view v-if="showFeminineWashModule" class="card feminine-wash-card">
        <view class="feminine-wash-header">
          <text class="feminine-wash-title">妇洗</text>
        </view>
        <view class="feminine-wash-temps">
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe622;</text>
            <view class="temp-content">
              <text class="temp-value">{{ feminineWashWaterTemp }}℃</text>
              <text class="temp-label">水温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe625;</text>
            <view class="temp-content">
              <text class="temp-value">{{ feminineWashWindTemp }}℃</text>
              <text class="temp-label">风温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe61c;</text>
            <view class="temp-content">
              <text class="temp-value">{{ feminineWashSeatTemp }}℃</text>
              <text class="temp-label">座温</text>
            </view>
          </view>
        </view>
        <view class="feminine-wash-divider"></view>
        <view class="feminine-wash-modes">
          <view
            class="mode-btn"
            :class="{ active: feminineWashMode.includes('reciprocating') }"
            @click="setFeminineWashMode('reciprocating')">
            <text>往复清洗</text>
          </view>
          <view
            class="mode-btn"
            :class="{ active: feminineWashMode.includes('bubble') }"
            @click="setFeminineWashMode('bubble')">
            <text>气泡按摩</text>
          </view>
          <view
            class="mode-btn"
            :class="{ active: feminineWashMode.includes('pulse') }"
            @click="setFeminineWashMode('pulse')">
            <text>脉冲按摩</text>
          </view>
        </view>
      </view>

      <!-- 臀洗模块 -->
      <view v-if="showHipWashModule" class="card feminine-wash-card">
        <view class="feminine-wash-header">
          <text class="feminine-wash-title">臀洗</text>
        </view>
        <view class="feminine-wash-temps">
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe622;</text>
            <view class="temp-content">
              <text class="temp-value">{{ hipWashWaterTemp }}℃</text>
              <text class="temp-label">水温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe625;</text>
            <view class="temp-content">
              <text class="temp-value">{{ hipWashWindTemp }}℃</text>
              <text class="temp-label">风温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe61c;</text>
            <view class="temp-content">
              <text class="temp-value">{{ hipWashSeatTemp }}℃</text>
              <text class="temp-label">座温</text>
            </view>
          </view>
        </view>
        <view class="feminine-wash-divider"></view>
        <view class="feminine-wash-modes">
          <view
            class="mode-btn"
            :class="{ active: hipWashMode.includes('reciprocating') }"
            @click="setHipWashMode('reciprocating')">
            <text>往复清洗</text>
          </view>
          <view class="mode-btn" :class="{ active: hipWashMode.includes('bubble') }" @click="setHipWashMode('bubble')">
            <text>气泡按摩</text>
          </view>
          <view class="mode-btn" :class="{ active: hipWashMode.includes('pulse') }" @click="setHipWashMode('pulse')">
            <text>脉冲按摩</text>
          </view>
        </view>
      </view>

      <!-- 开关座圈模块 -->
      <view v-if="showSeatRingModule" class="card feminine-wash-card">
        <view class="feminine-wash-header">
          <text class="feminine-wash-title">开关座圈</text>
        </view>
        <view class="feminine-wash-temps">
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe622;</text>
            <view class="temp-content">
              <text class="temp-value">30℃</text>
              <text class="temp-label">水温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe625;</text>
            <view class="temp-content">
              <text class="temp-value">30℃</text>
              <text class="temp-label">风温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe61c;</text>
            <view class="temp-content">
              <text class="temp-value">30℃</text>
              <text class="temp-label">座温</text>
            </view>
          </view>
        </view>
        <view class="feminine-wash-divider"></view>
        <view class="feminine-wash-modes">
          <view
            class="mode-btn"
            :class="{ active: seatRingMode.includes('seatCover') }"
            @click="setSeatRingMode('seatCover')">
            <text>打开座盖</text>
          </view>
          <view class="mode-btn disabled">
            <text></text>
          </view>
          <view
            class="mode-btn"
            :class="{ active: seatRingMode.includes('seatRing') }"
            @click="setSeatRingMode('seatRing')">
            <text>打开座圈</text>
          </view>
        </view>
      </view>

      <!-- 风温模块 -->
      <view v-if="showWindTempModule" class="card wind-temp-card">
        <view class="temp-header">
          <text class="temp-title">风温</text>
        </view>
        <view class="temp-content">
          <view class="temp-display">
            <text class="temp-value">{{ windTemp }}℃</text>
          </view>
          <view class="temp-controls">
            <view class="temp-btn" @click="decreaseWindTemp">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="temp-btn" @click="increaseWindTemp">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 坐温模块 -->
      <view v-if="showSeatTempModule" class="card seat-temp-card">
        <view class="temp-header">
          <text class="temp-title">坐温</text>
        </view>
        <view class="temp-content">
          <view class="temp-display">
            <text class="temp-value">{{ seatTemp }}℃</text>
          </view>
          <view class="temp-controls">
            <view class="temp-btn" @click="decreaseSeatTemp">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="temp-btn" @click="increaseSeatTemp">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 水量调节模块 -->
      <view v-if="showWaterAmountModule" class="card water-amount-card">
        <view class="position-header">
          <text class="position-title">水量调节</text>
        </view>
        <view class="position-content">
          <view class="position-display">
            <text class="position-value">{{ waterAmountLevel }}档</text>
          </view>
          <view class="position-controls">
            <view class="position-btn" @click="decreaseWaterAmount">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="position-btn" @click="increaseWaterAmount">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 高级控制宫格 -->
      <view class="card advanced-controls">
        <view class="control-grid">
          <view
            v-for="(item, index) in advancedControls"
            :key="index"
            class="control-item"
            :class="{ active: item.active }"
            @click="handleAdvancedControl(item, index)">
            <text class="font_family control-icon" :class="item.icon"></text>
            <text class="control-text">{{ item.name }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue';

// 基础控制数据
const basicControls = ref([
  { name: '停止', active: false, icon: 'icon-a-ziyuan31' },
  { name: '烘干', active: false, icon: 'icon-a-ziyuan25' },
  { name: '冲洗', active: false, icon: 'icon-a-ziyuan35' },
  { name: '小冲', active: false, icon: 'icon-a-ziyuan34' },
  { name: '喷杆自动清洁', active: false, icon: 'icon-a-ziyuan45' },
  { name: '喷杆手动清洁', active: false, icon: 'icon-a-ziyuan42' },
]);

// 高级控制数据
const advancedControls = ref([
  { name: '开关座圈', active: false, icon: 'icon-a-ziyuan33' },
  { name: '臀洗', active: false, icon: 'icon-a-ziyuan32' },
  { name: '妇洗', active: false, icon: 'icon-a-ziyuan26' },
  { name: '夜灯', active: false, icon: 'icon-a-ziyuan36' },
  { name: '水温', active: false, icon: 'icon-a-ziyuan39' },
  { name: '风温', active: false, icon: 'icon-a-ziyuan38' },
  { name: '座温', active: false, icon: 'icon-a-ziyuan37' },
  { name: '位置调节', active: false, icon: 'icon-a-ziyuan41' },
  { name: '水量调节', active: false, icon: 'icon-a-ziyuan40' },
]);

// 模块显示状态
const showWaterTempModule = ref(false);
const showPositionModule = ref(false);
const showNightLightModule = ref(false);
const showFeminineWashModule = ref(false);
const showHipWashModule = ref(false);
const showSeatRingModule = ref(false);
const showWindTempModule = ref(false);
const showSeatTempModule = ref(false);
const showWaterAmountModule = ref(false);

// 水温设置
const waterTemp = ref(20);

// 位置调节
const positionLevel = ref(1);

// 夜灯状态
const nightLightOn = ref(false);

// 妇洗设置
const feminineWashWaterTemp = ref(30);
const feminineWashWindTemp = ref(30);
const feminineWashSeatTemp = ref(30);
const feminineWashMode = ref(['bubble']); // 改为数组，支持多选

// 臀洗设置
const hipWashWaterTemp = ref(30);
const hipWashWindTemp = ref(30);
const hipWashSeatTemp = ref(30);
const hipWashMode = ref(['bubble']);

// 开关座圈设置
const seatRingMode = ref(['seatCover']);

// 风温设置
const windTemp = ref(20);

// 坐温设置
const seatTemp = ref(20);

// 水量调节
const waterAmountLevel = ref(1);

// 处理基础控制点击
const handleBasicControl = (item, index) => {
  // 显示选中状态500毫秒
  item.active = true;
  setTimeout(() => {
    item.active = false;
  }, 500);
  uni.showToast({
    title: '操作成功',
    icon: 'none',
    duration: 600,
    position: 'top',
  });
};

// 隐藏其他模块
const hideOtherModules = () => {
  showWaterTempModule.value = false;
  showPositionModule.value = false;
  showNightLightModule.value = false;
  showFeminineWashModule.value = false;
  showHipWashModule.value = false;
  showSeatRingModule.value = false;
  showWindTempModule.value = false;
  showSeatTempModule.value = false;
  showWaterAmountModule.value = false;
};

// 处理高级控制点击
const handleAdvancedControl = (item, index) => {
  // 重置其他按钮的选中状态
  advancedControls.value.forEach((control, i) => {
    if (i !== index) {
      control.active = false;
    }
  });

  // 切换当前按钮状态
  item.active = !item.active;

  // 先隐藏所有模块
  hideOtherModules();

  // 根据功能显示对应模块
  if (item.name === '水温' && item.active) {
    showWaterTempModule.value = true;
  } else if (item.name === '位置调节' && item.active) {
    showPositionModule.value = true;
  } else if (item.name === '夜灯' && item.active) {
    showNightLightModule.value = true;
  } else if (item.name === '妇洗' && item.active) {
    showFeminineWashModule.value = true;
  } else if (item.name === '臀洗' && item.active) {
    showHipWashModule.value = true;
  } else if (item.name === '开关座圈' && item.active) {
    showSeatRingModule.value = true;
  } else if (item.name === '风温' && item.active) {
    showWindTempModule.value = true;
  } else if (item.name === '座温' && item.active) {
    showSeatTempModule.value = true;
  } else if (item.name === '水量调节' && item.active) {
    showWaterAmountModule.value = true;
  }
};

// 水温调节
const increaseTemp = () => {
  if (waterTemp.value < 50) {
    waterTemp.value++;
  }
};

const decreaseTemp = () => {
  if (waterTemp.value > 0) {
    waterTemp.value--;
  }
};

// 位置调节
const increasePosition = () => {
  if (positionLevel.value < 5) {
    positionLevel.value++;
  }
};

const decreasePosition = () => {
  if (positionLevel.value > 1) {
    positionLevel.value--;
  }
};

// 夜灯控制
const toggleNightLight = () => {
  nightLightOn.value = !nightLightOn.value;
  uni.showToast({
    title: '操作成功',
    icon: 'none',
    duration: 500,
    position: 'top',
  });
};

// 妇洗模式设置
const setFeminineWashMode = (mode) => {
  const currentModes = feminineWashMode.value;
  let newModes = [...currentModes];

  if (mode === 'reciprocating') {
    // 往复清洗：可以与其他模式同时选择，点击切换
    if (currentModes.includes('reciprocating')) {
      newModes = currentModes.filter((m) => m !== 'reciprocating');
    } else {
      newModes = [...currentModes, 'reciprocating'];
    }
  } else {
    // 气泡按摩和脉冲按摩：互斥选择
    const massageModes = ['bubble', 'pulse'];

    if (currentModes.includes(mode)) {
      // 当前模式已选择，取消选择
      newModes = currentModes.filter((m) => m !== mode);
    } else {
      // 选择当前模式，取消其他按摩模式，保留往复清洗
      newModes = currentModes.filter((m) => !massageModes.includes(m));
      newModes.push(mode);
    }
  }

  feminineWashMode.value = newModes;

  uni.showToast({
    title: '操作成功',
    icon: 'none',
    duration: 500,
    position: 'top',
  });
};

// 臀洗模式设置
const setHipWashMode = (mode) => {
  const currentModes = hipWashMode.value;
  let newModes = [...currentModes];

  if (mode === 'reciprocating') {
    if (currentModes.includes('reciprocating')) {
      newModes = currentModes.filter((m) => m !== 'reciprocating');
    } else {
      newModes = [...currentModes, 'reciprocating'];
    }
  } else {
    const massageModes = ['bubble', 'pulse'];
    if (currentModes.includes(mode)) {
      newModes = currentModes.filter((m) => m !== mode);
    } else {
      newModes = currentModes.filter((m) => !massageModes.includes(m));
      newModes.push(mode);
    }
  }

  hipWashMode.value = newModes;

  uni.showToast({
    title: '操作成功',
    icon: 'none',
    duration: 500,
    position: 'top',
  });
};

// 开关座圈模式设置
const setSeatRingMode = (mode) => {
  const currentModes = seatRingMode.value;
  let newModes = [...currentModes];

  if (currentModes.includes(mode)) {
    newModes = currentModes.filter((m) => m !== mode);
  } else {
    newModes = [...currentModes, mode];
  }

  seatRingMode.value = newModes;

  uni.showToast({
    title: '操作成功',
    icon: 'none',
    duration: 500,
    position: 'top',
  });
};

// 风温调节
const increaseWindTemp = () => {
  if (windTemp.value < 50) {
    windTemp.value++;
  }
};

const decreaseWindTemp = () => {
  if (windTemp.value > 0) {
    windTemp.value--;
  }
};

// 坐温调节
const increaseSeatTemp = () => {
  if (seatTemp.value < 50) {
    seatTemp.value++;
  }
};

const decreaseSeatTemp = () => {
  if (seatTemp.value > 0) {
    seatTemp.value--;
  }
};

// 水量调节
const increaseWaterAmount = () => {
  if (waterAmountLevel.value < 5) {
    waterAmountLevel.value++;
  }
};

const decreaseWaterAmount = () => {
  if (waterAmountLevel.value > 1) {
    waterAmountLevel.value--;
  }
};

const goToSetting = () => {
  uni.navigateTo({
    url: '/pages/toilet/toiletSetting',
  });
};
</script>

<style lang="scss" scoped>
.page {
  background: linear-gradient(90deg, #efefef 0%, #f7f7f7 50%, #fff 100%);
  min-height: 100vh;
  overflow: hidden;
}
.page-bg {
  min-height: 100vh;
  padding: 30rpx;
}

.settings-btn {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20rpx;
}

.settings-text {
  background: linear-gradient(-90deg, #efefef 0%, #fff 100%);
  border-radius: 30rpx;
  padding: 8rpx 24rpx;
  font-size: 28rpx;
  color: #333;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e0e0e0;
}
.card {
  background: linear-gradient(-90deg, #efefef 0%, #fff 100%);
  border-radius: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 32rpx;
}

.product-card {
  padding: 30rpx 40rpx;
}

.product-header {
  display: flex;
  justify-content: space-between;
}

.productName {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f1f1f;
}

.productModel {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #9aa0a6;
}

.product-hero {
  min-height: 360rpx;
  margin-top: 32rpx;
  display: flex;
  justify-content: center;
}

.product-img {
  height: 360rpx;
}

.product-footer {
  margin-top: 32rpx;
  display: flex;
  gap: 30rpx;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #6b7280;
}

.status-online {
  color: #00a20f;
}

.status-amount {
  color: #6a4f40;
}

.icon {
  font-size: 28rpx;
}

/* 通用控制模块样式 */
.water-temp-card,
.position-card {
  padding: 60rpx 40rpx;

  .temp-header,
  .position-header {
    text-align: center;
    margin-bottom: 10rpx;
  }

  .temp-title,
  .position-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .temp-content,
  .position-content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .temp-display,
  .position-display {
    text-align: center;
  }

  .temp-value,
  .position-value {
    font-size: 60rpx;
    font-weight: bold;
    color: #5a4a3f;
  }

  .temp-controls,
  .position-controls {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    gap: 200rpx;
  }

  .temp-btn,
  .position-btn {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    background: #fff;
    border: 2rpx solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 20rpx;
    transition: all 0.3s ease;
    pointer-events: auto;
  }

  .temp-btn:active,
  .position-btn:active {
    background: linear-gradient(135deg, #1777ff 0%, #0d5bb8 100%);
    color: #fff;
    border-color: #1777ff;
    box-shadow: 0 4rpx 8rpx rgba(23, 119, 255, 0.3);
    transform: scale(0.95);
  }

  .icon-arrow {
    font-size: 24rpx;
  }
}

/* 夜灯模块 */
.night-light-card {
  padding: 40rpx 0;

  .night-light-header {
    text-align: center;
  }

  .night-light-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .night-light-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .night-light-divider {
    width: 100%;
    height: 1rpx;
    background-color: #e0e0e0;
    margin: 30rpx 0;
  }
  .night-light {
    margin-top: 20rpx;
    height: 60rpx;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .night-light-icon {
    font-size: 43rpx;
    color: #5a4a3f;
  }
  .light-on {
    font-size: 60rpx;
  }

  .night-light-switch {
    width: 100rpx;
    height: 50rpx;
    background-color: #e0e0e0;
    border-radius: 25rpx;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .night-light-switch.active {
    background-color: #5a4a3f;
  }

  .switch-thumb {
    width: 46rpx;
    height: 46rpx;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    top: 2rpx;
    left: 2rpx;
    transition: all 0.3s ease;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  }

  .night-light-switch.active .switch-thumb {
    left: 52rpx;
  }
}

/* 妇洗模块 */
.feminine-wash-card {
  padding: 40rpx 0;

  .feminine-wash-header {
    text-align: center;
    margin-bottom: 30rpx;
  }

  .feminine-wash-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .feminine-wash-temps {
    display: flex;
    justify-content: space-around;
  }

  .feminine-wash-divider {
    width: 100%;
    height: 1rpx;
    background-color: #e0e0e0;
    margin: 40rpx 0;
  }

  .temp-setting {
    display: flex;
    align-items: flex-start;
    gap: 15rpx;
  }

  .temp-icon {
    font-size: 40rpx;
    color: #5a4a3f;
    margin-top: 5rpx;
  }

  .temp-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5rpx;
  }

  .temp-value {
    font-size: 36rpx;
    font-weight: bold;
    color: #5a4a3f;
  }

  .temp-label {
    font-size: 24rpx;
    color: #666;
  }

  .feminine-wash-modes {
    display: flex;
    gap: 20rpx;
    padding: 0 40rpx;
  }

  .mode-btn {
    flex: 1;
    padding: 15rpx 0;
    border-radius: 60rpx;
    text-align: center;
    font-size: 28rpx;
    transition: all 0.3s ease;
    background-color: #f0f0f0;
    color: #333;
    border: 1rpx solid #e0e0e0;
  }

  .mode-btn.active {
    background-color: #5a4a3f;
    color: #fff;
    border-color: #5a4a3f;
  }

  .mode-btn.disabled {
    visibility: hidden;
    pointer-events: none;
  }
}

/* 风温模块 */
.wind-temp-card {
  padding: 60rpx 40rpx;

  .temp-header {
    text-align: center;
    margin-bottom: 10rpx;
  }

  .temp-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .temp-content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .temp-display {
    text-align: center;
  }

  .temp-value {
    font-size: 60rpx;
    font-weight: bold;
    color: #5a4a3f;
  }

  .temp-controls {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    gap: 200rpx;
  }

  .temp-btn {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    background: #fff;
    border: 2rpx solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 20rpx;
    transition: all 0.3s ease;
    pointer-events: auto;
  }

  .temp-btn:active {
    background: linear-gradient(135deg, #1777ff 0%, #0d5bb8 100%);
    color: #fff;
    border-color: #1777ff;
    box-shadow: 0 4rpx 8rpx rgba(23, 119, 255, 0.3);
    transform: scale(0.95);
  }

  .icon-arrow {
    font-size: 24rpx;
  }
}

/* 坐温模块 */
.seat-temp-card {
  padding: 60rpx 40rpx;

  .temp-header {
    text-align: center;
    margin-bottom: 10rpx;
  }

  .temp-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .temp-content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .temp-display {
    text-align: center;
  }

  .temp-value {
    font-size: 60rpx;
    font-weight: bold;
    color: #5a4a3f;
  }

  .temp-controls {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    gap: 200rpx;
  }

  .temp-btn {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    background: #fff;
    border: 2rpx solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 20rpx;
    transition: all 0.3s ease;
    pointer-events: auto;
  }

  .temp-btn:active {
    background: linear-gradient(135deg, #1777ff 0%, #0d5bb8 100%);
    color: #fff;
    border-color: #1777ff;
    box-shadow: 0 4rpx 8rpx rgba(23, 119, 255, 0.3);
    transform: scale(0.95);
  }

  .icon-arrow {
    font-size: 24rpx;
  }
}

/* 水量调节模块 */
.water-amount-card {
  padding: 60rpx 40rpx;

  .position-header {
    text-align: center;
    margin-bottom: 10rpx;
  }

  .position-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .position-content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .position-display {
    text-align: center;
  }

  .position-value {
    font-size: 60rpx;
    font-weight: bold;
    color: #5a4a3f;
  }

  .position-controls {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    gap: 200rpx;
  }

  .position-btn {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    background: #fff;
    border: 2rpx solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 20rpx;
    transition: all 0.3s ease;
    pointer-events: auto;
  }

  .position-btn:active {
    background: linear-gradient(135deg, #1777ff 0%, #0d5bb8 100%);
    color: #fff;
    border-color: #1777ff;
    box-shadow: 0 4rpx 8rpx rgba(23, 119, 255, 0.3);
    transform: scale(0.95);
  }

  .icon-arrow {
    font-size: 24rpx;
  }
}

.control-grid {
  display: grid;
  gap: 0;
  border-radius: 28rpx;
  overflow: hidden;
}

.basic-controls .control-grid {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.advanced-controls {
  margin-bottom: 200rpx;
}

.advanced-controls .control-grid {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.control-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 20rpx;
  transition: all 0.3s ease;
  position: relative;
}

/* 基础控制宫格 - 3x2布局 */
.basic-controls .control-item:nth-child(1) {
  border-top-left-radius: 28rpx;
}

.basic-controls .control-item:nth-child(3) {
  border-top-right-radius: 28rpx;
}

.basic-controls .control-item:nth-child(4) {
  border-bottom-left-radius: 28rpx;
}

.basic-controls .control-item:nth-child(6) {
  border-bottom-right-radius: 28rpx;
}

.basic-controls .control-item:not(:nth-child(3n)) {
  border-right: 1rpx solid #e0e0e0;
}

.basic-controls .control-item:nth-child(-n + 3) {
  border-bottom: 1rpx solid #e0e0e0;
}

/* 高级控制宫格 - 3x3布局 */
.advanced-controls .control-item:nth-child(1) {
  border-top-left-radius: 28rpx;
}

.advanced-controls .control-item:nth-child(3) {
  border-top-right-radius: 28rpx;
}

.advanced-controls .control-item:nth-child(7) {
  border-bottom-left-radius: 28rpx;
}

.advanced-controls .control-item:nth-child(9) {
  border-bottom-right-radius: 28rpx;
}

.advanced-controls .control-item:not(:nth-child(3n)) {
  border-right: 1rpx solid #e0e0e0;
}

.advanced-controls .control-item:nth-child(-n + 3) {
  border-bottom: 1rpx solid #e0e0e0;
}

.advanced-controls .control-item:nth-child(n + 4):nth-child(-n + 6) {
  border-bottom: 1rpx solid #e0e0e0;
}

.control-item.active {
  background: linear-gradient(180deg, #efefef 0%, #ffffff 100%);
  border-color: #5a4a3f;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.control-icon {
  font-size: 40rpx;
  color: #5a4a3f;
  margin-bottom: 15rpx;
  transition: all 0.3s ease;
}

.control-text {
  font-size: 24rpx;
  color: #574b43;
  text-align: center;
  transition: all 0.3s ease;
}
.control-item.active {
  .control-icon {
    font-weight: bold;
  }

  .control-text {
    font-weight: bold;
  }
}
</style>
