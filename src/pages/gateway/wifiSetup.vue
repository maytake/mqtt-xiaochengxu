<template>
  <view class="page">
    <view class="page-bg">
      <view class="blue-tooth-head">
        <image class="blue-tooth-img" src="/static/images/bluetooth.png" mode="aspectFit"></image>
        <view class="blue-tooth-title">蓝牙设备</view>
        <view class="blue-tooth-subtitle">请先打开手机蓝牙，进行wifi配网</view>
      </view>
      <view class="m-btn-container">
        <button class="m-btn" type="primary" :loading="searchLoad" @click="openBluetoothAdapter">
          开始搜索蓝牙设备
        </button>
        <button class="m-btn" type="primary" @click="stopBluetoothDevicesDiscovery(false)">
          停止搜索蓝牙设备
        </button>
      </view>



      <view class="list-title">已连接设备</view>
      <view class="list">
        <view v-for="item in list" :key="item.deviceId" class="list-item">
          <view class="list-item-content" @click="tapQuery(item)">
            <view class="list-item-content-item">
              <text class="list-item-text">名称：{{ item.name }}</text>
              <text class="list-item-text">设备ID：{{ item.deviceId }}</text>
            </view>
            <view class="list-item-content-item">
              <view class="list-item-text">信号强度：{{ item.RSSI }}dBm</view>
              <view class="wifi-status">{{ wifi_status }}</view>
            </view>
          </view>
          <view class="list-item-btn" @click="disconnectBLEConnection(item)">
            断开
          </view>
        </view>
        <up-empty v-if="list.length === 0" iconSize="80rpx" textColor="#999" textSize="28rpx" height="300rpx"
          text="暂无设备" />
      </view>

      <view class="list-title">未连接设备</view>
      <view class="list">
        <view v-for="item in unList" :key="item.deviceId" class="list-item" @click="unTapQuery(item)">
          <text class="list-item-text">{{ item.name }}</text>
        </view>
        <up-empty v-if="unList.length === 0" iconSize="80rpx" textColor="#999" textSize="28rpx" height="300rpx"
          text="暂无设备" />
      </view>
      <u-modal title="输入配网密码" :show="show" @confirm="handleModalConfirm" ref="uModal" @close="() => show = false"
        @cancel="() => show = false" showCancelButton closeOnClickOverlay>
        <view class="slot-content" style="width: 100%;">
          <up-form class="form-content" labelPosition="left" :model="model1" :rules="rules" ref="form1"
            labelWidth="120rpx">
            <up-form-item label="wifi名称" prop="wifi_ssid">
              <up-input placeholder="请输入wifi名称" v-model="model1.wifi_ssid"></up-input>
            </up-form-item>

            <up-form-item label="wifi密码" prop="wifi_pwd">
              <up-input placeholder="请输入wifi密码" v-model="model1.wifi_pwd"></up-input>
            </up-form-item>
          </up-form>
        </view>
      </u-modal>
    </view>
  </view>
</template>
<script setup>
import { ref, computed } from 'vue';
import { onUnload } from '@dcloudio/uni-app';
const list = ref([]);
const unList = ref([]);
const equipment = ref({});
const searchLoad = ref(false);
const wifi_status = ref('未连接');
function toast(content, showCancel = false) {
  uni.showModal({
    title: '提示',
    content,
    showCancel
  });
}
function initTypes(code, errMsg) {
  switch (code) {
    case 10000:
      toast('未初始化蓝牙适配器');
      break;
    case 10001:
      toast('未检测到蓝牙，请打开蓝牙重试！');
      break;
    case 10002:
      toast('没有找到指定设备');
      break;
    case 10003:
      toast('连接失败');
      break;
    case 10004:
      toast('没有找到指定服务');
      break;
    case 10005:
      toast('没有找到指定特征值');
      break;
    case 10006:
      toast('当前连接已断开');
      break;
    case 10007:
      toast('当前特征值不支持此操作');
      break;
    case 10008:
      toast('其余所有系统上报的异常');
      break;
    case 10009:
      toast('Android 系统特有，系统版本低于 4.3 不支持 BLE');
      break;
    default:
      toast(errMsg);
  }
}


function openBluetoothAdapter() {
  uni.openBluetoothAdapter({
    success: e => {
      getBluetoothAdapterState();
    },
    fail: e => {
      console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg));
      if (e.errCode !== 0) {
        initTypes(e.errCode, e.errMsg);
      }
    }
  });
}

function getBluetoothAdapterState() {
  uni.getBluetoothAdapterState({
    success: res => {
      const available = res?.available || false;
      if (available) {
        startBluetoothDevicesDiscovery()
      }
      console.log(JSON.stringify(res));
    },
    fail: e => {
      console.log('获取本机蓝牙适配器状态失败，错误码：' + e.errCode);
      if (e.errCode !== 0) {
        initTypes(e.errCode);
      }
    }
  });
}


function ab2hex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2);
    }
  );
  return hexArr.join('').toUpperCase();
}

function startBluetoothDevicesDiscovery() {
  searchLoad.value = true;
  uni.startBluetoothDevicesDiscovery({
    success: e => {
      console.log('开始搜索蓝牙设备:' + e.errMsg);
      uni.onBluetoothDeviceFound(res => {
        getBluetoothDevices();
        res.devices.forEach(device => {
          console.log('发现设备:', device);

          const hex = ab2hex(device.advertisData);
          console.log('广播数据(Hex):', hex);



        });
      });
    },
    fail: e => {
      console.log('搜索蓝牙设备失败，错误码：' + e.errCode);
      initTypes(e.errCode);
    }
  });
}

function getBluetoothDevices() {
  uni.getBluetoothDevices({
    success: res => {
      console.log(res.devices);

      unList.value = res.devices.filter(i => !list.value.some(j => j.deviceId === i.deviceId));
    },
    fail: e => {
      console.log('获取蓝牙设备错误，错误码：' + e.errCode);
      if (e.errCode !== 0) {
        initTypes(e.errCode);
      }
    }
  });
}

function stopBluetoothDevicesDiscovery(types) {
  uni.stopBluetoothDevicesDiscovery({
    success: e => {
      searchLoad.value = false;
      console.log('停止搜索蓝牙设备:' + e.errMsg);
    },
    fail: e => {
      console.log('停止搜索蓝牙设备失败，错误码：' + e.errCode);
      if (e.errCode !== 0) {
        initTypes(e.errCode);
      }
    }
  });
}

function disconnectBLEConnection(item) {
  let deviceId = item.deviceId
  uni.closeBLEConnection({
    deviceId,
    success: res => {
      wifi_status.value = '未连接';
      uni.showToast({
        title: '断开成功',
        icon: 'success',
        duration: 2000
      });
      list.value = list.value.filter(i => i.deviceId !== deviceId);
    },
    fail: e => {
      if (e.errCode !== 0) {
        initTypes(e.errCode);
      }
    }
  });
}

function createBLEConnection(item) {
  let deviceId = item.deviceId || equipment.value?.deviceId;
  uni.showToast({
    title: '连接蓝牙...',
    icon: 'loading',
    duration: 99999
  });


  uni.createBLEConnection({

    deviceId,
    mtu: 512,
    success: res => {
      console.log('连接蓝牙成功:');
      console.log(res);

      stopBluetoothDevicesDiscovery();
      uni.hideToast();
      uni.showToast({
        title: '连接成功',
        icon: 'success',
        duration: 2000
      });
      unList.value = unList.value.filter(i => i.deviceId !== deviceId);
      list.value.push(item);
    },
    fail: e => {
      uni.hideToast();
      console.log('连接低功耗蓝牙失败，错误码：' + e.errCode);
      if (e.errCode !== 0) {
        initTypes(e.errCode);
      }
    }
  });
}
let timer = null;
function unTapQuery(item) {
  console.log(item);
  equipment.value = item;
  createBLEConnection(item);
}
const show = ref(false);
const model1 = ref({
  wifi_ssid: '',
  wifi_pwd: '',
});
const rules = ref({
  wifi_ssid: [{ required: true, message: '请输入wifi名称', trigger: 'blur' }],
  wifi_pwd: [{ required: true, message: '请输入wifi密码', trigger: 'blur' }],
});
const form1 = ref(null);

async function handleModalConfirm() {
  const valid = await form1.value.validate();
  if (!valid) return;
  console.log('handleModalConfirm', model1.value.wifi_ssid, model1.value.wifi_pwd);
  getBLEDeviceServices(equipment.value.deviceId);
  show.value = false;
}


let targetWriteCharacteristicId = '';
let targetReadCharacteristicId = '';
let readTimer = null;
let waitNetRetryCount = 0;
const maxNetRetries = 20;

function arrayBufferToString(buffer) {
  const view = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < view.length; i++) {
    str += String.fromCharCode(view[i]);
  }
  return str;
}


function startPolling(serviceId) {
  wifi_status.value = '联网中...';
  stopPolling();
  waitNetRetryCount = 0;
  readTimer = setInterval(() => {
    waitNetRetryCount++;
    if (waitNetRetryCount > maxNetRetries) {
      wifi_status.value = '联网超时';
      stopPolling();
      uni.showToast({
        title: '联网超时，请检查wifi或密码',
        icon: 'error',
        duration: 2000
      });
      return;
    }
    uni.readBLECharacteristicValue({
      deviceId: equipment.value.deviceId,
      serviceId: serviceId,
      characteristicId: targetReadCharacteristicId,
      success: (res) => {
        console.log('发起读取设备联网状态成功');
        console.log(res);
      },
      fail: (err) => {
        console.error('读取设备联网状态失败', err);
      }
    });
  }, 3000);
}

function stopPolling() {
  if (readTimer) {
    clearInterval(readTimer);
    readTimer = null;
  }
}


uni.onBLECharacteristicValueChange((res) => {
  const str = arrayBufferToString(res.value);
  console.log('读取到设备返回数据:', str);
  try {
    const data = JSON.parse(str);
    if (Array.isArray(data.params)) {
      const netRes = data.params.find(p => p.type === 100);
      if (netRes) {
        if (netRes.type) {
          wifi_status.value = '已联网';
          uni.showToast({
            title: '设备已联网',
            icon: 'success',
            duration: 2000
          });
          stopPolling();
        } else if (netRes.online === 0) {
          wifi_status.value = '未联网';
        }
      }
    }
  } catch (e) {
    console.error('解析设备返回数据失败', e);
  }
});


function getBLEDeviceServices(deviceId) {
  uni.getBLEDeviceServices({
    deviceId,
    success: servicesRes => {
      console.log('获取设备服务成功', servicesRes);
      const service = servicesRes.services[0];

      if (service) {
        targetServiceId = service.uuid;
        getBLEDeviceCharacteristics(deviceId, targetServiceId)
        console.log('找到目标服务:', targetServiceId);
      }
    },
    fail(err) {
      uni.showToast({
        title: '获取设备服务失败',
        icon: 'error',
        duration: 2000
      });
      console.error('获取设备服务失败', err);
    }
  });

}


function getBLEDeviceCharacteristics(deviceId, targetServiceId) {
  uni.getBLEDeviceCharacteristics({
    deviceId: deviceId,
    serviceId: targetServiceId,
    success: (charsRes) => {
      console.log('获取特征值成功，特征值列表:', charsRes.characteristics);

      const writeChar = charsRes.characteristics.find(c => c.properties.write);
      const readChar = charsRes.characteristics.find(c => c.properties.read);

      if (writeChar) {
        targetWriteCharacteristicId = writeChar.uuid;
        console.log('找到写特征值:', targetWriteCharacteristicId);
      }
      if (readChar) {
        targetReadCharacteristicId = readChar.uuid;
        console.log('找到读特征值:', targetReadCharacteristicId);
      }

      if (!writeChar || !readChar) {
        uni.showToast({
          title: '未找到完整的读写特征值',
          icon: 'error',
          duration: 2000
        });
        return;
      }

      sendDataToDevice(targetServiceId, targetWriteCharacteristicId)

    },
    fail: (err) => {
      console.error('获取特征值失败:', err);
    }
  });
}


function sendDataToDevice(uuid, targetCharacteristicId) {
  const wifi_ssid = model1.value.wifi_ssid
  const wifi_pwd = model1.value.wifi_pwd
  let netConfig = {
    "params": [
      {
        "type": 101,
        "wifi_ssid": wifi_ssid,
        "wifi_pwd": wifi_pwd
      },
      {
        "type": 100,
        "ping_ip": "www.baidu.com"
      }
    ]
  };

  const jsonString = JSON.stringify(netConfig);

  function stringToArrayBuffer(str) {
    const buffer = new ArrayBuffer(str.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
      view[i] = str.charCodeAt(i);
    }
    return buffer;
  }
  const arrayBuffer = stringToArrayBuffer(jsonString);


  uni.writeBLECharacteristicValue({
    deviceId: equipment.value.deviceId,
    serviceId: uuid,
    characteristicId: targetCharacteristicId,
    value: arrayBuffer,
    success(res) {
      console.log('配网指令发送成功', res);
      startPolling(uuid);
    },
    fail(err) {
      uni.showToast({
        title: '配网失败',
        icon: 'error',
        duration: 2000
      });
      console.error('发送失败', err);
    }
  });
}

function tapQuery(item) {
  console.log(item);

  form1.value.clearValidate();

  form1.value.resetFields();
  show.value = true;
}


onUnload(() => {
  stopPolling();
  uni.closeBluetoothAdapter();
})


</script>
<style scoped>
.m-btn-container {
  margin: 100rpx 0 50rpx;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 10rpx;
}

.m-btn {
  font-size: 32rpx;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.list-title {
  font-size: 30rpx;
  color: #333;
  margin: 30rpx 10rpx 10rpx;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx;
  background: #ccc;
  border-bottom: 1px solid #333;
}

.list-item-content {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.list-item-content-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.list-item-content-item:first-child {
  flex: 1;
}

.list-item-text {
  font-size: 30rpx;
  color: #333;
}

.list-item-btn {
  background: #804a3d;
  padding: 5rpx 10rpx;
  border-radius: 10rpx;
  color: #fff;
  font-size: 24rpx;
}

.form-content :deep(.u-input) {
  border: 1px solid #d6d7d9 !important;
}

.blue-tooth-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding-top: 100rpx;
}

.wifi-status {
  margin-right: 20rpx;
  font-size: 24rpx;
  color: #2523c4;
}

.blue-tooth-img {
  width: 100rpx;
  height: 100rpx;
}
</style>