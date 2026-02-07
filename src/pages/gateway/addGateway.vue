<template>
  <view class="page">
    <view class="page-bg">
      <!-- 设备列表 -->
      <view class="device-list-card" v-if="deviceList.length > 0">
        <view v-for="(item, index) in deviceList" :key="item.did" class="device-item">
          <view class="device-info">
            <view class="device-name">{{ item.pointName }}</view>
            <view class="device-id">{{ item.productModel }}</view>
          </view>
          <view class="device-status">
            <!-- 成功状态：绿色勾选 -->
            <up-icon v-if="item.status === 'success'" name="checkmark-circle-fill" size="22" color="#00a20f"></up-icon>
            <!-- 加载中状态：灰色加载图标 -->
            <up-loading-icon
              v-else-if="item.status === 'loading'"
              mode="circle"
              size="22"
              color="#9aa0a6"></up-loading-icon>
            <!-- 失败状态：红色叉 -->
            <up-icon v-else-if="item.status === 'failed'" name="close-circle-fill" size="22" color="#fa3534"></up-icon>
          </view>
        </view>
      </view>
      <view class="m-empty" v-else>
        <up-empty iconSize="80rpx" textColor="#999" textSize="28rpx" height="300rpx" text="暂无数据"></up-empty>
      </view>
      <!-- 底部操作按钮 -->
      <view class="bottom-actions">
        <view class="action-btn continue-btn" @click="handleContinue">
          <text>继续</text>
        </view>
        <view class="action-btn stop-btn" @click="handleStop">
          <text>停止</text>
        </view>
        <view class="action-btn complete-btn" @click="handleComplete">
          <text>完成</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';
import { onLoad, onBackPress, onUnload } from '@dcloudio/uni-app';
import { generateRandomSeq } from '@/utils/common';
import { useStore } from '@/stores/globalMqttInfo';
import { batchAddSubDevice, stopDisc } from '@/api/gateway';
import { storeToRefs } from 'pinia';
const mqttUserInfo = uni.getStorageSync('mqttUserInfo');
const clientId = mqttUserInfo?.clientId || '';

const device = ref(null);
let globalWatchStop = null;
let seq = null;
let waitTime = null;
let stopTimer = null;

const deviceList = ref([]);
onLoad(async (options) => {
  const deviceData = options.device;
  seq = options.seq;
  waitTime = options.waitTime || 3000;
  if (deviceData) {
    device.value = JSON.parse(decodeURIComponent(deviceData));
  }


  if (options.selectedDevices) {
    try {
      const selectedDevices = JSON.parse(decodeURIComponent(options.selectedDevices));
      console.log('从 URL 参数获取设备列表:', selectedDevices);
      const data = selectedDevices.map((item) => ({ ...item, status: 'loading' }));
      deviceList.value = data;
      stopLoadingDevices();
      getDidFromMqtt(seq);
    } catch (e) {}
  }
});


const cleanupWatchListeners = () => {
  if (globalWatchStop) {
    globalWatchStop();
    globalWatchStop = null;
  }
};


const cleanupStopTimer = () => {
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
};

function stopLoadingDevices() {
  cleanupStopTimer();
  stopTimer = setTimeout(() => {
    console.log('停止所有状态为loading的设备');
    deviceList.value.forEach((item) => {
      if (item.status === 'loading') {
        item.status = 'failed';
      }
    });
  }, waitTime);
}


function getDidFromMqtt(seq) {

  const { globalTopicInfo } = storeToRefs(useStore());
  cleanupWatchListeners();

  globalWatchStop = watch(
    globalTopicInfo,
    (newVal) => {

      if (!newVal || newVal?.seq !== seq) {
        return;
      }
      const { result, method } = newVal || {};
      console.log('设备添加应答：', newVal);
      if (method === 'Dev.AddSub') {
        if (result != 1) {
          deviceList.value.forEach((item) => {
            item.status = 'failed';
          });
          uni.showToast({
            title: '获取设备信息失败',
            icon: 'none',
          });
          cleanupWatchListeners();
        }
        return;
      }

      if (method === 'Dev.ReportDevices') {
        if (result == 1) {
          const didArray = newVal?.params?.devices || [];
          const dids = didArray.map((item) => item.did);
          deviceList.value = deviceList.value.map((item) => {
            if (dids.includes(item.did)) {
              item.status = 'success';
            }
            return item;
          });
        }
        return;
      }
    },
    { deep: true, immediate: false }
  );
}


const handleStop = async () => {

  const failedDevices = deviceList.value.filter((item) => item.status === 'loading');
  if (failedDevices.length > 0) {
    try {
      const params = {
        src: clientId,
        dst: device.value.did,
        ver: 'V1.0',
        seq: generateRandomSeq(),
      };
      const res = await stopDisc(params);
      if (res.code == 0) {
        const failedDevices = deviceList.value.filter((item) => item.status === 'loading');
        failedDevices.forEach((item) => {
          item.status = 'failed';
        });
        uni.showToast({
          title: '已停止',
          icon: 'none',
        });
      }
    } catch (e) {}
  } else {
    uni.showToast({
      title: '没有正在添加的设备',
      icon: 'none',
      duration: 1500,
    });
  }
};


const handleContinue = async () => {

  const failedDevices = deviceList.value.filter((item) => item.status !== 'success');

  if (failedDevices.length === 0) {
    uni.showToast({
      title: '没有失败设备',
      icon: 'none',
      duration: 1500,
    });
    return;
  }
  failedDevices.forEach((item) => {
    item.status = 'loading';
  });
  stopLoadingDevices();
  const { did } = device.value;
  const res = await batchAddSubDevice({
    src: clientId,
    dst: did,
    ver: 'v1.0',
    seq,
    params: {
      devices: failedDevices.map((item) => item.did),
      duration: 120000,
    },
  });
  if (res.code === 0) {
    uni.showToast({
      title: '操作成功',
      icon: 'none',
      duration: 1500,
    });
    return;
  }
};


const returnToGatewayDetail = () => {
  const pages = getCurrentPages();


  const targetIndex = pages.findIndex((p) => {

    if (p.route === 'pages/gateway/gatewayList') return true;


    if (p.$page && p.$page.fullPath && p.$page.fullPath.indexOf('pages/gateway/gatewayList') !== -1) {
      return true;
    }
    return false;
  });

  if (targetIndex !== -1) {

    const delta = pages.length - 1 - targetIndex;
    if (delta > 0) {
      uni.navigateBack({ delta });

      uni.$emit('refresh-map');
    }
    return;
  }

  uni.navigateBack();

  uni.$emit('refresh-map');
};


const handleComplete = async () => {
  try {
    const params = {
      src: clientId,
      dst: device.value.did,
      ver: 'V1.0',
      seq: generateRandomSeq(),
    };
    const res = await stopDisc(params);
    if (res.code == 0) {
      const failedDevices = deviceList.value.filter((item) => item.status === 'loading');
      failedDevices.forEach((item) => {
        item.status = 'failed';
      });
      returnToGatewayDetail();
    }
  } catch (e) {}
};


onUnload(() => {
  cleanupStopTimer();
  cleanupWatchListeners();
});
</script>

<style lang="scss" scoped>
.page {
  background: linear-gradient(90deg, #efefef 0%, #f7f7f7 50%, #fff 100%);
  min-height: 100vh;
  overflow: hidden;
}

.page-bg {
  padding: 30rpx;
  padding-top: calc(constant(safe-area-inset-top) + 30rpx);
  padding-top: calc(env(safe-area-inset-top) + 30rpx);
  padding-bottom: calc(constant(safe-area-inset-bottom) + 140rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 140rpx);
  display: flex;
  flex-direction: column;
}


.device-list-card {
  background: linear-gradient(-90deg, #efefef 0%, #fff 100%);
  border-radius: 28rpx;
  overflow: hidden;
  margin-top: 50rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
}


.device-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 38rpx 32rpx;
  background: #fff;
  position: relative;
}

.device-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 32rpx;
  right: 32rpx;
  bottom: 0;
  height: 2rpx;
  background: #e0e0e0;
  transform: scaleY(0.5);
}

.device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.device-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #1f1f1f;
  margin-bottom: 8rpx;
}

.device-id {
  font-size: 24rpx;
  color: #9aa0a6;
}

.device-status {
  display: flex;
  align-items: center;
  justify-content: center;
}


.bottom-actions {
  position: fixed;
  bottom: calc(constant(safe-area-inset-bottom) + 30rpx);
  bottom: calc(env(safe-area-inset-bottom) + 30rpx);
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 60rpx);
  max-width: 690rpx;
  display: flex;
  gap: 20rpx;
  z-index: 10;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.continue-btn {
  background: #5a4a3f;
  color: #fff;
}

.stop-btn {
  background: #fff;
  color: #666;
  border: 2rpx solid #e0e0e0;
}
.complete-btn {
  background: #4891ff;
  color: #ffffff;
  border: 2rpx solid #e0e0e0;
}
</style>
