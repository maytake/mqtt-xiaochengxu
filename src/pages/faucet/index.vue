<template>
  <view class="page">
    <view class="page-bg">
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
              总用水量：
              <text class="status-amount">4000L</text>
            </text>
          </view>
        </view>
      </view>
      <!-- 水龙头设置属性区 -->
      <view class="card settings-card">
        <view class="switch-btn">
          <view :class="['primary-btn', { active: waterOn }]" @click="toggleWater">
            <text class="font_family m-faucet">&#xe62f;</text>
            出水开关
          </view>
        </view>
        <view class="divider"></view>
        <view class="list">
          <view class="list-item" @click="resetToDefaults">
            <view class="label">恢复默认配置</view>
            <view class="extra value">
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view :class="['label', { dot: cleaningModeWarn }]" @click="handlePidTip('cleaningMode')">清洁模式</view>
            <view class="extra">
              <up-switch
                v-model="cleaningMode"
                size="20"
                activeColor="#5a4a3f"
                @change="updateCleaningMode"></up-switch>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view :class="['label', { dot: cleanTimeWarn }]" @click="handlePidTip('cleanTime')">清洁模式时间</view>
            <view class="extra value" @click="openCleanTimePopup">
              <text>{{ cleanModeTime }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view :class="['label', { dot: autoFlushWarn }]" @click="handlePidTip('autoFlush')">自动冲洗时间</view>
            <view class="extra value" @click="openPicker('autoFlush')">
              <text>{{ autoFlushTime }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view :class="['label', { dot: timeoutCloseWarn }]" @click="handlePidTip('timeoutClose')">
              超时关阀时间
            </view>
            <view class="extra value" @click="openPicker('timeoutClose')">
              <text>{{ timeoutCloseTime }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item" @click="openDistanceModal()">
            <view class="label">感应距离</view>
            <view class="extra value">
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>
      <!-- 水龙头设置属性区-end -->
      <!-- 清洁模式时间弹出层功能-start -->
      <up-popup :show="show" :round="10" mode="bottom" :closeOnClickOverlay="false" @close="closePopup">
        <view class="popup-content">
          <view class="title-row">
            <view class="action-btn action-cancel" @click="closePopup">取消</view>
            <view class="title">清洁模式时间</view>
            <view class="action-btn action-confirm" @click="confirmCleanTime">确定</view>
          </view>
          <view class="number-row">
            <up-number-box v-model="tempCleanMinutes" :min="1" :max="30" :step="1">
              <template #minus>
                <view class="circle-btn">
                  <up-icon name="minus" size="14" color="#909399"></up-icon>
                </view>
              </template>
              <template #input>
                <text class="value-text">{{ tempCleanMinutes }}</text>
              </template>
              <template #plus>
                <view class="circle-btn">
                  <up-icon name="plus" size="14" color="#909399"></up-icon>
                </view>
              </template>
            </up-number-box>
            <view class="unit">MIN</view>
          </view>
          <view class="description">
            清洁模式期间，感应功能将关闭，您可以在这段时间进行清洁等活动，设置范围在 1-30MIN
          </view>
        </view>
      </up-popup>
      <!-- 清洁模式时间弹出层功能-end -->
      <!-- 自动冲洗时间弹出层功能-start -->
      <up-picker
        :show="showPicker"
        :columns="pickerColumns"
        :title="pickerTitle"
        :defaultIndex="pickerDefaultIndex"
        @confirm="onPickerConfirm"
        @cancel="showPicker = false"></up-picker>
      <!-- 弹出层功能-end -->
      <!-- 感应距离（按设计重构：三步状态机） -->
      <up-modal :show="showDistance" :closeOnClickOverlay="false" :showCancelButton="false" :showConfirmButton="false">
        <view class="distance-modal">
          <view class="distance-header">红外距离设置</view>

          <view class="distance-body">
            <!-- 图标区：根据状态切换 -->
            <view class="distance-icon-wrap">
              <template v-if="distanceState === 'idle'">
                <text class="font_family distance-icon idle">&#xe710;</text>
              </template>
              <template v-else-if="distanceState === 'sending' || distanceState === 'waiting'">
                <up-loading-icon mode="circle" size="42" color="#6a4f40"></up-loading-icon>
              </template>
              <template v-else-if="distanceState === 'success'">
                <up-icon name="checkmark-circle-fill" color="#00a20f" size="42"></up-icon>
              </template>
              <template v-else-if="distanceState === 'failed'">
                <up-icon name="close-circle-fill" color="#fa3534" size="42"></up-icon>
              </template>
            </view>

            <!-- 文案区：根据状态切换 -->
            <view class="distance-title" v-if="distanceState === 'idle'">确定要重新设置对水龙头的红外距离吗？</view>
            <view class="distance-sub" v-if="distanceState === 'idle'">提示：现有红外距离将无效</view>

            <view class="distance-title" v-if="distanceState === 'sending'">指令发送中...</view>
            <view class="distance-sub" v-if="distanceState === 'sending'">请稍候，不要关闭页面</view>

            <view class="distance-title" v-if="distanceState === 'waiting'">请在设备闪烁中进入调试</view>
            <view class="distance-sub" v-if="distanceState === 'waiting'">直到设备闪烁五下</view>

            <view class="distance-title success" v-if="distanceState === 'success'">
              设置完成，红外距离已更新，请自行感受距离是否合适？
            </view>
            <view class="distance-sub" v-if="distanceState === 'success'">如不合适，请重新配置</view>

            <view class="distance-title failed" v-if="distanceState === 'failed'">
              指令发送失败，请确认设备连接是否正常?
            </view>
            <view class="distance-sub" v-if="distanceState === 'failed'">请检查设备在线状态或稍后重试</view>
          </view>

          <!-- 操作区：按状态禁用 -->
          <view class="distance-divider"></view>
          <view class="distance-actions">
            <up-button
              class="confirm-btn"
              :text="distancePrimaryText"
              type="primary"
              color="#6a4f40"
              shape="circle"
              :disabled="primaryDisabled"
              @click="onDistancePrimary"></up-button>
            <up-button
              class="cancel-btn"
              text="关闭"
              type="info"
              plain
              shape="circle"
              :disabled="closeDisabled"
              @click="onDistanceClose"></up-button>
          </view>
        </view>
      </up-modal>
      <!-- 感应距离 end -->
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { useStore } from '@/stores/globalMqttInfo';
import {
  getProductModelDetails,
  ctrlDevice,
  resetDevicePid,
  readDevicePidVal,
  writeDevicePid,
  setSensingDistance,
} from '@/api/mqttCommon';
import { generateRandomSeq } from '@/utils/common';
const mqttClient = getApp().globalData.mqttService;
// ==================== 常量配置 ====================
const DEVICE_STATUS = ['离线', '在线', '故障'];

const DEFAULT_VALUES = {
  cleaningMode: false,
  cleanModeTime: 3,
  autoFlushTime: 24,
  timeoutCloseTime: 60,
};

const DEVICE_CONFIG = {
  dst: '011025092402002F',
  did: '0111250924030004',
  dirDid: '011025092402002F',
};
let reportTopic = '';
const PID_CONFIG = {
  CLEANING_MODE: '53',
  CLEANING_MODE_TIME: '35',
  AUTO_FLUSH: '14',
  TIMEOUT_CLOSE: '15',
};

// 选择器配置
const PICKER_CONFIG = {
  autoFlush: {
    columns: [['0H', '12H', '24H', '48H', '72H']],
    title: '选择自动冲洗时间',
  },
  timeoutClose: {
    columns: [['0S', '10S', '15S', '30S', '60S']],
    title: '选择超时关阀时间',
  },
};

// ==================== 响应式数据 ====================
// 设备相关
const device = ref('');
const status = ref('0');
const statusName = ref('离线');
const waterOn = ref(false);
const productModelDetails = ref({});

// 设备设置
const cleaningMode = ref(true);
const cleanMinutes = ref(3); // 实际已下发/生效的清洁模式时间
const tempCleanMinutes = ref(3); // 弹窗内临时调整的清洁模式时间
const cleanModeTime = computed(() => `${cleanMinutes.value}MIN`);
const autoFlushTime = ref('24H');
const timeoutCloseTime = ref('60S');
const pidStatusMap = reactive({});

const isPidWarn = (pid) => {
  const status = pidStatusMap[pid];
  return status == 1;
};

const cleaningModeWarn = computed(() => isPidWarn(PID_CONFIG.CLEANING_MODE));
const cleanTimeWarn = computed(() => isPidWarn(PID_CONFIG.CLEANING_MODE_TIME));
const autoFlushWarn = computed(() => isPidWarn(PID_CONFIG.AUTO_FLUSH));
const timeoutCloseWarn = computed(() => isPidWarn(PID_CONFIG.TIMEOUT_CLOSE));

const handlePidTip = (type) => {
  const warnMap = {
    cleaningMode: cleaningModeWarn,
    cleanTime: cleanTimeWarn,
    autoFlush: autoFlushWarn,
    timeoutClose: timeoutCloseWarn,
  };
  const warnRef = warnMap[type];
  if (!warnRef || !warnRef.value) return;
  const message = '命令已下发，设备处于休眠状态。';
  uni.showToast({ title: message, icon: 'none' });
};

// 弹窗相关
const show = ref(false);
const showPicker = ref(false);
const pickerColumns = ref([]);
const pickerTitle = ref('');
const currentSetting = ref('');
const pickerDefaultIndex = ref([0]);

// ==================== 工具函数 ====================
const mqttUserInfo = uni.getStorageSync('mqttUserInfo');
const clientId = mqttUserInfo?.clientId || '';

// 提取字符串中的数字
const extractNumber = (str) => {
  if (str == null) return '';
  const match = String(str).match(/\d+/);
  return match ? match[0] : '';
};

// PID 值处理映射
const pidHandlers = {
  [PID_CONFIG.CLEANING_MODE]: (val) => {
    cleaningMode.value = Number(val) === 1;
  },
  [PID_CONFIG.CLEANING_MODE_TIME]: (val) => {
    const numVal = Number(val) || 0;
    cleanMinutes.value = numVal;
  },
  [PID_CONFIG.AUTO_FLUSH]: (val) => {
    autoFlushTime.value = `${val}H`;
  },
  [PID_CONFIG.TIMEOUT_CLOSE]: (val) => {
    timeoutCloseTime.value = `${val}S`;
  },
};
// 页面级主题消息处理函数
let handleReportTopicResponse = null;
// ==================== 生命周期钩子 ====================
onLoad(async (options) => {
  initDeviceData(options);
});
onUnload(() => {
  if (reportTopic) {
    mqttClient.unregisterPageTopicHandler(reportTopic, handleReportTopicResponse);
  }
});
onMounted(async () => {
  await Promise.all([readDevicePidValues(), loadProductModelDetails()]);
});

// ==================== 设备数据处理 ====================
const initDeviceData = (options) => {
  const deviceData = options.device;
  if (deviceData) {
    const data = JSON.parse(decodeURIComponent(deviceData));
    device.value = data;
    status.value = data.deviceStatus;
    statusName.value = DEVICE_STATUS[status.value];
    DEVICE_CONFIG.did = data.did;
  }
  reportTopic = `olt/report/pid/${DEVICE_CONFIG.did}`;
  // 阶段2：订阅并仅监听一次设备报告主题
  mqttClient.registerPageTopicHandler(reportTopic, handleReportTopicResponse);
};

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

// 读取设备PID值
const readDevicePidValues = async () => {
  try {
    const params = createDeviceParams({
      pids: [
        { pid: PID_CONFIG.CLEANING_MODE, sid: 0 },
        { pid: PID_CONFIG.CLEANING_MODE_TIME, sid: 0 },
        { pid: PID_CONFIG.AUTO_FLUSH, sid: 0 },
        { pid: PID_CONFIG.TIMEOUT_CLOSE, sid: 0 },
      ],
    });

    const res = await readDevicePidVal(params);
    const { pids = [] } = res.data || {};
    pids.forEach((item) => {
      const pidKey = String(item.pid);
      pidStatusMap[pidKey] = item.status;
    });
    handleDevicePidResponse(res);
  } catch (error) {
    console.error('读取设备PID值失败:', error);
  }
};

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

// 处理设备PID响应
const handleDevicePidResponse = (res) => {
  const { code, data = {} } = res || {};
  if (code === 0) {
    const pids = data.pids || [];
    pids.forEach((item) => {
      const handler = pidHandlers[String(item.pid)];
      if (handler) handler(item.val);
    });
  }
};

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

// ==================== 弹窗控制 ====================
const openCleanTimePopup = () => {
  // 打开弹窗时，用当前已生效的时间初始化临时值，避免列表跟随变化
  tempCleanMinutes.value = cleanMinutes.value;
  show.value = true;
};

const closePopup = () => {
  show.value = false;
};

const openPicker = (setting) => {
  currentSetting.value = setting;
  const config = PICKER_CONFIG[setting] || { columns: [[]], title: '' };

  pickerColumns.value = config.columns;
  pickerTitle.value = config.title;

  // 计算默认选中索引
  const options = config.columns?.[0] || [];
  const currentValue = getCurrentSettingValue(setting);
  const index = options.findIndex((opt) => opt === currentValue);
  pickerDefaultIndex.value = [index >= 0 ? index : 0];

  showPicker.value = true;
};

const getCurrentSettingValue = (setting) => {
  const valueMap = {
    autoFlush: autoFlushTime.value,
    timeoutClose: timeoutCloseTime.value,
  };
  return valueMap[setting] || '';
};

const onPickerConfirm = (e) => {
  const selected = e.value.join('');
  const settingActions = {
    autoFlush: () => {
      autoFlushTime.value = selected;
      updateAutoFlushTime();
    },
    timeoutClose: () => {
      timeoutCloseTime.value = selected;
      updateTimeoutCloseTime();
    },
  };

  settingActions[currentSetting.value]?.();
  showPicker.value = false;
};

// ==================== 设备控制 ====================

const toggleWater = async () => {
  waterOn.value = true;
  setTimeout(() => {
    waterOn.value = false;
  }, 1000);
  const params = {
    src: clientId,
    dst: DEVICE_CONFIG.dst,
    ver: 'V1.0',
    seq: generateRandomSeq(),
    params: {
      did: DEVICE_CONFIG.did,
      sid: 0,
      fid: 4097,
      val: 1,
    },
  };
  const res = await ctrlDevice(params);
  feedbackResult(res);
};

// 设备设置更新
const updateCleaningMode = () => {
  writeDevicePidValue([{ pid: PID_CONFIG.CLEANING_MODE, val: cleaningMode.value ? 1 : 0 }]);
};

const confirmCleanTime = () => {
  // 点击确定时才将临时值写回实际值，并下发到设备
  cleanMinutes.value = tempCleanMinutes.value;
  closePopup();
  writeDevicePidValue([{ pid: PID_CONFIG.CLEANING_MODE_TIME, val: cleanMinutes.value }]);
};

const updateAutoFlushTime = () => {
  writeDevicePidValue([{ pid: PID_CONFIG.AUTO_FLUSH, val: extractNumber(autoFlushTime.value) }]);
};

const updateTimeoutCloseTime = () => {
  writeDevicePidValue([{ pid: PID_CONFIG.TIMEOUT_CLOSE, val: extractNumber(timeoutCloseTime.value) }]);
};

const resetToDefaults = () => {
  uni.showModal({
    title: '提示',
    content: '确定是否恢复默认初始设置？',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        applyDefaultSettings();
      }
    },
  });
};

const applyDefaultSettings = async () => {
  const params = createDeviceParams({
    pids: [
      { pid: PID_CONFIG.CLEANING_MODE, sid: 0 },
      { pid: PID_CONFIG.CLEANING_MODE_TIME, sid: 0 },
      { pid: PID_CONFIG.AUTO_FLUSH, sid: 0 },
      { pid: PID_CONFIG.TIMEOUT_CLOSE, sid: 0 },
    ],
  });

  const res = await resetDevicePid(params);
  feedbackResult(res);
  handleDevicePidResponse(res);
};

// 反馈结果
function feedbackResult(res) {
  if (res.code === 0) {
    uni.showToast({ icon: 'success', title: '操作成功', duration: 500 });
  } else {
    uni.showToast({ icon: 'error', title: '操作失败', duration: 500 });
  }
}

// ========== 感应距离流程逻辑 ==========
// 页面级主题消息处理变量
const pageMessage = ref(null);
handleReportTopicResponse = (messageData, topic) => {
  pageMessage.value = messageData;
};

// 感应距离流程状态：idle -> sending -> waiting -> success/failed
const distanceState = ref('idle');
let distanceTimer = null;
const showDistance = ref(false);
const primaryDisabled = computed(() => distanceState.value === 'sending' || distanceState.value === 'waiting');
const closeDisabled = computed(() => distanceState.value === 'sending' || distanceState.value === 'waiting');
const distancePrimaryText = computed(() => {
  if (distanceState.value === 'idle') return '开始';
  if (distanceState.value === 'failed') return '重新开始';
  if (distanceState.value === 'success') return '完成';
  return '进行中';
});

// 打开感应距离弹窗
const openDistanceModal = () => {
  distanceState.value = 'idle';
  showDistance.value = true;
};

const onDistancePrimary = () => {
  if (distanceState.value === 'idle' || distanceState.value === 'failed') {
    startDistanceCalibration();
    return;
  }
  if (distanceState.value === 'success') {
    onDistanceClose();
  }
};

const onDistanceClose = () => {
  if (closeDisabled.value) return;
  clearDistanceTimer();
  cleanupWatchListeners(); // 关闭弹窗时清理 watch
  showDistance.value = false;
};

// —— 本次流程临时监听/定时器句柄 —— //

let pidHandler = null; // 监听 olt/report/pid/${did}
let globalWSatchStop = null; // globalTopicInfo 的 watch 停止函数
let pageMessageWatchStop = null; // pageMessage 的 watch 停止函数

const cleanupPidListener = () => {
  if (pidHandler) {
    mqttClient.off && mqttClient.off('message', pidHandler);
    pidHandler = null;
  }
};

const cleanupWatchListeners = () => {
  // 清理 globalTopicInfo 的 watch
  if (globalWSatchStop) {
    globalWSatchStop();
    globalWSatchStop = null;
  }
  // 清理 pageMessage 的 watch
  if (pageMessageWatchStop) {
    pageMessageWatchStop();
    pageMessageWatchStop = null;
  }
};

onUnmounted(() => {
  cleanupPidListener();
  cleanupWatchListeners();
  clearDistanceTimer();
});

const startDistanceCalibration = async () => {
  distanceState.value = 'sending';

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
        fid: 4097,
        val: 1,
      },
    };
    const res = await setSensingDistance(params);
    if (res.code === 0) {
      const waitMs = res.waitTime || 5000;

      // 防重入：清理残留监听
      cleanupPidListener();
      cleanupWatchListeners(); // 清理之前的 watch 监听器
      // 启动超时兜底，只在 waiting 期间有效
      startDistanceTimer(waitMs);

      // 监听全局主题消息
      const { globalTopicInfo } = storeToRefs(useStore());
      globalWSatchStop = watch(
        globalTopicInfo,
        (newVal) => {
          console.log('阶段1：', newVal);
          if (newVal?.seq === seq) {
            if (newVal?.result == 1) {
              distanceState.value = 'waiting';
            } else {
              distanceState.value = 'failed';
              clearDistanceTimer();
              cleanupWatchListeners(); // 处理完成后清理 watch
            }
          }
        },
        { deep: true, immediate: false }
      );
      pageMessageWatchStop = watch(
        pageMessage,
        (newV) => {
          console.log('阶段2：', newV);
          if (newV?.topic === reportTopic) {
            const pids = newV?.params?.properties?.pids || [];
            if (Array.isArray(pids) && pids.some((item) => item.pid == 61)) {
              distanceState.value = 'success';
              clearDistanceTimer();
              cleanupWatchListeners(); // 处理完成后清理 watch
            }
          }
        },
        { deep: true, immediate: false }
      );
    } else {
      distanceState.value = 'failed';
    }
  } catch (error) {
    distanceState.value = 'failed';
    console.error('距离校准指令发送失败', error);
  }
};

const startDistanceTimer = (time) => {
  clearDistanceTimer();
  // 例如 20s 超时失败
  distanceTimer = setTimeout(() => {
    if (['waiting', 'sending'].includes(distanceState.value)) {
      distanceState.value = 'failed';
      cleanupWatchListeners(); // 超时失败时也清理 watch
    }
  }, time || 20000);
};

const clearDistanceTimer = () => {
  if (distanceTimer) {
    clearTimeout(distanceTimer);
    distanceTimer = null;
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

.mqtt-status {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  color: #6b7280;
}

.debug-btn {
  margin-left: 16rpx;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  background: #f0f0f0;
  border-radius: 8rpx;
  cursor: pointer;
}
.switch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 52rpx 0;
}
.primary-btn {
  height: 72rpx;
  width: 270rpx;
  border-radius: 112rpx;
  background: #ffffff;
  color: #3b3b3b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  box-shadow: 0 10rpx 26rpx rgba(0, 0, 0, 0.06);
}
.primary-btn.active {
  background: #6a4f40;
  color: #fff;
  box-shadow: 0 10rpx 26rpx rgba(0, 0, 0, 0.06);
}
.m-faucet {
  font-size: 28rpx;
  margin-right: 10rpx;
  color: #3b3b3b;
}
.primary-btn.active .m-faucet {
  color: #fff;
}
.settings-card {
  margin-top: 32rpx;
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

.label.dot::after {
  content: '';
  display: inline-block;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #ff3b30;
  margin-left: 8rpx;
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
