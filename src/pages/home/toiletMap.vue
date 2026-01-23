<template>
  <view class="bathroom-layout">
    <view class="bathroom-wrap" :class="{ landscape: isFullscreen }" v-if="imageUrl">
      <image class="m-pic" :src="imageUrl" lazy-load :mode="isFullscreen ? 'heightFix' : 'widthFix'" @load="onImageLoad"
        :style="imageStyle" ref="mImage" />
      <view v-for="device in devices" :key="device.pointId" class="device-icon" :style="getDeviceStyle(device)" :class="{
        alarm: device.deviceStatus != 1,
        landscape: isFullscreen,
        ...getDeviceStyleByPosition(device),
      }">

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
    <!-- 全屏切换按钮 -->
    <view :class="{ 'screen-toggle': true, active: isFullscreen }" @click="toggleFullScreen">
      <text class="font_family screen-icon">&#xe62e;</text>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { ref, computed } from 'vue';
import { updateDid } from '@/api/home';

// 状态管理 - 确保所有响应式变量在使用前已定义
const isFullscreen = ref(false);
const selectedDevice = ref(null);
const imageUrl = ref('');
const locationToilet = ref('');
// 设备数据
const devices = ref([
  {
    pointId: 'shower',
    pointName: '马桶01',
    icon: '&#xe60c;',
    coordinateJson: { left: 50, top: 320 },
    status: { on: false, water: 80 },
    actions: ['开关', '冲洗'],
  },
]);
// 目标页 onLoad 方法
onLoad((options) => {
  if (options.data) {
    const data = JSON.parse(decodeURIComponent(options.data));
    const { imageUrl: imgUrl, devicesList, locationToilet: locationToiletValue } = data;
    console.log('data', data);
    imageUrl.value = imgUrl;
    devices.value = devicesList;
    locationToilet.value = locationToiletValue;
  }
});
// 图片相关状态
const imageRatio = ref(1);
const originalImageSize = ref({ width: 750, height: 750 }); // 标准化为750rpx宽度
const scaledImageSize = ref({ width: 750, height: 750 });

// 图片样式计算
const imageStyle = computed(() => {
  // 横屏模式下，图片高度100%，宽度等比缩放
  // 算出的实际宽度px要转成rpx：rpx / px = 750/screenHeight
  if (isFullscreen.value) {
    //  oriheight / oriwidth = height / width 图片缩放后的比例是相等的
    //  oriwidth  = oriheight / (height / width)
    const scaledWidth = Math.floor(750 / imageRatio.value);

    // 更新缩放尺寸
    scaledImageSize.value = {
      width: scaledWidth,
      height: 750,
    };

    return {
      height: '100%',
      width: `${scaledWidth}rpx`,
    };
  }

  return { width: '100%', height: `${originalImageSize.value.height}rpx` };
});

// 图片加载处理
const onImageLoad = (e) => {
  const { width, height } = e.detail;
  imageRatio.value = height / width;
  //  oriheight / oriwidth = height / width 图片缩放后的比例是相等的
  //  oriheight  = oriwidth * (height / width)
  //  oriwidth  = oriheight / (height / width)

  // 更新原始尺寸
  originalImageSize.value = {
    width: 750,
    height: Math.floor(750 * imageRatio.value),
  };

  // 横屏模式下
  if (isFullscreen.value) {
    scaledImageSize.value = {
      width: Math.floor(750 / imageRatio.value),
      height: 750,
    };
  }
};

// 设备位置计算
const getDeviceStyle = (device) => {
  let left = device.coordinateJson.left;
  let top = device.coordinateJson.top;

  if (isFullscreen.value) {
    // 横屏模式下，缩放图片与原始图片的比率
    const scaleX = scaledImageSize.value.width / originalImageSize.value.width;
    const scaleY = scaledImageSize.value.height / originalImageSize.value.height;

    // 横屏模式下，应用缩放比例
    left = device.coordinateJson.left * scaleX;
    top = device.coordinateJson.top * scaleY;
  }

  return {
    left: `${Math.floor(left)}rpx`,
    top: `${Math.floor(top)}rpx`,
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

// 切换横竖屏显示
const toggleFullScreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const scan = (pointId) => {
  uni.scanCode({
    success: async (res) => {
      const { did, productModel } = res.result;
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
  width: 100%;
  height: 100vh;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #000;
}

.bathroom-wrap {
  width: 100%;
  position: relative;

  &.landscape {
    transform: rotate(90deg);
    width: 100vh;
    height: 100vw;
  }
}

.toilet-map-empty {
  margin: 100rpx 0;
  height: 280rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.m-pic {
  display: block;
}

.device-icon {
  position: absolute;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 100rpx;
  height: 90rpx;
  cursor: pointer;

  &.landscape {
    .status-indicator {
      transform-origin: center center;
    }
  }

  &.active {
    transform: translate(-50%, -76%) scale(1.1);
    box-shadow: 0 0 10px #b69d8d;
  }

  &.alarm .status-indicator {
    background: #f50a0a;
  }
}

.plus-btn {
  width: 26rpx;
  height: 36rpx;
  color: #574b43;
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

  &.on {
    background: #67c23a;
    color: #fff;
  }
}

.m-arrow {
  font-size: 18rpx;
  margin-left: 2rpx;
}

.screen-toggle {
  position: fixed;
  right: 30rpx;
  bottom: 60rpx;
  z-index: 999;
  background: rgba(255, 255, 255, 0.65);
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    background: #574b43;
  }
}

.screen-icon {
  color: #fff;
  font-size: 32rpx;
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

.device-icon.alarm .status-indicator {
  background: #f50a0a;
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
