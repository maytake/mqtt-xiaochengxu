<template>
  <view class="bathroom-layout" ref="mapElementRef">
    <view class="bathroom-wrap" v-if="imageUrl">
      <u-lazy-load class="m-pic" :image="imageUrl" :loading-img="loadingImg" :error-img="errorImg"
        :img-mode="isFullscreen ? 'heightFix' : 'widthFix'" />
      <view v-for="device in devices" :key="device.pointId" class="device-icon" :style="getDeviceStyle(device)"
        :class="getDeviceStyleByPosition(device)">
        <!-- 只显示一个圆点 -->
        <view class="only-one-dot" v-if="device.placement == 'hide-text'">
          <view class="point-dot" :class="{ alarm: device.deviceStatus != 1 }" @click="selectDevice(device)"></view>
        </view>
        <!-- 文字在圆点上面 -->
        <view class="status-indicator-up" v-if="device.placement == 'top'" @click="selectDevice(device)">
          <view class="status-indicator" :class="{ on: device.status, alarm: device.deviceStatus != 1 }">
            {{ device.pointName }}
            <text class="font_family m-arrow">&#xe60d;</text>
          </view>
          <view class="connector-line" :class="{ alarm: device.deviceStatus != 1 }"></view>
          <view class="point-dot" :class="{ alarm: device.deviceStatus != 1 }"></view>
        </view>
        <!-- 文字在圆点下面 -->
        <view class="status-indicator-down" v-if="device.placement == 'bottom'" @click="selectDevice(device)">
          <view class="point-dot" :class="{ alarm: device.deviceStatus != 1 }"></view>
          <view class="connector-line" :class="{ alarm: device.deviceStatus != 1 }"></view>
          <view class="status-indicator" :class="{ on: device.status, alarm: device.deviceStatus != 1 }">
            {{ device.pointName }}
            <text class="font_family m-arrow">&#xe60d;</text>
          </view>
        </view>
        <!-- 文字在圆点下面-end -->
      </view>
    </view>
    <view class="toilet-map-empty" v-else>
      <up-empty iconSize="80rpx" textColor="#999" textSize="28rpx" height="300rpx" text="暂无数据"></up-empty>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, getCurrentInstance } from 'vue';
import { updateDid } from '@/api/home';
const loadingImg = ref('/static/images/placeholder.jpg');
const errorImg = ref('/static/images/error.jpg');
const props = defineProps({
  imageUrl: { type: String, default: '' },
  devicesList: { type: Array, default: () => [] },
  locationToilet: { type: String, default: '' },
  notAllowJump: { type: Boolean, default: false },
});

const devices = computed(() => props.devicesList) || [
  {
    id: 'shower',
    pointName: '马桶01',
    coordinateJson: { left: 50, top: 320 },
    status: 0,
  },
];
const locationToilet = computed(() => props.locationToilet);
const notAllowJump = computed(() => props.notAllowJump);
const selectedDevice = ref(null);

// 图片相关状态
const imageRatio = ref(642 / 750);
const mapElementRef = ref(null);

const { proxy } = getCurrentInstance();
function measureLayoutWidthRpx() {
  uni
    .createSelectorQuery()
    .in(proxy)
    .select('.bathroom-layout') // 或给元素加 id 用 #bathroomLayout
    .boundingClientRect((rect) => {
      if (!rect) return;
      const { width, height } = rect || {};
      const widthPx = width; // 元素实际像素宽度

      const { windowWidth, windowHeight } = uni.getSystemInfoSync();
      const widthRpxVal = (widthPx * 750) / windowWidth;

      // 缩小的比率
      imageRatio.value = widthRpxVal / 750;
    })
    .exec();
}

// 若图片宽度影响布局，图片 onLoad 后再测一次
function onImageLoad(e) {
  nextTick(measureLayoutWidthRpx);
}

// 设备位置计算：将设计坐标(以 750 为基准)按比例换算为 px，确保与图片(宽度 100%)一致
const getDeviceStyle = (device) => {
  const leftPx = device.coordinateJson.left * imageRatio.value;
  const topPx = device.coordinateJson.top * imageRatio.value;
  return {
    left: `${Math.floor(leftPx)}rpx`,
    top: `${Math.floor(topPx)}rpx`,
  };
};
// WG0001 网关
// 1LT0151-000-001 感应龙头
// 1GZ0042-000-001 感应给皂器
// 1BM0095-000-001 感应小冲器
// 1BQ0033-000-001 感应大便器
// GS0001 干手器
// ZN2201 智能马桶

const productModelRouteMap = {
  '1LT0151-000-001': '/pages/faucet/index',
  ZN2201: '/pages/toilet/index',
  H111: '/pages/toiletH111/index',
  WG0001: '/pages/gateway/index',
  '1GZ0042-000-001': '/pages/soapDispenser/index',
  '1BM0095-000-001': '/pages/smallPunch/index',
  '1BQ0033-000-001': '/pages/bigPunch/index',
  GS0001: '/pages/handDryer/index',
};

const selectDevice = (device) => {
  // 如果禁止跳转，则不进行跳转
  if (notAllowJump.value) return;

  // 如果设备不是网关，则进行扫码
  if (device.productModel !== 'WG0001') {
    // 如果没有did，则进行扫码
    if (!device.did) {
      uni.showModal({
        title: '提示',
        content: '设备未绑定，请先扫码绑定',
        success: (res) => {
          if (res.confirm) {
            scan(device.pointId);
          }
        },
      });

      return;
    }
    // 如果没有dirDid，则弹窗确认
    if (!device.dirDid) {
      uni.showModal({
        title: '提示',
        content: '设备未组网，请从网关进入进行组网',
        success: (res) => {
          if (res.confirm) {
            // uni.navigateTo({
            //   url: '/pages/gateway/selectGateway?device=' + encodeURIComponent(JSON.stringify(device)),
            // });
          }
        },
      });
      return;
    }
  }

  const newDevice = {
    ...device,
    locationToilet: locationToilet.value,
  };
  console.log('newDevice', newDevice);

  selectedDevice.value = newDevice;
  const targetPath = productModelRouteMap[newDevice.productModel];
  if (targetPath) {
    uni.navigateTo({
      url: `${targetPath}?device=${encodeURIComponent(JSON.stringify(newDevice))}`,
    });
  }
};

const scan = (pointId) => {
  uni.scanCode({
    success: async (res) => {
      const x = res.result || '';
      let newResult = x.slice(1, -1);
      try {
        newResult = JSON.parse(newResult);
      } catch (error) {
        newResult = {};
      }
      const { did, productModel } = newResult || {};

      const params = {
        did,
        pointId: pointId,
        productModel,
      };
      const r = await updateDid(params);
      if (r.code === 0) {
        uni.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 2000,
        });
        // 刷新首页厕所地图
        uni.$emit('refresh-map');
      }
    },
    fail: (err) => {
      // 需要注意的是小程序扫码不需要申请相机权限
    },
  });
};

// 根据点位返回的位置信息修改样式
const getDeviceStyleByPosition = (device) => {
  const { placement } = device;
  return {
    'text-top': placement === 'top',
    'text-bottom': placement === 'bottom',
    'hide-text': placement === 'hide-text',
  };
};

</script>

<style lang="scss" scoped>
.bathroom-layout {
  position: relative;
  width: 100%;
  margin: 0 auto;
}

.bathroom-wrap {
  position: relative;
  border-radius: 20rpx;
  width: 100%;
}

.toilet-map-empty {
  margin: 100rpx 0;
  height: 280rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.m-pic ::v-deep .u-lazy-item {
  width: 100%;
  min-height: 240rpx;
}

.device-icon {
  position: absolute;
  min-width: 100rpx;
  height: 90rpx;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.device-icon.active {
  transform: translate(-50%, -80%) scale(1.1);
  box-shadow: 0 0 10px #b69d8d;
}

.status-indicator-up {
  min-width: 100rpx;
  height: 90rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.status-indicator-down {
  min-width: 100rpx;
  height: 90rpx;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}


.plus-btn {
  width: 26rpx;
  height: 36rpx;
  color: #574b43;
}

.only-one-dot {
  position: absolute;
  min-width: 50rpx;
  height: 50rpx;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 竖线和点的容器 */
.connector-line {
  width: 4rpx;
  height: 12rpx;
  background: #574b43;
  /* 默认棕色 */
}

.connector-line.alarm {
  background: #f50a0a;
  /* 报警红色与点保持一致*/
}

/* 新的点位样式 */
.point-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #574b43;
  border: 2px solid #9f816c;
}



.point-dot.alarm {
  background: #f50a0a;
  border: 2px solid #fe7070;
}

.status-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20rpx;
  color: #fff;
  word-break: keep-all;
  background: #574b43;
  border-radius: 10rpx;
  padding: 4rpx 10rpx;
  transition: background 0.3s;
  box-shadow: 0 0 6rpx #9e9e9e;
}

.alarm {
  background: #f50a0a;
}

.m-arrow {
  font-size: 18rpx;
  margin-left: 2rpx;
}

.text-top {
  transform: translate(-50%, -80%);
}

.text-bottom {
  transform: translate(-50%, -20%);
}

.hide-text {
  width: 50rpx;
  min-width: 50rpx;
  height: 50rpx;
  transform: translate(-50%, -40%);
}
</style>
