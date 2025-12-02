<template>
  <view class="page">
    <view class="page-bg">
      <!-- 设备信息卡片 -->
      <view class="card product-card">
        <view class="product-header">
          <view>
            <view class="productName">{{ deviceName }}</view>
            <view class="productModel">
              型号：
              <text>{{ productModelDetails.model }}</text>
            </view>
          </view>
        </view>
        <view class="product-hero">
          <image class="product-img" lazy-load :src="productModelDetails.image" mode="aspectFit"></image>
        </view>
        <view class="product-footer">
          <view class="status-item">
            <text class="font_family m-arrow icon">&#xe61b;</text>
            <text>
              状态：
              <text :class="status === 1 ? 'status-online' : 'status-offline'">
                {{ statusName }}
              </text>
            </text>
          </view>
        </view>
      </view>

      <!-- 设备管理部分 -->
      <view class="device-management">
        <view class="section-title">设备管理</view>
        <view class="card settings-card">
          <view class="list">
            <view class="list-item" @click="handleWiFiConfig">
              <view class="label">Wifi 连接 SSID :TCK 配置</view>
              <view class="extra value">
                <text class="font_family m-arrow arrow">&#xe60d;</text>
              </view>
            </view>
            <view class="divider"></view>
            <view class="list-item" @click="handleDeviceManagement">
              <view class="label">设备管理</view>
              <view class="extra value">
                <text>{{ deviceCount }}个</text>
                <text class="font_family m-arrow arrow">&#xe60d;</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onBackPress } from '@dcloudio/uni-app';
import { getProductModelDetails } from '@/api/mqttCommon';
import { getBindDeviceTotal } from '@/api/gateway';
// 设备信息
const deviceName = ref('五号楼一层厕所01');
const deviceModel = ref('U101');
const deviceImage = ref('/static/images/wangguan.png'); // 默认图片，可根据实际情况调整
const deviceStatus = ref('online'); // online | offline
const statusName = ref('在线');
const deviceCount = ref(0);
const status = ref('0');
const device = ref(null);
const productModelDetails = ref({});

// ==================== 常量配置 ====================
const DEVICE_STATUS = ['离线', '在线', '故障'];
// 页面加载
onLoad((options) => {
  // 如果有传入设备信息，则使用传入的信息
  if (options.device) {
    const deviceData = JSON.parse(decodeURIComponent(options.device));
    console.log(deviceData);
    if (deviceData) {
      deviceName.value = deviceData.locationToilet || deviceData.name || deviceName.value;
      deviceModel.value = deviceData.model || deviceModel.value;
      deviceStatus.value = deviceData.deviceStatus === '1' ? 'online' : 'offline';
      status.value = deviceData.deviceStatus;
      statusName.value = DEVICE_STATUS[status.value];
      device.value = deviceData;
      if (deviceData.image) {
        deviceImage.value = deviceData.image;
      }
    }
    loadProductModelDetails();
    getBindDeviceTotal({dirDid: deviceData.dirDid}).then(res => {
      const { code, data } = res || {};
      if (code === 0) {
        deviceCount.value = data;
      }
    });
  }
});

// ==================== 产品信息 ====================
const loadProductModelDetails = async () => {
  try {
    const pointId = device.value.pointId;
    const res = await getProductModelDetails(pointId);
    const { code, data } = res || {};
    if (code === 0) {
      productModelDetails.value = data;
    }
  } catch (error) {
    console.error('获取产品模型详情失败:', error);
  }
};

// Wi-Fi配置
const handleWiFiConfig = () => {
  // 跳转到Wi-Fi配置页面，可根据实际情况调整
  uni.showToast({
    title: 'Wi-Fi配置功能',
    icon: 'none',
  });
};

// 设备管理
const handleDeviceManagement = () => {
  // 跳转到设备管理页面，可根据实际情况调整
  uni.navigateTo({
    url: '/pages/gateway/gatewayList?device=' + encodeURIComponent(JSON.stringify(device.value)),
  });
};
onBackPress(() => {
  uni.showToast({
    title: '返回首页',
    icon: 'none',
  });
  uni.reLaunch({ url: '/pages/home/index' });
  return true;
});
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

// 卡片样式
.card {
  background: linear-gradient(-90deg, #efefef 0%, #fff 100%);
  border-radius: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
}

.product-card {
  padding: 30rpx 40rpx;
  margin-bottom: 42rpx;
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
  align-items: center;
}

.product-img {
  height: 360rpx;
  width: 100%;
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
  color: #a09f9f;
}

.status-online {
  color: #00a20f;
}

.status-offline {
  color: #fa3534;
}

.icon {
  font-size: 28rpx;
}

// 设备管理部分
.device-management {
  margin-top: 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 24rpx;
}

.settings-card {
  padding: 8rpx 0;
  margin-bottom: 100rpx;
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
</style>
