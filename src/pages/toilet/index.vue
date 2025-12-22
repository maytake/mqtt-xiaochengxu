<template>
  <view class="page">
    <view class="page-bg">
      <!-- 设置按钮 -->
      <view class="settings-btn">
        <text class="settings-text" @click="goToSetting">设置</text>
      </view>

      <!-- 设备信息卡片 -->
      <view class="card product-card">
        <view class="product-header">
          <view>
            <view class="productName">五号楼一层厕所01</view>
            <view class="productModel">
              型号：
              <text>U101</text>
            </view>
          </view>
        </view>
        <view class="product-hero">
          <image
            class="product-img"
            lazy-load
            src="https://smart.tck.com.cn/itemDevice-api/images_product/matong.png"
            mode="aspectFit"></image>
        </view>
        <view class="product-footer">
          <view class="status-item">
            <text class="font_family icon">&#xe61b;</text>
            <text>
              状态：
              <text :class="status === 1 ? 'status-online' : 'status-offline'">
                {{ statusName }}
              </text>
            </text>
          </view>
        </view>
      </view>

      <!-- 基础控制宫格 -->
      <view class="card basic-controls">
        <view class="control-grid">
          <view
            v-for="(item, index) in basicControls"
            :key="index"
            class="control-item"
            :class="{ active: item.active }"
            @click="handleBasicControl(item, index)">
            <text class="font_family control-icon" :class="item.icon"></text>
            <text class="control-text">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- 开关座圈模块 -->
      <view v-if="showSeatRingModule" class="card feminine-wash-card">
        <view class="feminine-wash-header">
          <text class="feminine-wash-title">开关座圈</text>
        </view>
        <view class="feminine-wash-temps">
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe622;</text>
            <view class="temp-content">
              <text class="temp-value">30℃</text>
              <text class="temp-label">水温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe625;</text>
            <view class="temp-content">
              <text class="temp-value">30℃</text>
              <text class="temp-label">风温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe61c;</text>
            <view class="temp-content">
              <text class="temp-value">30℃</text>
              <text class="temp-label">座温</text>
            </view>
          </view>
        </view>
        <view class="feminine-wash-divider"></view>
        <view class="feminine-wash-modes">
          <view
            class="mode-btn"
            :class="{ active: seatRingMode.includes('seatCover') }"
            @click="setSeatRingMode('seatCover')">
            <text>打开座盖</text>
          </view>
          <view class="mode-btn disabled">
            <text></text>
          </view>
          <view
            class="mode-btn"
            :class="{ active: seatRingMode.includes('seatRing') }"
            @click="setSeatRingMode('seatRing')">
            <text>打开座圈</text>
          </view>
        </view>
      </view>

      <!-- 臀洗模块 -->
      <view v-if="showHipWashModule" class="card feminine-wash-card">
        <view class="feminine-wash-header">
          <text class="feminine-wash-title">臀洗</text>
        </view>
        <view class="feminine-wash-temps">
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe622;</text>
            <view class="temp-content">
              <text class="temp-value">{{ hipWashWaterTemp }}℃</text>
              <text class="temp-label">水温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe625;</text>
            <view class="temp-content">
              <text class="temp-value">{{ hipWashWindTemp }}℃</text>
              <text class="temp-label">风温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe61c;</text>
            <view class="temp-content">
              <text class="temp-value">{{ hipWashSeatTemp }}℃</text>
              <text class="temp-label">座温</text>
            </view>
          </view>
        </view>
        <view class="feminine-wash-divider"></view>
        <view class="feminine-wash-modes">
          <view
            class="mode-btn"
            :class="{ active: hipWashMode.includes('reciprocating') }"
            @click="setHipWashMode('reciprocating')">
            <text>往复清洗</text>
          </view>
          <view class="mode-btn" :class="{ active: hipWashMode.includes('bubble') }" @click="setHipWashMode('bubble')">
            <text>气泡按摩</text>
          </view>
          <view class="mode-btn" :class="{ active: hipWashMode.includes('pulse') }" @click="setHipWashMode('pulse')">
            <text>脉冲按摩</text>
          </view>
        </view>
      </view>

      <!-- 妇洗模块 -->
      <view v-if="showFeminineWashModule" class="card feminine-wash-card">
        <view class="feminine-wash-header">
          <text class="feminine-wash-title">妇洗</text>
        </view>
        <view class="feminine-wash-temps">
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe622;</text>
            <view class="temp-content">
              <text class="temp-value">{{ feminineWashWaterTemp }}℃</text>
              <text class="temp-label">水温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe625;</text>
            <view class="temp-content">
              <text class="temp-value">{{ feminineWashWindTemp }}℃</text>
              <text class="temp-label">风温</text>
            </view>
          </view>
          <view class="temp-setting">
            <text class="font_family temp-icon">&#xe61c;</text>
            <view class="temp-content">
              <text class="temp-value">{{ feminineWashSeatTemp }}℃</text>
              <text class="temp-label">座温</text>
            </view>
          </view>
        </view>
        <view class="feminine-wash-divider"></view>
        <view class="feminine-wash-modes">
          <view
            class="mode-btn"
            :class="{ active: feminineWashMode.includes('reciprocating') }"
            @click="setFeminineWashMode('reciprocating')">
            <text>往复清洗</text>
          </view>
          <view
            class="mode-btn"
            :class="{ active: feminineWashMode.includes('bubble') }"
            @click="setFeminineWashMode('bubble')">
            <text>气泡按摩</text>
          </view>
          <view
            class="mode-btn"
            :class="{ active: feminineWashMode.includes('pulse') }"
            @click="setFeminineWashMode('pulse')">
            <text>脉冲按摩</text>
          </view>
        </view>
      </view>

      <!-- 夜灯模块 -->
      <view v-if="showNightLightModule" class="card night-light-card">
        <view class="night-light-header">
          <text class="night-light-title">夜灯</text>
        </view>
        <view class="night-light-content">
          <view class="night-light">
            <text v-if="nightLightOn" class="font_family night-light-icon light-on">&#xe637;</text>
            <text v-else class="font_family night-light-icon icon-off">&#xe61e;</text>
          </view>
          <view class="night-light-divider"></view>
          <view class="night-light-switch" :class="{ active: nightLightOn }" @click="toggleNightLight">
            <view class="switch-thumb"></view>
          </view>
        </view>
      </view>

      <!-- 水温控制模块 -->
      <view v-if="showWaterTempModule" class="card water-temp-card">
        <view class="temp-header">
          <text class="temp-title">水温</text>
        </view>
        <view class="temp-content">
          <view class="temp-display">
            <text class="temp-value">{{ LEVEL_LABELS[waterTemp] }}</text>
          </view>
          <view class="temp-controls">
            <view class="temp-btn" @click="decreaseTemp">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="temp-btn" @click="increaseTemp">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>
      <!-- 风温模块 -->
      <view v-if="showWindTempModule" class="card wind-temp-card">
        <view class="temp-header">
          <text class="temp-title">风温</text>
        </view>
        <view class="temp-content">
          <view class="temp-display">
            <text class="temp-value">{{ LEVEL_LABELS[windTemp] }}</text>
          </view>
          <view class="temp-controls">
            <view class="temp-btn" @click="decreaseWindTemp">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="temp-btn" @click="increaseWindTemp">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 坐温模块 -->
      <view v-if="showSeatTempModule" class="card seat-temp-card">
        <view class="temp-header">
          <text class="temp-title">坐温</text>
        </view>
        <view class="temp-content">
          <view class="temp-display">
            <text class="temp-value">{{ LEVEL_LABELS[seatTemp] }}</text>
          </view>
          <view class="temp-controls">
            <view class="temp-btn" @click="decreaseSeatTemp">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="temp-btn" @click="increaseSeatTemp">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 位置调节模块 -->
      <view v-if="showPositionModule" class="card position-card">
        <view class="position-header">
          <text class="position-title">位置调节</text>
        </view>
        <view class="position-content">
          <view class="position-display">
            <text class="position-value">{{ LEVEL_LABELS[positionLevel] }}</text>
          </view>
          <view class="position-controls">
            <view class="position-btn" @click="decreasePosition">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="position-btn" @click="increasePosition">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 水量调节模块 -->
      <view v-if="showWaterAmountModule" class="card water-amount-card">
        <view class="position-header">
          <text class="position-title">水量调节</text>
        </view>
        <view class="position-content">
          <view class="position-display">
            <text class="position-value">{{ LEVEL_LABELS[waterAmountLevel] }}</text>
          </view>
          <view class="position-controls">
            <view class="position-btn" @click="decreaseWaterAmount">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="position-btn" @click="increaseWaterAmount">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 高级控制宫格 -->
      <view class="card advanced-controls">
        <view class="control-grid">
          <view
            v-for="(item, index) in advancedControls"
            :key="index"
            class="control-item"
            :class="{ active: item.active }"
            @click="handleAdvancedControl(item, index)">
            <text class="font_family control-icon" :class="item.icon"></text>
            <text class="control-text">{{ item.name }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { useStore } from '@/stores/globalMqttInfo';
import { getProductModelDetails, ctrlDevice, readDevicePidVal, writeDevicePid } from '@/api/mqttCommon';
import { generateRandomSeq } from '@/utils/common';
import { isEqual } from 'lodash';
const mqttClient = getApp().globalData.mqttService;
// ==================== 常量配置 ====================
const DEVICE_STATUS = ['离线', '在线', '故障'];
// ==================== 工具函数 ====================
const mqttUserInfo = uni.getStorageSync('mqttUserInfo');
const clientId = mqttUserInfo?.clientId || '';
// 设备相关
const device = ref('');
const status = ref('0');
const statusName = ref('离线');
const productModelDetails = ref({});

const DEVICE_CONFIG = {
  dst: '011025092402002F',
  did: '0111250924030004',
  dirDid: '011025092402002F',
};

// 基础控制数据
const basicControls = ref([
  { name: '停止', active: false, icon: 'icon-a-ziyuan31' },
  { name: '烘干', active: false, icon: 'icon-a-ziyuan25' },
  { name: '冲洗', active: false, icon: 'icon-a-ziyuan35' },
  { name: '小冲', active: false, icon: 'icon-a-ziyuan34' },
  { name: '喷杆自动清洁', active: false, icon: 'icon-a-ziyuan45' },
  { name: '喷杆手动清洁', active: false, icon: 'icon-a-ziyuan42' },
]);

// 高级控制数据
const advancedControls = ref([
  { name: '开关座圈', active: false, icon: 'icon-a-ziyuan33' },
  { name: '臀洗', active: false, icon: 'icon-a-ziyuan32' },
  { name: '妇洗', active: false, icon: 'icon-a-ziyuan26' },
  { name: '夜灯', active: false, icon: 'icon-a-ziyuan36' },
  { name: '水温', active: false, icon: 'icon-a-ziyuan39' },
  { name: '风温', active: false, icon: 'icon-a-ziyuan38' },
  { name: '座温', active: false, icon: 'icon-a-ziyuan37' },
  { name: '位置调节', active: false, icon: 'icon-a-ziyuan41' },
  { name: '水量调节', active: false, icon: 'icon-a-ziyuan40' },
]);

// 模块显示状态
const showWaterTempModule = ref(false);
const showPositionModule = ref(false);
const showNightLightModule = ref(false);
const showFeminineWashModule = ref(false);
const showHipWashModule = ref(false);
const showSeatRingModule = ref(false);
const showWindTempModule = ref(false);
const showSeatTempModule = ref(false);
const showWaterAmountModule = ref(false);

// 档位通用显示（1档 ~ 5档）
const LEVEL_LABELS = ['1档', '2档', '3档', '4档', '5档'];

// 位置调节
const positionLevel = ref(1);

// 夜灯状态
const nightLightOn = ref(false);

// 妇洗设置
const feminineWashWaterTemp = ref(30);
const feminineWashWindTemp = ref(30);
const feminineWashSeatTemp = ref(30);
const feminineWashMode = ref([]); // 改为数组，支持多选

// 臀洗设置
const hipWashWaterTemp = ref(30);
const hipWashWindTemp = ref(30);
const hipWashSeatTemp = ref(30);
const hipWashMode = ref([]);

// 开关座圈设置
const seatRingMode = ref(['seatCover']);

// 水温设置（1~5档）
const waterTemp = ref(0);

// 风温设置（1~5档）
const windTemp = ref(0);

// 坐温设置（1~5档）
const seatTemp = ref(0);

// 水量调节
const waterAmountLevel = ref(1);
// ==================== 开始请求接口 ====================
// 打开座盖:43
// 打开座圈:44
// 臀洗:41
// 妇洗:42
// 夜灯:48
// 水温:45
// 风温:46
// 座温:47
// 位置调节:49
// 水量调节:50

const PID_CONFIG = {
  SEAT_COVER: '43',
  SEAT_RING: '44',
  HIP_WASH: '41',
  FEMININE_WASH: '42',
  NIGHT_LIGHT: '48',
  WATER_TEMP: '45',
  WIND_TEMP: '46',
  SEAT_TEMP: '47',
  POSITION_ADJUSTMENT: '49',
  WATER_AMOUNT_ADJUSTMENT: '50',
};

onLoad(async (options) => {
  initDeviceData(options);
  loadProductModelDetails();
  readDevicePidValues();
});
// ==================== 设备数据处理 ====================
// 页面级主题消息处理函数
let handleReportTopicResponse = null;
let reportTopic = '';

const initDeviceData = (options) => {
  const deviceData = options.device;
  if (deviceData) {
    const data = JSON.parse(decodeURIComponent(deviceData));
    device.value = data;
    status.value = data.deviceStatus;
    statusName.value = DEVICE_STATUS[status.value];
    DEVICE_CONFIG.did = data.did;
    DEVICE_CONFIG.dst = data.dirDid;
    DEVICE_CONFIG.dirDid = data.dirDid;
    // 阶段2：订阅并仅监听一次设备报告主题
    reportTopic = `olt/report/pid/${DEVICE_CONFIG.did}`;
    mqttClient.registerPageTopicHandler(reportTopic, handleReportTopicResponse);
  }
};

// 页面级主题消息处理变量
handleReportTopicResponse = (messageData, topic) => {
  console.log('pageMessage', messageData);
  if (messageData?.topic === reportTopic) {
    const pids = messageData?.params?.properties?.pids || [];
    handleDevicePidResponse(pids);
  }
};

handleReportTopicResponse();

// 创建控制功能请求参数
const createControlParams = (params) => ({
  dst: DEVICE_CONFIG.dst,
  seq: generateRandomSeq(),
  src: clientId,
  ver: 'V1.0',
  params: params,
});

// 创建设备请求参数
const createDeviceParams = (params) => ({
  dst: DEVICE_CONFIG.dst,
  seq: generateRandomSeq(),
  src: clientId,
  ver: 'V1.0',
  params: {
    did: DEVICE_CONFIG.did,
    dirDid: DEVICE_CONFIG.dirDid,
    ...params,
  },
});

const pidStatusMap = reactive({});

// 读取设备PID值
async function readDevicePidValues() {
  try {
    const params = createDeviceParams({
      pids: [
        { pid: PID_CONFIG.SEAT_COVER, sid: 0 },
        { pid: PID_CONFIG.SEAT_RING, sid: 0 },
        { pid: PID_CONFIG.WATER_TEMP, sid: 0 },
        { pid: PID_CONFIG.WIND_TEMP, sid: 0 },
        { pid: PID_CONFIG.SEAT_TEMP, sid: 0 },
        { pid: PID_CONFIG.POSITION_ADJUSTMENT, sid: 0 },
        { pid: PID_CONFIG.WATER_AMOUNT_ADJUSTMENT, sid: 0 },
        { pid: PID_CONFIG.NIGHT_LIGHT, sid: 0 },
        { pid: PID_CONFIG.HIP_WASH, sid: 0 },
        { pid: PID_CONFIG.FEMININE_WASH, sid: 0 },
      ],
    });

    const res = await readDevicePidVal(params);
    const { pids = [] } = res.data || {};
    handleDevicePidResponse(pids);
  } catch (error) {
    console.error('读取设备PID值失败:', error);
  }
}

// 高亮显示臀洗妇洗按钮的状态
function highlightWashButton(type, val) {
  const reciprocating = (val & 2) >> 1; // 往复清洗
  const massageMode = (val & 28) >> 2; // 按摩模式
  let newData = [];
  if (reciprocating === 1) {
    // 打开往复清洗
    newData.push('reciprocating');
  } else {
    // 关闭往复清洗
    newData = newData.filter((m) => m !== 'reciprocating');
  }
  if (massageMode === 1) {
    // 打开气泡按摩
    newData.push('bubble');
  } else {
    // 关闭气泡按摩
    newData = newData.filter((m) => m !== 'bubble');
  }
  if (massageMode === 2) {
    // 打开脉冲按摩
    newData.push('pulse');
  } else {
    // 关闭脉冲按摩
    newData = newData.filter((m) => m !== 'pulse');
  }
  if (type === 'feminine') {
    feminineWashMode.value = newData;
  }
  if (type === 'hip') {
    hipWashMode.value = newData;
  }
}

// 写入设备PID值
const writeDevicePidValue = async (pids) => {
  if (!Array.isArray(pids)) return;
  try {
    const params = createDeviceParams({
      pids,
      sid: 0,
    });
    const res = await writeDevicePid(params);
    feedbackResult(res);
    return res;
  } catch (error) {
    throw error;
  }
};

// 控制设备功能
async function ctrFn(fid, val) {
  const params = createControlParams({
    did: DEVICE_CONFIG.did,
    sid: 0,
    fid,
    val,
  });
  const res = await ctrlDevice(params);
  feedbackResult(res);
}

// 反馈结果
function feedbackResult(res) {
  if (res.code === 0) {
    uni.showToast({ icon: 'success', title: '操作成功', duration: 500 });
  } else {
    uni.showToast({ icon: 'error', title: '操作失败', duration: 500 });
  }
}

// 处理设备PID响应
function handleDevicePidResponse(pids) {
  seatRingMode.value = [];
  pids.forEach((item) => {
    const pidKey = String(item.pid);
    if (pidKey === PID_CONFIG.SEAT_COVER) {
      if (item.val == 1) {
        // 打开座圈
        seatRingMode.value.push('seatCover');
      } else {
        // 关闭座圈
        seatRingMode.value = seatRingMode.value.filter((m) => m !== 'seatCover');
      }
    }
    if (pidKey === PID_CONFIG.SEAT_RING) {
      if (item.val == 1) {
        // 打开座圈
        seatRingMode.value.push('seatRing');
      } else {
        // 关闭座圈
        seatRingMode.value = seatRingMode.value.filter((m) => m !== 'seatRing');
      }
    }
    if (pidKey === PID_CONFIG.WATER_TEMP) {
      waterTemp.value = item.val;
    }
    if (pidKey === PID_CONFIG.WIND_TEMP) {
      windTemp.value = item.val;
    }
    if (pidKey === PID_CONFIG.SEAT_TEMP) {
      seatTemp.value = item.val;
    }
    if (pidKey === PID_CONFIG.POSITION_ADJUSTMENT) {
      positionLevel.value = item.val;
    }
    if (pidKey === PID_CONFIG.WATER_AMOUNT_ADJUSTMENT) {
      waterAmountLevel.value = item.val;
    }
    if (pidKey === PID_CONFIG.NIGHT_LIGHT) {
      nightLightOn.value = item.val == 1;
    }
    if (pidKey === PID_CONFIG.HIP_WASH) {
      highlightWashButton('hip', item.val);
    }
    if (pidKey === PID_CONFIG.FEMININE_WASH) {
      highlightWashButton('feminine', item.val);
    }
  });
}

// 处理基础控制点击
const handleBasicControl = (item, index) => {
  console.log(item, index);
  // 重置其他按钮的选中状态
  advancedControls.value.forEach((control, i) => {
    control.active = false;
  });
  // 先隐藏所有模块
  hideOtherModules();
  // 显示选中状态500毫秒
  item.active = true;
  setTimeout(() => {
    item.active = false;
  }, 500);

  handleBasicControlEvent(item.name);
};

// 分别处理不同的基础事件
// 0：停止
// 1：烘干
// 2：冲洗
// 3：小冲
// 4：喷杆自动清洁
// 5：喷杆手动清洁

const handleBasicControlEvent = async (event) => {
  console.log(event);
  let params = null;
  if (event === '停止') {
    params = createControlParams({
      did: DEVICE_CONFIG.did,
      sid: 0,
      fid: 4100,
      val: 0,
    });
  } else if (event === '烘干') {
    params = createControlParams({
      did: DEVICE_CONFIG.did,
      sid: 0,
      fid: 4100,
      val: 1,
    });
  } else if (event === '冲洗') {
    params = createControlParams({
      did: DEVICE_CONFIG.did,
      sid: 0,
      fid: 4100,
      val: 2,
    });
  } else if (event === '小冲') {
    params = createControlParams({
      did: DEVICE_CONFIG.did,
      sid: 0,
      fid: 4100,
      val: 3,
    });
  } else if (event === '喷杆自动清洁') {
    params = createControlParams({
      did: DEVICE_CONFIG.did,
      sid: 0,
      fid: 4100,
      val: 4,
    });
  } else if (event === '喷杆手动清洁') {
    params = createControlParams({
      did: DEVICE_CONFIG.did,
      sid: 0,
      fid: 4100,
      val: 5,
    });
  }
  const res = await ctrlDevice(params);
  feedbackResult(res);
};

// ==================== 产品信息 ====================
async function loadProductModelDetails() {
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
}

// 隐藏其他模块
const hideOtherModules = () => {
  showWaterTempModule.value = false;
  showPositionModule.value = false;
  showNightLightModule.value = false;
  showFeminineWashModule.value = false;
  showHipWashModule.value = false;
  showSeatRingModule.value = false;
  showWindTempModule.value = false;
  showSeatTempModule.value = false;
  showWaterAmountModule.value = false;
};

// 处理高级控制点击
const handleAdvancedControl = (item, index) => {
  // 重置其他按钮的选中状态
  advancedControls.value.forEach((control, i) => {
    if (i !== index) {
      control.active = false;
    }
  });

  // 切换当前按钮状态
  item.active = !item.active;

  // 先隐藏所有模块
  hideOtherModules();

  // 根据功能显示对应模块
  if (item.name === '水温' && item.active) {
    showWaterTempModule.value = true;
  } else if (item.name === '位置调节' && item.active) {
    showPositionModule.value = true;
  } else if (item.name === '夜灯' && item.active) {
    showNightLightModule.value = true;
  } else if (item.name === '妇洗' && item.active) {
    showFeminineWashModule.value = true;
    // 二进制转十进制，控制设备PID值
    clickWashControl(feminineWashMode.value, 'feminine');
  } else if (item.name === '臀洗' && item.active) {
    showHipWashModule.value = true;
    // 二进制转十进制控制设备PID值
    clickWashControl(hipWashMode.value, 'hip');
    showHipWashModule.value = true;
  } else if (item.name === '开关座圈' && item.active) {
    showSeatRingModule.value = true;
  } else if (item.name === '风温' && item.active) {
    showWindTempModule.value = true;
  } else if (item.name === '座温' && item.active) {
    showSeatTempModule.value = true;
  } else if (item.name === '水量调节' && item.active) {
    showWaterAmountModule.value = true;
  }
};

// 夜灯控制
const toggleNightLight = () => {
  nightLightOn.value = !nightLightOn.value;
  ctrFn(4108, nightLightOn.value ? 1 : 0);
};

// 开关座圈模式设置
const setSeatRingMode = async (mode) => {
  const currentModes = seatRingMode.value;
  let newModes = [...currentModes];

  if (currentModes.includes(mode)) {
    newModes = currentModes.filter((m) => m !== mode);
  } else {
    newModes = [...currentModes, mode];
  }

  seatRingMode.value = newModes;
  // 打开关闭座盖
  if (mode === 'seatCover') {
    if (seatRingMode.value.includes('seatCover')) {
      ctrFn(4103, 1); // 打开座盖
    } else {
      ctrFn(4103, 0); // 关闭座盖
    }
  }
  // 打开关闭座圈
  if (mode === 'seatRing') {
    if (seatRingMode.value.includes('seatRing')) {
      ctrFn(4104, 1); // 打开座圈
    } else {
      ctrFn(4104, 0); // 关闭座圈
    }
  }
};

// 臀洗模式设置
const setHipWashMode = (mode) => {
  const currentModes = hipWashMode.value;
  let newModes = [...currentModes];

  if (mode === 'reciprocating') {
    if (currentModes.includes('reciprocating')) {
      newModes = currentModes.filter((m) => m !== 'reciprocating');
    } else {
      newModes = [...currentModes, 'reciprocating'];
    }
  } else {
    const massageModes = ['bubble', 'pulse'];
    if (currentModes.includes(mode)) {
      // 取反操作
      newModes = currentModes.filter((m) => m !== mode);
    } else {
      // 如果有包含 'reciprocating'，把 'reciprocating'，加进newModes中
      newModes = currentModes.filter((m) => !massageModes.includes(m));
      newModes.push(mode);
    }
  }

  hipWashMode.value = newModes;
  // 控制设备PID值
  clickWashControl(hipWashMode.value, 'hip');
};

// 点击臀洗或者妇洗，根据往复清洗、气泡按摩、脉冲按摩的状态，用8进制转成10进制，组合pid值
// BIT0：臀洗或者妇洗开关 [0:关闭,1:打开]
// BIT1：往复清洗 [0:关闭,1:打开]
// BIT2-4：按摩模式 [0:关闭1:气泡按摩,2:脉冲按摩]
const clickWashControl = (currentModes = [], type) => {
  let pids = 1; // 打开妇洗
  if (currentModes.includes('reciprocating')) {
    pids += 2; // 打开往复清洗
  }
  if (currentModes.includes('bubble')) {
    pids += 4; // 打开气泡按摩
  }
  if (currentModes.includes('pulse')) {
    pids += 8; // 打开脉冲按摩
  }
  if (type === 'hip') {
    ctrFn(4101, pids);
  } else {
    ctrFn(4102, pids);
  }
};

// 妇洗模式设置
const setFeminineWashMode = (mode) => {
  const currentModes = feminineWashMode.value;
  let newModes = [...currentModes];

  if (mode === 'reciprocating') {
    // 往复清洗：可以与其他模式同时选择，点击切换
    if (currentModes.includes('reciprocating')) {
      newModes = currentModes.filter((m) => m !== 'reciprocating');
    } else {
      newModes = [...currentModes, 'reciprocating'];
    }
  } else {
    // 气泡按摩和脉冲按摩：互斥选择
    const massageModes = ['bubble', 'pulse'];

    if (currentModes.includes(mode)) {
      // 当前模式已选择，取消选择
      newModes = currentModes.filter((m) => m !== mode);
    } else {
      // 选择当前模式，取消其他按摩模式，保留往复清洗
      newModes = currentModes.filter((m) => !massageModes.includes(m));
      newModes.push(mode);
    }
  }

  feminineWashMode.value = newModes;
  // 控制设备PID值
  clickWashControl(feminineWashMode.value, 'feminine');
};

// 水温调节（1~5档）
const increaseTemp = () => {
  if (waterTemp.value < 4) {
    waterTemp.value++;
    ctrFn(4105, waterTemp.value);
  }
};

const decreaseTemp = () => {
  if (waterTemp.value > 0) {
    waterTemp.value--;
    ctrFn(4105, waterTemp.value);
  }
};

// 风温调节（1~5档）
const increaseWindTemp = () => {
  if (windTemp.value < 4) {
    windTemp.value++;
    ctrFn(4106, windTemp.value);
  }
};

const decreaseWindTemp = () => {
  if (windTemp.value > 0) {
    windTemp.value--;
    ctrFn(4106, windTemp.value);
  }
};

// 坐温调节（1~5档）
const increaseSeatTemp = () => {
  if (seatTemp.value < 4) {
    seatTemp.value++;
    ctrFn(4107, seatTemp.value);
  }
};

const decreaseSeatTemp = () => {
  if (seatTemp.value > 0) {
    seatTemp.value--;
    ctrFn(4107, seatTemp.value);
  }
};

// 位置调节
const increasePosition = () => {
  if (positionLevel.value < 4) {
    positionLevel.value++;
    ctrFn(4109, positionLevel.value);
  }
};

const decreasePosition = () => {
  if (positionLevel.value > 0) {
    positionLevel.value--;
    ctrFn(4109, positionLevel.value);
  }
};

// 水量调节
const increaseWaterAmount = () => {
  if (waterAmountLevel.value < 4) {
    waterAmountLevel.value++;
    ctrFn(4110, waterAmountLevel.value);
  }
};

const decreaseWaterAmount = () => {
  if (waterAmountLevel.value > 0) {
    waterAmountLevel.value--;
    ctrFn(4110, waterAmountLevel.value);
  }
};

const goToSetting = () => {
  uni.navigateTo({
    url: '/pages/toilet/toiletSetting?device=' + encodeURIComponent(JSON.stringify(device.value)),
  });
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

.settings-btn {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20rpx;
}

.settings-text {
  background: linear-gradient(-90deg, #efefef 0%, #fff 100%);
  border-radius: 30rpx;
  padding: 8rpx 24rpx;
  font-size: 28rpx;
  color: #333;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e0e0e0;
}
.card {
  background: linear-gradient(-90deg, #efefef 0%, #fff 100%);
  border-radius: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 32rpx;
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
  color: #6b7280;
}

.status-online {
  color: #00a20f;
}

.status-amount {
  color: #6a4f40;
}

.icon {
  font-size: 28rpx;
}

/* 通用控制模块样式 */
.water-temp-card,
.position-card {
  padding: 60rpx 40rpx;

  .temp-header,
  .position-header {
    text-align: center;
    margin-bottom: 10rpx;
  }

  .temp-title,
  .position-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .temp-content,
  .position-content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .temp-display,
  .position-display {
    text-align: center;
  }

  .temp-value,
  .position-value {
    font-size: 60rpx;
    font-weight: bold;
    color: #5a4a3f;
  }

  .temp-controls,
  .position-controls {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    gap: 200rpx;
  }

  .temp-btn,
  .position-btn {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    background: #fff;
    border: 2rpx solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 20rpx;
    transition: all 0.3s ease;
    pointer-events: auto;
  }

  .temp-btn:active,
  .position-btn:active {
    background: linear-gradient(135deg, #1777ff 0%, #0d5bb8 100%);
    color: #fff;
    border-color: #1777ff;
    box-shadow: 0 4rpx 8rpx rgba(23, 119, 255, 0.3);
    transform: scale(0.95);
  }

  .icon-arrow {
    font-size: 24rpx;
  }
}

/* 夜灯模块 */
.night-light-card {
  padding: 40rpx 0;

  .night-light-header {
    text-align: center;
  }

  .night-light-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .night-light-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .night-light-divider {
    width: 100%;
    height: 1rpx;
    background-color: #e0e0e0;
    margin: 30rpx 0;
  }
  .night-light {
    margin-top: 20rpx;
    height: 60rpx;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .night-light-icon {
    font-size: 43rpx;
    color: #5a4a3f;
  }
  .light-on {
    font-size: 60rpx;
  }

  .night-light-switch {
    width: 100rpx;
    height: 50rpx;
    background-color: #e0e0e0;
    border-radius: 25rpx;
    position: relative;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .night-light-switch.active {
    background-color: #5a4a3f;
  }

  .switch-thumb {
    width: 46rpx;
    height: 46rpx;
    background-color: #fff;
    border-radius: 50%;
    position: absolute;
    top: 2rpx;
    left: 2rpx;
    transition: all 0.3s ease;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  }

  .night-light-switch.active .switch-thumb {
    left: 52rpx;
  }
}

/* 妇洗模块 */
.feminine-wash-card {
  padding: 40rpx 0;

  .feminine-wash-header {
    text-align: center;
    margin-bottom: 30rpx;
  }

  .feminine-wash-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .feminine-wash-temps {
    display: flex;
    justify-content: space-around;
  }

  .feminine-wash-divider {
    width: 100%;
    height: 1rpx;
    background-color: #e0e0e0;
    margin: 40rpx 0;
  }

  .temp-setting {
    display: flex;
    align-items: flex-start;
    gap: 15rpx;
  }

  .temp-icon {
    font-size: 40rpx;
    color: #5a4a3f;
    margin-top: 5rpx;
  }

  .temp-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5rpx;
  }

  .temp-value {
    font-size: 36rpx;
    font-weight: bold;
    color: #5a4a3f;
  }

  .temp-label {
    font-size: 24rpx;
    color: #666;
  }

  .feminine-wash-modes {
    display: flex;
    gap: 20rpx;
    padding: 0 40rpx;
  }

  .mode-btn {
    flex: 1;
    padding: 15rpx 0;
    border-radius: 60rpx;
    text-align: center;
    font-size: 28rpx;
    transition: all 0.3s ease;
    background-color: #f0f0f0;
    color: #333;
    border: 1rpx solid #e0e0e0;
  }

  .mode-btn.active {
    background-color: #5a4a3f;
    color: #fff;
    border-color: #5a4a3f;
  }

  .mode-btn.disabled {
    visibility: hidden;
    pointer-events: none;
  }
}

/* 风温模块 */
.wind-temp-card {
  padding: 60rpx 40rpx;

  .temp-header {
    text-align: center;
    margin-bottom: 10rpx;
  }

  .temp-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .temp-content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .temp-display {
    text-align: center;
  }

  .temp-value {
    font-size: 60rpx;
    font-weight: bold;
    color: #5a4a3f;
  }

  .temp-controls {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    gap: 200rpx;
  }

  .temp-btn {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    background: #fff;
    border: 2rpx solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 20rpx;
    transition: all 0.3s ease;
    pointer-events: auto;
  }

  .temp-btn:active {
    background: linear-gradient(135deg, #1777ff 0%, #0d5bb8 100%);
    color: #fff;
    border-color: #1777ff;
    box-shadow: 0 4rpx 8rpx rgba(23, 119, 255, 0.3);
    transform: scale(0.95);
  }

  .icon-arrow {
    font-size: 24rpx;
  }
}

/* 坐温模块 */
.seat-temp-card {
  padding: 60rpx 40rpx;

  .temp-header {
    text-align: center;
    margin-bottom: 10rpx;
  }

  .temp-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .temp-content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .temp-display {
    text-align: center;
  }

  .temp-value {
    font-size: 60rpx;
    font-weight: bold;
    color: #5a4a3f;
  }

  .temp-controls {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    gap: 200rpx;
  }

  .temp-btn {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    background: #fff;
    border: 2rpx solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 20rpx;
    transition: all 0.3s ease;
    pointer-events: auto;
  }

  .temp-btn:active {
    background: linear-gradient(135deg, #1777ff 0%, #0d5bb8 100%);
    color: #fff;
    border-color: #1777ff;
    box-shadow: 0 4rpx 8rpx rgba(23, 119, 255, 0.3);
    transform: scale(0.95);
  }

  .icon-arrow {
    font-size: 24rpx;
  }
}

/* 水量调节模块 */
.water-amount-card {
  padding: 60rpx 40rpx;

  .position-header {
    text-align: center;
    margin-bottom: 10rpx;
  }

  .position-title {
    font-size: 32rpx;
    color: #222;
    font-weight: normal;
  }

  .position-content {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .position-display {
    text-align: center;
  }

  .position-value {
    font-size: 60rpx;
    font-weight: bold;
    color: #5a4a3f;
  }

  .position-controls {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    gap: 200rpx;
  }

  .position-btn {
    width: 50rpx;
    height: 50rpx;
    border-radius: 50%;
    background: #fff;
    border: 2rpx solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    font-size: 20rpx;
    transition: all 0.3s ease;
    pointer-events: auto;
  }

  .position-btn:active {
    background: linear-gradient(135deg, #1777ff 0%, #0d5bb8 100%);
    color: #fff;
    border-color: #1777ff;
    box-shadow: 0 4rpx 8rpx rgba(23, 119, 255, 0.3);
    transform: scale(0.95);
  }

  .icon-arrow {
    font-size: 24rpx;
  }
}

.control-grid {
  display: grid;
  gap: 0;
  border-radius: 28rpx;
  overflow: hidden;
}

.basic-controls .control-grid {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.advanced-controls {
  margin-bottom: 200rpx;
}

.advanced-controls .control-grid {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.control-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 20rpx;
  transition: all 0.3s ease;
  position: relative;
}

/* 基础控制宫格 - 3x2布局 */
.basic-controls .control-item:nth-child(1) {
  border-top-left-radius: 28rpx;
}

.basic-controls .control-item:nth-child(3) {
  border-top-right-radius: 28rpx;
}

.basic-controls .control-item:nth-child(4) {
  border-bottom-left-radius: 28rpx;
}

.basic-controls .control-item:nth-child(6) {
  border-bottom-right-radius: 28rpx;
}

.basic-controls .control-item:not(:nth-child(3n)) {
  border-right: 1rpx solid #e0e0e0;
}

.basic-controls .control-item:nth-child(-n + 3) {
  border-bottom: 1rpx solid #e0e0e0;
}

/* 高级控制宫格 - 3x3布局 */
.advanced-controls .control-item:nth-child(1) {
  border-top-left-radius: 28rpx;
}

.advanced-controls .control-item:nth-child(3) {
  border-top-right-radius: 28rpx;
}

.advanced-controls .control-item:nth-child(7) {
  border-bottom-left-radius: 28rpx;
}

.advanced-controls .control-item:nth-child(9) {
  border-bottom-right-radius: 28rpx;
}

.advanced-controls .control-item:not(:nth-child(3n)) {
  border-right: 1rpx solid #e0e0e0;
}

.advanced-controls .control-item:nth-child(-n + 3) {
  border-bottom: 1rpx solid #e0e0e0;
}

.advanced-controls .control-item:nth-child(n + 4):nth-child(-n + 6) {
  border-bottom: 1rpx solid #e0e0e0;
}

.control-item.active {
  background: linear-gradient(180deg, #efefef 0%, #ffffff 100%);
  border-color: #5a4a3f;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.control-icon {
  font-size: 40rpx;
  color: #5a4a3f;
  margin-bottom: 15rpx;
  transition: all 0.3s ease;
}

.control-text {
  font-size: 24rpx;
  color: #574b43;
  text-align: center;
  transition: all 0.3s ease;
}
.control-item.active {
  .control-icon {
    font-weight: bold;
  }

  .control-text {
    font-weight: bold;
  }
}
</style>
