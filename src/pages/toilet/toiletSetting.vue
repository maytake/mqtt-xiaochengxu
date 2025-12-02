<template>
  <view class="page">
    <view class="page-bg">
      <!-- 设置卡片 1 -->
      <view class="card settings-card">
        <view class="list">
          <view class="list-item" @click="resetToDefaults">
            <view class="label">恢复默认配置</view>
            <view class="extra value">
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>

          <view class="list-item">
            <view class="label dot" @click="showSleepTip">节能模式</view>
            <view class="extra">
              <up-switch v-model="energySaving" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
          <view class="divider"></view>

          <view class="list-item">
            <view class="label dot" @click="showSleepTip">四季温感模式</view>
            <view class="extra">
              <up-switch v-model="seasonMode" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
          <view class="divider"></view>

          <view class="list-item">
            <view class="label">静音</view>
            <view class="extra">
              <up-switch v-model="silentMode" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
          <view class="divider"></view>

          <view class="list-item">
            <view class="label">除臭</view>
            <view class="extra">
              <up-switch v-model="deodorize" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
          <view class="divider"></view>

          <view class="list-item">
            <view class="label">喷杆UVC杀菌</view>
            <view class="extra">
              <up-switch v-model="uvcBar" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
          <view class="divider"></view>

          <view class="list-item">
            <view class="label">过流UVC杀菌</view>
            <view class="extra">
              <up-switch v-model="uvcFlow" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
          <view class="divider"></view>

          <view class="list-item">
            <view class="label">自动泡沫盾</view>
            <view class="extra">
              <up-switch v-model="foamShield" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
          <view class="divider"></view>

          <view class="list-item">
            <view class="label">手动出泡</view>
            <view class="extra">
              <up-switch v-model="manualFoam" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
        </view>
      </view>

      <!-- 设置卡片 2 -->
      <view class="card settings-card">
        <view class="list">
          <view class="list-item">
            <view class="label">预湿润</view>
            <view class="extra">
              <up-switch v-model="preWet" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view class="label">离座自动冲水</view>
            <view class="extra">
              <up-switch v-model="autoFlushSeat" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view class="label">自动男士小便冲</view>
            <view class="extra">
              <up-switch v-model="autoMaleFlush" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
        </view>
      </view>

      <!-- 设置卡片 3 -->
      <view class="card settings-card">
        <view class="list">
          <view class="list-item" @click="openTempPopup">
            <view class="label">温度单位</view>
            <view class="extra value">
              <text>{{ tempUnit }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item" @click="openPicker('flushLevel')">
            <view class="label">冲水量</view>
            <view class="extra value">
              <text>{{ flushLevel }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view class="label">自动翻盖</view>
            <view class="extra">
              <up-switch v-model="autoLid" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item" @click="openLaserPopup">
            <view class="label">激光模式</view>
            <view class="extra value">
              <text>{{ laserLevel }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item" @click="openPicker('microwave')">
            <view class="label">微波模式</view>
            <view class="extra value">
              <text>{{ microwaveLevel }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view class="label">脚感翻盖</view>
            <view class="extra">
              <up-switch v-model="footLid" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view class="label">脚感冲水</view>
            <view class="extra">
              <up-switch v-model="footFlush" size="20" activeColor="#5a4a3f" />
            </view>
          </view>
        </view>
      </view>

      <!-- 统一选择器 -->
      <up-picker
        :show="showPicker"
        :columns="pickerColumns"
        :title="pickerTitle"
        :defaultIndex="pickerDefaultIndex"
        @confirm="onPickerConfirm"
        @cancel="showPicker = false"
      ></up-picker>

      <!-- 温度单位弹窗（自定义分段选择） -->
      <up-popup :show="showTemp" :round="10" mode="bottom" @close="showTemp=false">
        <view class="popup-content">
          <view class="title-row">
            <view class="action-btn action-cancel" @click="showTemp=false">取消</view>
            <view class="title">温度单位</view>
            <view class="action-btn action-confirm" @click="confirmTemp">确定</view>
          </view>
          <view class="seg-toggle">
            <view :class="['seg-opt', {active: tempDraft==='℃'}]" @click="tempDraft='℃'">℃</view>
            <view :class="['seg-opt', {active: tempDraft==='℉'}]" @click="tempDraft='℉'">℉</view>
          </view>
        </view>
      </up-popup>

      <!-- 激光模式弹窗 -->
      <up-popup :show="showLaser" :round="10" mode="bottom" @close="showLaser=false">
        <view class="popup-content">
          <view class="title-row">
            <view class="action-btn action-cancel" @click="showLaser=false">取消</view>
            <view class="title">激光模式</view>
            <view class="action-btn action-confirm" @click="confirmLaser">确定</view>
          </view>
          <!-- 等级选择器 -->
          <view class="level-selector">
            <view class="arrow-btn" @click="decreaseLaserLevel">
              <text class="arrow-icon">‹</text>
            </view>
            <view class="level-display">{{ laserTempLevel }}</view>
            <view class="arrow-btn" @click="increaseLaserLevel">
              <text class="arrow-icon">›</text>
            </view>
          </view>
          <view class="description">感应距离三挡可调</view>
          <!-- 分段控件 -->
          <view class="seg-row">
            <view :class="['seg', {active: laserType==='open'}]" @click="laserType='open'">开盖</view>
            <view :class="['seg', {active: laserType==='openclose'}]" @click="laserType='openclose'">开关盖</view>
          </view>
        </view>
      </up-popup>
    </view>
  </view>
</template>
<script setup>
import { ref } from 'vue';

// 基本设置
const energySaving = ref(false);
const seasonMode = ref(false);
const silentMode = ref(false);
const deodorize = ref(false);
const uvcBar = ref(false);
const uvcFlow = ref(false);
const foamShield = ref(false);
const manualFoam = ref(false);

const preWet = ref(false);
const autoFlushSeat = ref(false);
const autoMaleFlush = ref(false);

const tempUnit = ref('℃');
const flushLevel = ref('二挡');
const autoLid = ref(false);
const laserLevel = ref('二挡');
const microwaveLevel = ref('三挡');
const footLid = ref(false);
const footFlush = ref(false);

// 统一选择器
const showPicker = ref(false);
const pickerColumns = ref([]);
const pickerTitle = ref('');
const pickerDefaultIndex = ref([0]);
let currentPicker = '';

const openPicker = (type) => {
  currentPicker = type;
  if (type === 'flushLevel') {
    pickerColumns.value = [['一挡', '二挡', '三挡']];
    pickerTitle.value = '冲水量';
    pickerDefaultIndex.value = [Math.max(['一挡','二挡','三挡'].indexOf(flushLevel.value),0)];
  } else if (type === 'microwave') {
    pickerColumns.value = [['一挡', '二挡', '三挡']];
    pickerTitle.value = '微波模式';
    pickerDefaultIndex.value = [Math.max(['一挡','二挡','三挡'].indexOf(microwaveLevel.value),0)];
  }
  showPicker.value = true;
};

const onPickerConfirm = (e) => {
  const val = e.value[0];
  if (currentPicker === 'tempUnit') tempUnit.value = val;
  if (currentPicker === 'flushLevel') flushLevel.value = val;
  if (currentPicker === 'microwave') microwaveLevel.value = val;
  showPicker.value = false;
};

// 温度单位弹窗
const showTemp = ref(false);
const tempDraft = ref('℃');
const openTempPopup = () => {
  tempDraft.value = tempUnit.value;
  showTemp.value = true;
};
const confirmTemp = () => {
  tempUnit.value = tempDraft.value;
  showTemp.value = false;
};

// 激光模式
const showLaser = ref(false);
const laserType = ref('open'); // open / openclose
const laserTempLevel = ref('二挡');
const laserLevels = ['一挡', '二挡', '三挡'];

const openLaserPopup = () => {
  laserTempLevel.value = laserLevel.value;
  showLaser.value = true;
};

const decreaseLaserLevel = () => {
  const currentIndex = laserLevels.indexOf(laserTempLevel.value);
  if (currentIndex > 0) {
    laserTempLevel.value = laserLevels[currentIndex - 1];
  }
};

const increaseLaserLevel = () => {
  const currentIndex = laserLevels.indexOf(laserTempLevel.value);
  if (currentIndex < laserLevels.length - 1) {
    laserTempLevel.value = laserLevels[currentIndex + 1];
  }
};

const confirmLaser = () => {
  laserLevel.value = laserTempLevel.value;
  showLaser.value = false;
};

// 红点提示
const showSleepTip = () => {
  uni.showToast({ title: '命令已下发，设备处于休眠状态。', icon: 'none' });
};

// 恢复默认设置（与 faucet.vue 一致的交互）
const resetToDefaults = () => {
  uni.showModal({
    title: '提示',
    content: '确定是否恢复默认初始设置？',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => { if (res.confirm) applyDefaultSettings(); },
  });
};

const applyDefaultSettings = () => {
  energySaving.value = false;
  seasonMode.value = false;
  silentMode.value = false;
  deodorize.value = false;
  uvcBar.value = false;
  uvcFlow.value = false;
  foamShield.value = false;
  manualFoam.value = false;

  preWet.value = false;
  autoFlushSeat.value = false;
  autoMaleFlush.value = false;

  tempUnit.value = '℃';
  flushLevel.value = '二挡';
  autoLid.value = false;
  laserLevel.value = '二挡';
  microwaveLevel.value = '三挡';
  footLid.value = false;
  footFlush.value = false;
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

.card {
  background: linear-gradient(-90deg, #efefef 0%, #fff 100%);
  border-radius: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
}

.settings-card {
  margin-top: 32rpx;
  padding: 8rpx 0;
}

.list {
  width: 100%;
}

.list-item {
  padding: 36rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.label {
  font-size: 30rpx;
  color: #2b2b2b;
  display: flex;
  align-items: center;
}

.label.dot::after {
  content: '';
  display: inline-block;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ff3b30;
  margin-left: 8rpx;
}

.extra {
  font-size: 28rpx;
  display: flex;
  align-items: center;
}

.value text {
  color: #9aa0a6;
}

.arrow {
  margin-left: 12rpx;
  color: #c9ccd3;
}

.divider {
  height: 2rpx;
  background: #e2e2e2;
  margin: 0 32rpx;
}

.popup-content {
  padding: 32rpx 32rpx 48rpx 32rpx;
}
.title-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 8rpx 16rpx 8rpx;
}
.title-row .title {
  font-weight: bold;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32rpx;
  color: #303133;
}
.action-btn { font-size: 28rpx; }
.action-cancel { color: #c8c9cc; }
.action-confirm { color: #1677ff; }

/* 激光模式等级选择器 */
.level-selector {
  margin-top: 65rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
}

.arrow-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.arrow-icon {
  font-size: 50rpx;
  color: #7f7f7f;
  line-height: 1;
  font-weight: normal;
}

.level-display {
  font-size: 50rpx;
  font-weight: bold;
  color: #1f1f1f;
  min-width: 140rpx;
  text-align: center;
  letter-spacing: 2rpx;
}

.description {
  margin-top: 24rpx;
  text-align: center;
  font-size: 24rpx;
  color: #9aa0a6;
}

.seg-row {
  margin-top: 48rpx;
  margin-bottom: 32rpx;
  display: flex;
  justify-content: center;
  gap: 20rpx;
}
.seg {
  min-width: 160rpx;
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: 100rpx;
  background: #ffffff;
  color: #3b3b3b;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 26rpx rgba(0, 0, 0, 0.06);
}
.seg.active { background: #6a4f40; color: #fff; }

/* 温度单位分段控件 */
.seg-toggle {
  margin-top: 48rpx;
  align-self: center;
  width: 560rpx;
  height: 80rpx;
  background: #e6e6e6;
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 145rpx auto 120rpx;
}
.seg-opt {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #7f7f7f;
  height: 100%;
}
.seg-opt.active {
  background: #5a4a3f;
  color: #ffffff;
}
</style>
