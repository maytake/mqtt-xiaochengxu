<template>
  <view class="page" @tap="handlePageTap">
    <view class="page-bg">
      <!-- 网关选择器 -->
      <view class="floor-selector">
        <lk-tree
          style="width: 100%"
          v-model="selectedValue"
          :data="treeData"
          node-key="projectId"
          :props="defaultProps"
          placeholder="请选择楼层"
          @node-click="handleNodeClick" />
      </view>

      <!-- 设备列表 -->
      <view class="device-list-container" v-if="deviceList.length > 0">
        <!-- 全选 -->
        <view class="select-all-row" @click="toggleSelectAll">
          <view class="checkbox-wrapper">
            <view :class="['checkbox', { checked: isAllSelected }]">
              <up-icon v-if="isAllSelected" name="checkmark" size="14" color="#fff"></up-icon>
            </view>
          </view>
          <text class="select-all-text">全选</text>
        </view>

        <!-- 设备列表 -->
        <view class="device-list-card" v-if="deviceList.length > 0">
          <view
            v-for="(item, index) in deviceList"
            :key="item.did"
            class="device-item"
            @click="toggleDevice(item.did, item)">
            <view class="checkbox-wrapper">
              <view :class="['checkbox', { checked: selectedDevices.includes(item.did) }]">
                <up-icon v-if="selectedDevices.includes(item.did)" name="checkmark" size="14" color="#fff"></up-icon>
              </view>
            </view>
            <view class="device-info">
              <view class="device-name">{{ item.pointName }}</view>
              <view class="device-id">{{ item.productModel }}</view>
            </view>
          </view>
        </view>
        <view class="m-empty" v-else>
          <up-empty iconSize="80rpx" textColor="#999" textSize="28rpx" height="300rpx" text="暂无数据"></up-empty>
        </view>
      </view>
      <view class="m-empty" v-else>
        <up-empty iconSize="80rpx" textColor="#999" textSize="28rpx" height="300rpx" text="暂无数据"></up-empty>
      </view>
      <!-- 底部操作按钮 -->
      <view class="bottom-actions">
        <view class="action-btn cancel-btn" @click="handleCancel">
          <text>取消</text>
        </view>
        <view class="action-btn confirm-btn" @click="handleConfirm">
          <text>确认添加组网</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import LkTree from '@/components/lk-tree/index.vue';
import { getSubDeviceInfo, batchAddSubDevice } from '@/api/gateway';
import { generateRandomSeq } from '@/utils/common';
import { onLoad } from '@dcloudio/uni-app';
import useProjectTreeStore from '@/stores/projectTree';
const buildingTreeStore = useProjectTreeStore();
const mqttUserInfo = uni.getStorageSync('mqttUserInfo');
const clientId = mqttUserInfo?.clientId || '';

const treeData = ref([]);
const selectedValue = ref('');
const device = ref(null);
const defaultProps = ref({
  children: 'children',
  label: 'name',
});
// 设备列表数据（假数据，实际应从接口获取）
const deviceList = ref([]);

onLoad(async (options) => {
  const deviceData = options.device;
  if (deviceData) {
    const data = JSON.parse(decodeURIComponent(deviceData));
    console.log(data);
    device.value = data;
    const { parentCode } = device.value;
    getDeviceList(parentCode);
  }
  treeData.value = buildingTreeStore.buildingTree;
  selectedValue.value = buildingTreeStore.selectedId;
  console.log(buildingTreeStore.value);
});

// 获取设备列表
async function getDeviceList(parentCode) {
  const res = await getSubDeviceInfo({ parentCode });
  if (res.code === 0) {
    deviceList.value = res.data || [];
  }
}

// 选中的设备ID列表
const selectedDevices = ref([]); // 默认选中第一个
const selectedDevicesItem = ref([]); // 选中的设备对象列表

// 是否全选
const isAllSelected = computed(() => {
  return deviceList.value.length > 0 && selectedDevices.value.length === deviceList.value.length;
});

// 处理页面点击事件，用于小程序环境下的点击外部检测
const handlePageTap = (e) => {
  uni.$emit('page-tap', e);
};

// 处理节点点击
const handleNodeClick = (node) => {
  console.log('node', node);
  getDeviceList(node.parentCode);
};

// 切换全选
const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedDevices.value = [];
    selectedDevicesItem.value = [];
  } else {
    selectedDevices.value = deviceList.value.map((item) => item.did);
    selectedDevicesItem.value = deviceList.value.map((item) => ({ ...item }));
  }
  console.log(selectedDevicesItem.value);
};

// 切换单个设备选择
const toggleDevice = (deviceId, item) => {
  const index = selectedDevices.value.indexOf(deviceId);
  if (index > -1) {
    selectedDevices.value.splice(index, 1);
    selectedDevicesItem.value.splice(index, 1);
  } else {
    selectedDevices.value.push(deviceId);
    selectedDevicesItem.value.push(item);
  }
  console.log(selectedDevicesItem.value);
};

// 取消
const handleCancel = () => {
  uni.navigateBack();
};

// 确认添加组网
const handleConfirm = async () => {
  if (selectedDevices.value.length === 0) {
    uni.showToast({
      title: '请至少选择一个设备',
      icon: 'none',
    });
    return;
  }

  uni.showToast({
    title: `已选择 ${selectedDevices.value.length} 个设备`,
    icon: 'success',
  });

  const { did } = device.value;
  const seq = generateRandomSeq();
  const res = await batchAddSubDevice({
    src: clientId,
    dst: did,
    ver: 'v1.0',
    seq,
    params: {
      devices: selectedDevices.value,
      duration: 120000,
    },
  });
  if (res.code === 0) {
    uni.navigateTo({
      url:
        '/pages/gateway/addGateway?device=' +
        encodeURIComponent(JSON.stringify(device.value)) +
        '&seq=' +
        seq +
        '&waitTime=' +
        res.waitTime +
        '&selectedDevices=' +
        encodeURIComponent(JSON.stringify(selectedDevicesItem.value)),
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
  padding: 30rpx;
  padding-top: calc(constant(safe-area-inset-top) + 30rpx);
  padding-top: calc(env(safe-area-inset-top) + 30rpx);
  padding-bottom: calc(constant(safe-area-inset-bottom) + 140rpx);
  padding-bottom: calc(env(safe-area-inset-bottom) + 140rpx);
}

// 网关选择器
.floor-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14rpx 32rpx;
  background: linear-gradient(90deg, #e6e6e6 0%, #f5f5f5 50%, #f3f3f3 100%);
  border-radius: 16rpx;
  margin: 30rpx 0 20rpx;
  position: relative;
}

// 设备列表容器
.device-list-container {
  flex: 1;
}

// 全选行
.select-all-row {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  margin-bottom: 20rpx;
  padding-left: 8rpx;
}

.checkbox-wrapper {
  margin-right: 22rpx;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #d0d0d0;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  transition: all 0.3s;
}

.checkbox.checked {
  background: #00a20f;
  border-color: #00a20f;
}

.check-icon {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
  line-height: 1;
}

.select-all-text {
  font-size: 30rpx;
  color: #333;
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

.m-empty {
  margin: 100rpx 0;
  height: 280rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

// 底部操作按钮
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

.cancel-btn {
  background: #fff;
  color: #666;
}

.confirm-btn {
  background: #5a4a3f;
  color: #fff;
}
</style>
