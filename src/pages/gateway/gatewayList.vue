<template>
  <view class="page">
    <view class="page-bg">
      <!-- 位置标题 -->
      <view class="location-title">5号楼一层男士厕所01网关</view>

      <!-- 设备列表卡片 -->
      <view class="device-list-card" v-if="deviceList.length > 0">
        <view v-for="(item, index) in deviceList" :key="item.did" class="device-item">
          <view class="device-info">
            <view class="device-name">{{ item.pointName }}</view>
            <view class="device-id">{{ item.productModel }}</view>
          </view>
          <view class="device-status">在线</view>
          <view class="delete-btn" @click.stop="handleDelete(item, index)">
            <text class="delete-icon">×</text>
          </view>
        </view>
      </view>
      <view class="m-empty" v-else>
        <up-empty iconSize="80rpx" textColor="#999" textSize="28rpx" height="300rpx" text="暂无数据"></up-empty>
      </view>
      <!-- 添加设备按钮 -->
      <view class="add-device-btn" @click="handleAddDevice">
        <text>添加设备</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { readDeviceInfo, getBindSubDeviceInfo, delDevice } from '@/api/gateway';
import { generateRandomSeq } from '@/utils/common';
import { useStore } from '@/stores/globalMqttInfo';
import { storeToRefs } from 'pinia';
// ==================== 工具函数 ====================
const mqttUserInfo = uni.getStorageSync('mqttUserInfo');
const clientId = mqttUserInfo?.clientId || '';
const device = ref(null);
let globalWatchStop = null;
// 设备列表数据（假数据）
const deviceList = ref([]);

// 删除设备
const handleDeleteDevice = async (item, index) => {
  const { did } = device.value;
  const params = {
    src: clientId,
    dst: did,
    ver: 'V1.0',
    seq: generateRandomSeq(),
    params: {
      devices: [item.did],
    },
  };

  const res = await delDevice(params);
  if (res.code === 0) {
    uni.showToast({
      title: '删除成功',
      icon: 'success',
    });
    deviceList.value = deviceList.value.filter((item) => item.did !== item.did);
  }
};

// 清理 globalTopicInfo 的 watch
const cleanupWatchListeners = () => {
  if (globalWatchStop) {
    globalWatchStop();
    globalWatchStop = null;
  }
};

// 处理删除事件
const handleDelete = (item, index) => {
  uni.showModal({
    title: '提示',
    content: '确定是否删除该条数据?',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        // 确认删除
        handleDeleteDevice(item, index);
      }
    },
  });
};

// 添加设备
const handleAddDevice = () => {
  uni.navigateTo({
    url: '/pages/gateway/selectGateway?device=' + encodeURIComponent(JSON.stringify(device.value)),
  });
};

onLoad(async (options) => {
  initDeviceData(options);
});

// mqtt全局返回的did
function getDidFromMqtt(seq) {
  // 监听全局主题消息
  const { globalTopicInfo } = storeToRefs(useStore());
  cleanupWatchListeners();
  globalWatchStop = watch(
    globalTopicInfo,
    (newVal) => {
      // 先检查 seq 是否匹配，不匹配直接返回，避免执行任何逻辑
      if (!newVal || newVal?.seq !== seq) {
        return;
      }
      console.log('mqtt应答：', newVal);
      if (newVal?.result == 1) {
        const didArray = newVal?.params || [];
        getDeviceList(didArray);
        cleanupWatchListeners(); // 处理完成后清理 watch
      } else {
        uni.showToast({
          title: '获取设备信息失败',
          icon: 'none',
        });
        cleanupWatchListeners(); // 处理完成后清理 watch
      }
    },
    { deep: true, immediate: false }
  );
}

// 获取设备列表
async function getDeviceList() {
  const { dirDid } = device.value;
  const res = await getBindSubDeviceInfo({ dirDid });
  const { code, data } = res || {};
  if (code === 0) {
    deviceList.value = data;
  }
}

const initDeviceData = async (options) => {
  const deviceData = options.device;
  if (deviceData) {
    device.value = JSON.parse(decodeURIComponent(deviceData)) || {};
  }
  const { did } = device.value;
  const seq = generateRandomSeq();
  try {
    const params = {
      src: clientId,
      dst: did,
      ver: 'V1.0',
      seq,
      params: {
        did: did,
      },
    };
    const res = (await readDeviceInfo(params)) || {};
    if (res.code === 0) {
      getDidFromMqtt(seq);
    }
  } catch (error) {
    console.log(error);
  }
};
</script>

<style lang="scss" scoped>
.page {
  background: linear-gradient(90deg, #efefef 0%, #f7f7f7 50%, #fff 100%);
  min-height: 100vh;
  overflow: hidden;
}

.page-bg {
  padding: 30rpx;
  padding-top: calc(constant(safe-area-inset-top) + 60rpx);
  padding-top: calc(env(safe-area-inset-top) + 60rpx);
  padding-bottom: calc(constant(safe-area-inset-bottom) + 140rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 140rpx);
}

// 位置标题
.location-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f1f1f;
  text-align: center;
  margin-bottom: 48rpx;
  padding: 0 8rpx;
}

// 设备列表卡片
.device-list-card {
  background: linear-gradient(-90deg, #efefef 0%, #fff 100%);
  border-radius: 28rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
}

// 设备列表项
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
  font-size: 28rpx;
  color: #00a20f;
}

.delete-btn {
  position: absolute;
  right: 19rpx;
  bottom: 2rpx;
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  z-index: 1;
}

.delete-btn:active {
  background: #e0e0e0;
  transform: scale(0.95);
}

.delete-icon {
  font-size: 40rpx;
  color: #e0e0e0;
  line-height: 1;
  font-weight: 300;
}

// 添加设备按钮
.add-device-btn {
  position: fixed;
  bottom: calc(constant(safe-area-inset-bottom) + 30rpx);
  bottom: calc(env(safe-area-inset-bottom) + 30rpx);
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 60rpx);
  max-width: 690rpx;
  height: 88rpx;
  background: #5a4a3f;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  z-index: 10;
}
.m-empty {
  margin: 100rpx 0;
  height: 280rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
