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
            <view class="productName">{{ device.locationToilet }}</view>
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
          <view v-for="(item, index) in basicControls" :key="index" class="control-item"
            :class="{ active: item.active }" @click="handleBasicControl(item, index)">
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
          <view class="mode-btn" :class="{ active: seatRingMode.includes('seatCover') }"
            @click="setSeatRingMode('seatCover')">
            <text>开关座盖</text>
          </view>
          <view class="mode-btn disabled">
            <text></text>
          </view>
          <view class="mode-btn" :class="{ active: seatRingMode.includes('seatRing') }"
            @click="setSeatRingMode('seatRing')">
            <text>开关座圈</text>
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
          <view class="mode-btn" :class="{ active: hipWashMode.includes('reciprocating') }"
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
          <view class="mode-btn" :class="{ active: feminineWashMode.includes('reciprocating') }"
            @click="setFeminineWashMode('reciprocating')">
            <text>往复清洗</text>
          </view>
          <view class="mode-btn" :class="{ active: feminineWashMode.includes('bubble') }"
            @click="setFeminineWashMode('bubble')">
            <text>气泡按摩</text>
          </view>
          <view class="mode-btn" :class="{ active: feminineWashMode.includes('pulse') }"
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
            <up-picker-data v-model="waterTemp" title="请选择档位" :options="gearsOptions" valueKey="id" labelKey="label"
              @confirm="confirmWaterTemp">
              <template #trigger="{ current }">
                <view class="temp-value">{{ current || '1档' }}</view>
              </template>
            </up-picker-data>
            <!-- <text class="temp-value">{{ LEVEL_LABELS[waterTemp] }}</text> -->
          </view>
          <!-- <view class="temp-controls">
            <view class="temp-btn" @click="decreaseTemp">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="temp-btn" @click="increaseTemp">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view> -->
        </view>
      </view>
      <!-- 风温模块 -->
      <view v-if="showWindTempModule" class="card wind-temp-card">
        <view class="temp-header">
          <text class="temp-title">风温</text>
        </view>
        <view class="temp-content">
          <view class="temp-display">
            <up-picker-data v-model="windTemp" title="请选择档位" :options="gearsOptions" valueKey="id" labelKey="label"
              @confirm="confirmWindTemp">
              <template #trigger="{ current }">
                <view class="temp-value">{{ current || '1档' }}</view>
              </template>
            </up-picker-data>
          </view>
          <!-- <view class="temp-controls">
            <view class="temp-btn" @click="decreaseWindTemp">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="temp-btn" @click="increaseWindTemp">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view> -->
        </view>
      </view>

      <!-- 座温模块 -->
      <view v-if="showSeatTempModule" class="card seat-temp-card">
        <view class="temp-header">
          <text class="temp-title">座温</text>
        </view>
        <view class="temp-content">
          <view class="temp-display">
            <up-picker-data v-model="seatTemp" title="请选择档位" :options="gearsOptions" valueKey="id" labelKey="label"
              @confirm="confirmSeatTemp">
              <template #trigger="{ current }">
                <view class="temp-value">{{ current || '1档' }}</view>
              </template>
            </up-picker-data>
          </view>
          <!-- <view class="temp-controls">
            <view class="temp-btn" @click="decreaseSeatTemp">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="temp-btn" @click="increaseSeatTemp">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view> -->
        </view>
      </view>

      <!-- 位置调节模块 -->
      <view v-if="showPositionModule" class="card position-card">
        <view class="position-header">
          <text class="position-title">位置调节</text>
        </view>
        <view class="position-content">
          <view class="position-display">
            <up-picker-data v-model="positionLevel" title="请选择档位" :options="gearsOptionsB" valueKey="id"
              labelKey="label" @confirm="confirmPosition">
              <template #trigger="{ current }">
                <view class="position-value">{{ current || '1档' }}</view>
              </template>
            </up-picker-data>

            <!-- <text class="position-value">{{ LEVEL_LABELSB[positionLevel] }}</text> -->
          </view>
          <!-- <view class="position-controls">
            <view class="position-btn" @click="decreasePosition">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="position-btn" @click="increasePosition">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view> -->
        </view>
      </view>

      <!-- 水量调节模块 -->
      <view v-if="showWaterAmountModule" class="card water-amount-card">
        <view class="position-header">
          <text class="position-title">水量调节</text>
        </view>
        <view class="position-content">
          <view class="position-display">
            <up-picker-data v-model="waterAmountLevel" title="请选择档位" :options="gearsOptionsB" valueKey="id"
              labelKey="label" @confirm="confirmWaterAmount">
              <template #trigger="{ current }">
                <view class="position-value">{{ current || '1档' }}</view>
              </template>
            </up-picker-data>
            <!-- <text class="position-value">{{ LEVEL_LABELSB[waterAmountLevel] }}</text> -->
          </view>
          <!-- <view class="position-controls">
            <view class="position-btn" @click="decreaseWaterAmount">
              <text class="font_family icon-arrow">&#xe60e;</text>
            </view>
            <view class="position-btn" @click="increaseWaterAmount">
              <text class="font_family icon-arrow">&#xe60d;</text>
            </view>
          </view> -->
        </view>
      </view>
      <!-- 高级控制宫格 -->
      <view class="card advanced-controls">
        <view class="control-grid">
          <view v-for="(item, index) in advancedControls" :key="index" class="control-item"
            :class="{ active: item.active }" @click="handleAdvancedControl(item, index)">
            <text class="font_family control-icon" :class="item.icon"></text>
            <text class="control-text">{{ item.name }}</text>
          </view>
        </view>
      </view>
      <!-- 不常用两个控制控制 -->
      <view class="card water-tank-controls bottom200">
        <view class="water-tank-container">
          <view class="water-tank-button" :class="{ active: waterTankControls.includes('水箱排空') }"
            @click="handleWaterTankControl('水箱排空')">
            <text class="water-text">水箱排空</text>
          </view>
          <view class="water-tank-button" :class="{ active: waterTankControls.includes('水箱除垢') }"
            @click="openWaterTank('水箱除垢')">
            <text class="water-text">水箱除垢</text>
          </view>
        </view>
      </view>

      <!-- 感应距离弹窗（三步状态机，前端模拟流程） -->
      <up-modal :show="showWaterTank" :closeOnClickOverlay="false" :showCancelButton="false" :showConfirmButton="false">
        <view class="distance-modal">
          <view class="distance-header">水箱除垢</view>

          <view class="distance-body">
            <!-- 图标区：根据状态切换 -->
            <view class="distance-icon-wrap">
              <template v-if="waterTankState === 'idle'">
                <text class="font_family distance-icon idle">&#xe710;</text>
              </template>
              <template v-else-if="['sending', 'waiting', 'addCleaner', 'cleaning'].includes(waterTankState)">
                <up-loading-icon mode="circle" size="42" color="#6a4f40"></up-loading-icon>
              </template>
              <template v-else-if="waterTankState === 'success'">
                <up-icon name="checkmark-circle-fill" color="#00a20f" size="42"></up-icon>
              </template>
              <template v-else-if="waterTankState === 'failed'">
                <up-icon name="close-circle-fill" color="#fa3534" size="42"></up-icon>
              </template>
            </view>

            <!-- 文案区：根据状态切换 -->
            <template v-if="waterTankState === 'idle'">
              <view class="distance-title">确定要进行水箱除垢吗？</view>
              <view class="distance-sub">提示：水箱除垢过程中，请不要关闭页面</view>
            </template>
            <template v-if="waterTankState === 'sending'">
              <view class="distance-title">指令发送中...</view>
              <view class="distance-sub">请稍候，不要关闭页面</view>
            </template>
            <template v-if="waterTankState === 'waiting'">
              <view class="distance-title">请等待水箱排空</view>
              <view class="distance-sub">直到水箱排空完成，水箱除垢开始</view>
            </template>
            <template v-if="waterTankState === 'addCleaner'">
              <view class="distance-title">请加清洁液到指定刻度线</view>
              <view class="distance-sub">直到清洁液加到指定刻度线，水箱除垢开始</view>
            </template>
            <template v-if="waterTankState === 'cleaning'">
              <view class="distance-title">水箱清洗中</view>
              <view class="distance-sub">请等待水箱清洗完成</view>
            </template>
            <template v-if="waterTankState === 'success'">
              <view class="distance-title success">水箱除垢完成</view>
              <view class="distance-sub">如不合适，请重新除垢</view>
            </template>
            <template v-if="waterTankState === 'failed'">
              <view class="distance-title failed">指令发送失败，请稍后重试。</view>
              <view class="distance-sub">请检查设备状态或稍后重试</view>
            </template>
          </view>

          <!-- 操作区 -->
          <view class="distance-divider"></view>
          <view class="distance-actions">
            <up-button class="confirm-btn" :text="primaryText" type="primary" color="#6a4f40" shape="circle"
              :disabled="primaryDisabled" @click="onPrimary"></up-button>
            <up-button class="cancel-btn" text="关闭" type="info" plain shape="circle" :disabled="closeDisabled"
              @click="onWaterTankClose"></up-button>
          </view>
        </view>
      </up-modal>


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
  // { name: '小冲', active: false, icon: 'icon-a-ziyuan34' },
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

// 不常用两个控制控制
const waterTankControls = ref([]);

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
const LEVEL_LABELS = ['1档', '2档', '3档', '4档', '5档', '6档'];
const LEVEL_LABELSB = ['1档', '2档', '3档', '4档', '5档'];

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

// 座温设置（1~5档）
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
  if (messageData?.topic === reportTopic) {
    console.log('pageMessage', messageData);
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
    feedbackResult(res, params);
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
  feedbackResult(res, params);
}

// 处理设备PID响应
function handleDevicePidResponse(pids) {
  pids.forEach((item) => {
    const pidKey = String(item.pid);
    if (pidKey === PID_CONFIG.SEAT_COVER) {
      if (item.val == 1) {
        // 如果没有包含'seatCover'，则添加
        if (!seatRingMode.value.includes('seatCover')) {
          seatRingMode.value.push('seatCover');
        }
      } else {
        // 关闭座盖
        seatRingMode.value = seatRingMode.value.filter((m) => m !== 'seatCover');
      }
    }
    if (pidKey === PID_CONFIG.SEAT_RING) {
      if (item.val == 1) {
        // 如果没有包含'seatRing'，则添加
        if (!seatRingMode.value.includes('seatRing')) {
          seatRingMode.value.push('seatRing'); // 打开座圈
        }
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
    // 水箱蓄水状态
    if (pidKey === '64') {
      handleWaterTankStatus(item.val)
    }
    // 水箱清洗状态
    if (pidKey === '65') {
      handleWaterTankCleaningStatus(item.val)
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

// 处理不常用两个控制控制
const handleWaterTankControl = (event) => {
  console.log(event);
  // 重置其他按钮的选中状态
  advancedControls.value.forEach((control, i) => {
    control.active = false;
  });
  // 先隐藏所有模块
  hideOtherModules();
  // 显示选中状态500毫秒
  waterTankControls.value = [event];
  setTimeout(() => {
    waterTankControls.value = [];
  }, 500);

  handleBasicControlEvent(event);
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
  } else if (event === '水箱排空') {
    params = createControlParams({
      did: DEVICE_CONFIG.did,
      sid: 0,
      fid: 4112,
      val: 1,
    });
  } else if (event === '水箱除垢') {
    params = createControlParams({
      did: DEVICE_CONFIG.did,
      sid: 0,
      fid: 4113,
      val: 1,
    });
  }
  const res = await ctrlDevice(params);
  feedbackResult(res, params);
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

// // 水温调节（1~5档）
// const increaseTemp = () => {
//   if (waterTemp.value < 5) {
//     waterTemp.value++;
//     ctrFn(4105, waterTemp.value);
//   }
// };

// const decreaseTemp = () => {
//   if (waterTemp.value > 0) {
//     waterTemp.value--;
//     ctrFn(4105, waterTemp.value);
//   }
// };

// // 风温调节（1~5档）
// const increaseWindTemp = () => {
//   if (windTemp.value < 5) {
//     windTemp.value++;
//     ctrFn(4106, windTemp.value);
//   }
// };

// const decreaseWindTemp = () => {
//   if (windTemp.value > 0) {
//     windTemp.value--;
//     ctrFn(4106, windTemp.value);
//   }
// };

// // 座温调节（1~5档）
// const increaseSeatTemp = () => {
//   if (seatTemp.value < 5) {
//     seatTemp.value++;
//     ctrFn(4107, seatTemp.value);
//   }
// };

// const decreaseSeatTemp = () => {
//   if (seatTemp.value > 0) {
//     seatTemp.value--;
//     ctrFn(4107, seatTemp.value);
//   }
// };

// // 位置调节
// const increasePosition = () => {
//   if (positionLevel.value < 4) {
//     positionLevel.value++;
//     ctrFn(4109, positionLevel.value);
//   }
// };

// const decreasePosition = () => {
//   if (positionLevel.value > 0) {
//     positionLevel.value--;
//     ctrFn(4109, positionLevel.value);
//   }
// };

// // 水量调节
// const increaseWaterAmount = () => {
//   if (waterAmountLevel.value < 4) {
//     waterAmountLevel.value++;
//     ctrFn(4110, waterAmountLevel.value);
//   }
// };

// const decreaseWaterAmount = () => {
//   if (waterAmountLevel.value > 0) {
//     waterAmountLevel.value--;
//     ctrFn(4110, waterAmountLevel.value);
//   }
// };

const goToSetting = () => {
  uni.navigateTo({
    url: '/pages/toiletH111/toiletSetting?device=' + encodeURIComponent(JSON.stringify(device.value)),
  });
};

// 反馈结果
function feedbackResult(res, params) {
  if (res.code === 0) {
    feedbackSuccess(params.seq);
  } else {
    uni.showToast({ icon: 'error', title: '操作失败', duration: 500 });
    uni.hideLoading();
  }
}

// 监听全局主题消息反馈操作成功
let globalWSatchStop = null;
let globalWSatchStopTimer = null;
function feedbackSuccess(seq) {
  uni.showLoading({
    title: '操作中...',
    mask: true,
  });
  timeoutHideLoading();
  const { globalTopicInfo } = storeToRefs(useStore());
  cleanupWatchListeners();
  globalWSatchStop = watch(
    globalTopicInfo,
    (newVal) => {
      console.log('阶段1：', newVal);
      if (newVal?.seq === seq) {
        if (newVal?.result == 1) {
          uni.hideLoading();
          uni.showToast({ icon: 'success', title: '操作成功', duration: 500 });
          clearTimeoutHideLoading();
        }
      }
    },
    { deep: true, immediate: false }
  );
}

// 超时10秒后，隐藏loading
function timeoutHideLoading() {
  clearTimeoutHideLoading();
  globalWSatchStopTimer = setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ icon: 'error', title: '操作超时', duration: 500 });
  }, 10000);
}

onUnload(() => {
  mqttClient.unregisterPageTopicHandler(reportTopic, handleReportTopicResponse);
  cleanupWatchListeners();
  clearTimeoutHideLoading();
  startWaterTankTimer();
  cleanupWaterTankWatchListeners()
  clearWaterTankTimer();
});

function cleanupWatchListeners() {
  if (globalWSatchStop) {
    globalWSatchStop();
    globalWSatchStop = null;
  }
}

// 清除超时定时器
function clearTimeoutHideLoading() {
  clearTimeout(globalWSatchStopTimer);
  globalWSatchStopTimer = null;
}

// 设置（1~6档）
const gearsOptions = [
  {
    label: '1挡',
    id: 0,
  },
  {
    label: '2挡',
    id: 1,
  },
  {
    label: '3挡',
    id: 2,
  },
  {
    label: '4挡',
    id: 3,
  },
  {
    label: '5挡',
    id: 4,
  },
  {
    label: '6挡',
    id: 5,
  },
];

// 设置（1~5档）
const gearsOptionsB = [
  {
    label: '1挡',
    id: 0,
  },
  {
    label: '2挡',
    id: 1,
  },
  {
    label: '3挡',
    id: 2,
  },
  {
    label: '4挡',
    id: 3,
  },
  {
    label: '5挡',
    id: 4,
  },
];

const confirmWaterTemp = () => {
  ctrFn(4105, waterTemp.value);
};

const confirmWindTemp = () => {
  ctrFn(4106, windTemp.value);
};

const confirmSeatTemp = () => {
  ctrFn(4107, seatTemp.value);
};

const confirmPosition = () => {
  ctrFn(4109, positionLevel.value);
};

const confirmWaterAmount = () => {
  ctrFn(4110, waterAmountLevel.value);
};


// 水箱除垢部分逻辑-start
let waterTankWatchStop = null;
const startWaterTankCleaning = async () => {
  waterTankState.value = 'sending';
  // 发送开始校准指令
  try {
    // 为本次流程生成唯一 seq，后续按此进行消息关联
    const seq = generateRandomSeq();
    const params = {
      src: clientId,
      dst: DEVICE_CONFIG.dst,
      ver: 'V1.0',
      seq,
      params: {
        did: DEVICE_CONFIG.did,
        sid: 0,
        fid: 4113,
        val: 1,
      },
    };
    const res = await ctrlDevice(params);
    if (res.code === 0) {
      const waitMs = res.waitTime || 5000;

      // 启动超时兜底，只在 waiting 期间有效
      // startWaterTankTimer(waitMs);
      cleanupWaterTankWatchListeners();
      // 监听全局主题消息
      const { globalTopicInfo } = storeToRefs(useStore());
      waterTankWatchStop = watch(
        globalTopicInfo,
        (newVal) => {
          console.log('阶段1：', newVal);
          if (newVal?.seq === seq) {
            if (newVal?.result == 1) {
              readWaterTankStatus()
            } else {
              waterTankState.value = 'failed';
              clearWaterTankTimer();
              cleanupWaterTankWatchListeners()
            }
          }
        },
        { deep: true, immediate: false }
      );

    } else {
      waterTankState.value = 'failed';
    }
  } catch (error) {
    waterTankState.value = 'failed';
    console.error('距离校准指令发送失败', error);
  }
};

const cleanupWaterTankWatchListeners = () => {
  if (waterTankWatchStop) {
    waterTankWatchStop();
    waterTankWatchStop = null;
  }
};
let waterTankStatus = 0;
let waterTankCleaningStatus = 0;
// 用读设备属性接口，读水箱蓄水状态属性和水箱清洗状态属性
// 64水箱蓄水状态 0:未排空 1: 已排空
// 65水箱清洗状态 0:已清洗 1: 开始清洗
async function readWaterTankStatus() {
  try {
    const params = createDeviceParams({
      pids: [{ pid: 64, sid: 0 }, { pid: 65, sid: 0 }],
    });
    const res = await readDevicePidVal(params);
    const { pids = [] } = res.data || {};

    pids.forEach(item => {
      if (item.pid == 64) {
        waterTankStatus = item.val;
      }
      if (item.pid == 65) {
        waterTankCleaningStatus = item.val;
      }
    })

    pids.forEach(item => {
      if (item.pid == 64) {
        // 水箱蓄水状态为未排空
        if (item.val == 0) {
          // 并监听水箱蓄水状态属性上报，如果水箱蓄水状态已排空，则进入下一步操作
          waterTankState.value = 'waiting';
        } else {
          // 水箱蓄水状态为已排空,且水箱清洗状态为已完成
          if (waterTankCleaningStatus == 0) {
            waterTankState.value = 'addCleaner';
          }
          // 水箱蓄水状态为已排空，且水箱清洗状态为清洗中
          if (waterTankCleaningStatus == 1) {
            waterTankState.value = 'cleaning';
          }
        }
      }
    })

  } catch (error) {
    console.error('读取设备PID值失败:', error);
  }
}

// 监听水箱蓄水状态处理方法
function handleWaterTankStatus(val) {
  // 此时状态为未排空，如果属性上报水箱蓄水状态已排空，则进入"加清洁液"
  if (waterTankStatus == 0 && val == 1) {
    waterTankState.value = 'addCleaner';
  }
}
// 监听水箱清洗状态的方法
function handleWaterTankCleaningStatus(val) {
  if (waterTankState.value === 'addCleaner' && val == 1) {
    waterTankState.value = 'cleaning';
  }
  // 水箱蓄水状态为已排空，且水箱清洗状态为清洗中
  // 并监听水箱清洗状态属性上报，如果上报已完成，则进入下一步操作
  if (waterTankState.value === 'cleaning' && val == 0) {
    waterTankState.value = 'success';
  }
}

// 水箱除垢部分逻辑
const showWaterTank = ref(false);
const waterTankState = ref('idle');
const primaryDisabled = computed(() => ['sending', 'waiting', 'addCleaner', 'cleaning'].includes(waterTankState.value));
const closeDisabled = computed(() => ['sending', 'waiting', 'addCleaner', 'cleaning'].includes(waterTankState.value));
const primaryText = computed(() => {
  if (waterTankState.value === 'idle') return '开始';
  if (waterTankState.value === 'failed') return '重新开始';
  if (waterTankState.value === 'success') return '完成';
  return '进行中';
});
const openWaterTank = () => {
  waterTankState.value = 'idle';
  showWaterTank.value = true;
}

let count = 0;
let timer = null;
const onPrimary = () => {
  if (waterTankState.value === 'idle' || waterTankState.value === 'failed') {
    // 先把已有的定时器停掉
    // if (timer) {
    //   clearInterval(timer);
    //   timer = null;
    // }
    // count = 0;
    // waterTankState.value = 'idle';

    // timer = setInterval(() => {
    //   console.log('count', count);

    //   if (count === 0) {
    //     waterTankState.value = 'sending';
    //   } else if (count === 1) {
    //     waterTankState.value = 'waiting';
    //   } else if (count === 2) {
    //     waterTankState.value = 'addCleaner';
    //   } else if (count === 3) {
    //     waterTankState.value = 'cleaning';
    //   } else if (count === 4) {
    //     waterTankState.value = 'success';
    //   }
    //   count++;
    //   if (count >= 5) {
    //     clearInterval(timer)
    //     timer = null;
    //     count = 0;
    //   }
    // }, 3000);
    startWaterTankCleaning();
    return;
  }
  if (waterTankState.value === 'success') {
    onWaterTankClose();
  }

}
const onWaterTankClose = () => {
  if (closeDisabled.value) return;
  clearWaterTankTimer();
  cleanupWaterTankWatchListeners()
  showWaterTank.value = false;
};

let waterTankTimer = null;
const startWaterTankTimer = (time) => {
  clearWaterTankTimer();
  // 例如 20s 超时失败
  waterTankTimer = setTimeout(() => {
    if (['waiting', 'sending', 'addCleaner', 'cleaning'].includes(waterTankState.value)) {
      waterTankState.value = 'failed';
    }
  }, time || 20000);
};

const clearWaterTankTimer = () => {
  if (waterTankTimer) {
    clearTimeout(waterTankTimer);
    waterTankTimer = null;
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

/* 座温模块 */
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

/* 水箱控制按钮样式 */
.water-tank-controls {
  padding: 40rpx;
}

.bottom200 {
  margin-bottom: 200rpx;
}

.water-tank-container {
  display: flex;
  gap: 20rpx;
  justify-content: space-between;
}

.water-tank-button {
  flex: 1;
  padding: 24rpx 0;
  border-radius: 60rpx;
  text-align: center;
  font-size: 28rpx;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
  border: 1rpx solid #e0e0e0;
  box-shadow: 0 2rpx 4rpx rgba(228, 228, 228, 0.3);
  position: relative;
  overflow: hidden;
}

.water-tank-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.water-tank-button:active::before {
  left: 100%;
}

.water-tank-button.active {
  background: linear-gradient(135deg, #5a4a3f 0%, #6b5a4f 100%);
  border-color: #5a4a3f;
  box-shadow: 0 4rpx 12rpx rgba(90, 74, 63, 0.3);
  transform: translateY(-2rpx);
}

.water-tank-button.active .water-text {
  color: #ffffff;
  font-weight: 600;
}

.water-text {
  font-size: 28rpx;
  color: #574b43;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.water-tank-button:active {
  transform: scale(0.98);
}



.popup-content {
  padding: 32rpx 32rpx 48rpx 32rpx;
}

.title-row {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 8rpx 16rpx 8rpx;
}

.title-row .title {
  font-weight: bold;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32rpx;
  color: #303133;
}

.action-btn {
  font-size: 28rpx;
}

.action-cancel {
  color: #c8c9cc;
}

.action-confirm {
  color: #1677ff;
}

.number-row {
  margin-top: 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.circle-btn {
  width: 72rpx;
  height: 72rpx;
  border: 2rpx solid #dcdfe6;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}

.value-text {
  width: 128rpx;
  text-align: center;
  font-size: 56rpx;
  color: #303133;
}

.unit {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #909399;
}

.description {
  margin-top: 48rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
  line-height: 36rpx;
  color: #cecece;
  text-align: center;
}

/* 感应距离弹窗样式（按设计） */
.distance-modal {
  width: 100%;
}

.distance-header {
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #303133;
}

.distance-body {
  margin-top: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.distance-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.distance-icon.idle {
  font-size: 70rpx;
  color: #ff941a;
}

.distance-title {
  margin-top: 20rpx;
  font-size: 30rpx;
  color: #303133;
}

.distance-title.success {
  color: #00a20f;
}

.distance-title.failed {
  color: #fa3534;
}

.distance-sub {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #909399;
}

.distance-divider {
  height: 2rpx;
  background: #ebedf0;
  margin: 42rpx -50rpx 32rpx;
}

.distance-actions {
  display: flex;
  gap: 70rpx;
  justify-content: center;
}

/* 开始按钮颜色设置 */
.confirm-btn :deep(.u-button--primary),
.confirm-btn :deep(.u-button) {
  background-color: #6a4f40 !important;
  border-color: #6a4f40 !important;
  color: #fff !important;
}

.confirm-btn :deep(.u-button--primary:disabled),
.confirm-btn :deep(.u-button:disabled) {
  background-color: #c0c4cc !important;
  border-color: #c0c4cc !important;
  color: #fff !important;
}
</style>
