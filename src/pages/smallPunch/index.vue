<template>
  <view class="page">
    <view class="page-bg">
      <!-- 设置按钮 -->
      <view class="settings-btn">
        <text class="settings-text" @click="goToSetting">设置</text>
      </view>

      <!-- 设备信息卡片（静态示例数据，仅做展示） -->
      <view class="card product-card">
        <view class="product-header">
          <view>
            <view class="productName">{{ device.locationToilet }}</view>
            <view class="productModel">
              型号：
              <text>{{ productModelDetails.model }}</text>
            </view>
          </view>
        </view>
        <view class="product-hero">
          <!-- 这里可以按需替换为真实图片 -->
          <image class="product-img" :src="productModelDetails.image" mode="aspectFit" lazy-load />
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
          <view class="status-item">
            <text class="font_family m-arrow icon">&#xe618;</text>
            <text>
              今日使用次数：
              <text class="status-amount">{{ productModelDetails.waterTotal }}次</text>
            </text>
          </view>
        </view>
      </view>

      <!-- 统计表格 -->
      <view class="statistical-table-container">
        <statistical-table
          @changeRange="handleChangeRange"
          :data="statisticalData"
          :ready="statisticalReady"
          :buttonTab="[
            { label: '按天', value: 'day' },
            { label: '按小时', value: 'hour' },
          ]" />
      </view>
      <!-- 统计表格-end -->
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getProductModelDetails } from '@/api/mqttCommon';
import { queryDeviceStatisticGroup } from '@/api/uEchartsApi';
import StatisticalTable from '@/components/statistical-table/index.vue';
import { formatDate } from '@/utils/common';
// 设备相关
const device = ref('');
const status = ref('0');
const statusName = ref('离线');
const productModelDetails = ref({});
const statisticalData = ref({});
const statisticalReady = ref(false);
// ==================== 常量配置 ====================
const DEVICE_STATUS = ['离线', '在线', '故障'];

const DEVICE_CONFIG = {
  dst: '011025092402001D',
  did: '0111250924030004',
  dirDid: '011025092402001D',
};

// ==================== 设备控制 ====================
// 公用：构造“按天，往前推15天”的统计参数
const buildLast15DaysParams = () => {
  const now = new Date();
  const endDate = formatDate(now, 'yyyy-MM-dd');
  // 往前推15天
  const startDateObj = new Date(now);
  startDateObj.setDate(now.getDate() - 14);
  const statrDate = formatDate(startDateObj, 'yyyy-MM-dd');

  return {
    dataType: 2,
    statrDate,
    endDate,
  };
};

const buildLast24HoursParams = () => {
  const now = new Date();
  const endDate = formatDate(now, 'yyyy-MM-dd HH') + ':00:00';
  // 往前推24小时
  const startDateObj = new Date(now);
  startDateObj.setHours(now.getHours() - 23);
  const statrDate = formatDate(startDateObj, 'yyyy-MM-dd HH') + ':00:00';
  return {
    dataType: 3,
    statrDate,
    endDate,
  };
};

onLoad(async (options) => {
  const deviceData = options.device;
  if (deviceData) {
    const data = JSON.parse(decodeURIComponent(deviceData));
    device.value = data;
    status.value = data.deviceStatus;
    statusName.value = DEVICE_STATUS[status.value];
    DEVICE_CONFIG.did = data.did;
    DEVICE_CONFIG.dst = data.dirDid;
    DEVICE_CONFIG.dirDid = data.dirDid;
  }
  await Promise.all([loadProductModelDetails()]);
  const params = buildLast15DaysParams();
  getStatisticalData(params);
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

const goToSetting = () => {
  uni.navigateTo({
    url: '/pages/smallPunch/attributeControls?device=' + encodeURIComponent(JSON.stringify(device.value)),
  });
};

const handleChangeRange = (range) => {
  console.log('range', range);
  let params = {};
  if (range === 'day') {
    params = buildLast15DaysParams();
  } else {
    params = buildLast24HoursParams();
  }

  getStatisticalData(params);
};

async function getStatisticalData(objParams) {
  const { dataType, statrDate, endDate } = objParams || {};
  const params = {
    did: DEVICE_CONFIG.did,
    dataType,
    infoType: 2,
    statrDate,
    endDate,
  };
  statisticalReady.value = false;
  const res = await queryDeviceStatisticGroup(params);
  const { code, data } = res || {};
  if (code === 0) {
    statisticalData.value = data;
  } else {
    statisticalData.value = {};
  }
  statisticalReady.value = true;
}
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
  color: #a09f9f;
}

.status-online {
  color: #00a20f;
}
.status-offline {
  color: #fa3534;
}

.status-amount {
  color: #6a4f40;
}

.icon {
  font-size: 28rpx;
}

.statistical-table-container {
  margin: 32rpx 0 200rpx;
}
</style>
