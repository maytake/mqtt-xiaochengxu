<template>
  <view class="page">
    <view class="page-bg">
      <!-- 设备卡片 -->
      <view class="card product-card">
        <view class="product-header">
          <view>
            <view class="productName">{{ device.pointName }}</view>
            <view class="productModel">
              型号：
              <text>{{ device.productModel }}</text>
            </view>
          </view>
        </view>
        <view class="product-hero">
          <toilet-map :imageUrl="imageUrl" :devicesList="devicesList" :notAllowJump="true" />
        </view>
        <view class="product-footer">
          <view class="status-item">
            <text class="font_family m-arrow icon">&#xe60c;</text>
            <text>{{ device.projectName }}</text>
          </view>
        </view>
      </view>

      <!-- 状态列表卡片 -->
      <view class="card status-card">
        <view class="list" v-if="faultDeviceList.length > 0">
          <view v-for="(item, index) in faultDeviceList" :key="item.faultCode">
            <view class="list-item">
              <view class="label">{{ item.faultDesc }}</view>
              <view class="extra">
                <view :class="['circle', !item.isFault ? 'ok' : 'bad']">
                  <text class="font_family circle-text">{{ !item.isFault ? '&#xe634;' : '&#xe632;' }}</text>
                </view>
              </view>
            </view>
            <view class="divider" v-if="index !== faultDeviceList.length - 1"></view>
          </view>
        </view>
        <up-empty
          v-else
          iconSize="80rpx"
          textColor="#999"
          textSize="28rpx"
          height="300rpx"
          text="暂无数据"
          style="padding: 30rpx 0"></up-empty>
      </view>

      <!-- 操作按钮 -->
      <view class="footer-btn-wrap">
        <view class="primary-btn" @click="handleResolved">已处理</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import toiletMap from '@/components/toilet-map/index.vue';
import { updateDiagnose, getMessageDetail } from '@/api/message';
import { generateRandomSeq } from '@/utils/common';
const mqttUserInfo = uni.getStorageSync('mqttUserInfo');
const clientId = mqttUserInfo?.clientId || '';
// 厕所施工图
const imageUrl = ref('https://smart.tck.com.cn/itemDevice-api/images_project/20251118_103501_a972ada3.png'); // 厕所施工图图片
const devicesList = ref([]); // 厕所施工图设备列表
const device = ref({});
// 初始状态（根据截图）

const faultDeviceList = ref([]);

onLoad((options) => {
  const { device: deviceStr } = options;
  const item = JSON.parse(decodeURIComponent(deviceStr));
  const { coordinateJson, pointName, imagePath } = item;
  device.value = item;
  devicesList.value = [
    {
      id: 'shower',
      pointName: pointName,
      coordinateJson: coordinateJson,
      deviceStatus: 0,
    },
  ];
  imageUrl.value = imagePath;
  getList(item);
});

async function getList(item) {
  const { dirDid, did } = item;
  const params = {
    dirDid: dirDid || '011025092402001D',
    did: did || '011225092403004F',
  };
  const res = await getMessageDetail(params);
  const { code, data } = res || {};
  if (code === 0) {
    faultDeviceList.value = data || [];
  }
}

const handleResolved = async () => {
  const { dirDid, did } = device.value;

  const params = {
    src: clientId,
    dst: dirDid,
    ver: 'V1.0',
    seq: generateRandomSeq(),
    params: {
      did,
    },
  };

  const res = await updateDiagnose(params);
  if (res.code === 0) {
    faultDeviceList.value.forEach((item) => {
      item.isFault = false;
    });
    devicesList.value.forEach((item) => {
      item.deviceStatus = 1;
    });
    uni.showToast({
      title: '操作成功',
      icon: 'success',
      duration: 2000,
    });
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
  min-height: 100vh;
  padding: 30rpx;
}

/* 卡片与标题样式参考 faucet.vue */
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
  min-height: 240rpx;
  margin-top: 32rpx;
}
.product-img {
  width: 100%;
  border-radius: 16rpx;
}
.product-footer {
  margin-top: 32rpx;
  display: flex;
  gap: 30rpx;
}
.status-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
  color: #6b7280;
}
.icon {
  font-size: 28rpx;
  color: #9aa0a6;
}

.status-card {
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
}
.extra {
  display: flex;
  align-items: center;
}
.value text {
  color: #9aa0a6;
}
.divider {
  height: 2rpx;
  background: #e2e2e2;
  margin: 0 32rpx;
}

/* 圆形状态图标 */
.circle {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.circle-text {
  font-size: 48rpx;
}
.ok {
  .circle-text {
    color: #16c25a;
  }
}
.bad {
  .circle-text {
    color: #fa3534;
  }
}

.text-warning {
  color: #d38b2a;
}
.text-normal {
  color: #2b2b2b;
}

.footer-btn-wrap {
  display: flex;
  justify-content: center;
  margin-top: 48rpx;
  margin-bottom: 80rpx;
}
.primary-btn {
  height: 88rpx;
  width: 420rpx;
  border-radius: 112rpx;
  background: #5a4a3f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  box-shadow: 0 10rpx 26rpx rgba(0, 0, 0, 0.06);
}
</style>
