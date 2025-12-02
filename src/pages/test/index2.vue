<template>
  <view class="content">
    <button text="测试" @click="test">出水开关</button>
    <button text="测试" @click="test2">出水开关2</button>
  </view>
</template>
<script setup>
const mqttClient = getApp().globalData.mqttService;

mqttClient.subscribe('/olt', { qos: 0 }, (error) => {
  if (error) {
    console.log(`订阅主题 /olt 失败:`, error);
    return;
  }
  console.log(`订阅主题 /olt 成功`);
});
mqttClient.on('message', (topic, payload) => {
  console.log('收到消息: ' + payload.toString() + '\nOn topic: ' + topic);
});
const test = () => {
  mqttClient.publish('/olt', '测试', { qos: 0 }, (error) => {
    if (error) {
      uni.showToast({ title: error.message || '发布失败', icon: 'none' });
      return;
    }
    uni.showToast({ title: '发布成功', icon: 'success' });
  });
};
const test2 = () => {
  mqttClient.publish('/olt', '测试222', { qos: 0 }, (error) => {
    if (error) {
      uni.showToast({ title: error.message || '发布失败', icon: 'none' });
      return;
    }
    uni.showToast({ title: '发布成功', icon: 'success' });
  });
};
</script>
<style scoped>
.content {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: #fff;
}
.bg-circle-wrap {
  background: #fff;
  border-radius: 50%;
  padding: 10px;
  width: 220px;
  height: 220px;
  z-index: 900;
  display: flex;
  justify-content: center;
  align-items: center;
}
.bg-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 580rpx;
  height: 580rpx;
  border-radius: 50%;
  /* 更平滑的亮度过渡，增加中间过渡点 */
  background: linear-gradient(160deg, #ffffff 0%, #fcfcfc 35%, #f7f7f7 70%, #f2f2f2 100%);
  /* 仅右下方向的外投影 */
  box-shadow: 26rpx 30rpx 84rpx rgba(0, 0, 0, 0.12);
}
</style>
