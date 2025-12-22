<template>
  <view class="page">
    <view class="page-bg">
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
              总用水量：
              <text class="status-amount">{{ productModelDetails.waterTotal }}L</text>
            </text>
          </view>
        </view>
      </view>

      <!-- 小冲器设置属性区（样式沿用 faucet） -->
      <view class="card settings-card">
        <!-- 主操作按钮：冲洗开关（前端模拟） -->
        <view class="switch-btn">
          <view :class="['primary-btn', { active: waterOn }]" @click="toggleWater">
            <text class="font_family m-faucet">&#xe62f;</text>
            冲洗开关
          </view>
        </view>
        <view class="divider"></view>

        <!-- 设置列表 -->
        <view class="list">
          <!-- 恢复默认配置 -->
          <view class="list-item" @click="resetToDefaults">
            <view class="label">恢复默认配置</view>
            <view class="extra value">
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <!-- 清洁模式 -->
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

          <!-- 清洁模式时间） -->
          <view class="list-item">
            <view :class="['label', { dot: cleanTimeWarn }]" @click="handlePidTip('cleanTime')">清洁模式时间</view>
            <view class="extra value" @click="openCleanTimePopup">
              <text>{{ cleanModeTime }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <!-- 自动冲洗时间 -->
          <view class="list-item">
            <view :class="['label', { dot: autoFlushWarn }]" @click="handlePidTip('autoFlush')">自动冲洗时间</view>
            <view class="extra value" @click="openAutoFlushPicker">
              <text>{{ autoFlushTime }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>

          <!-- 感应冲洗时间 -->
          <view class="list-item">
            <view :class="['label', { dot: senseFlushWarn }]" @click="handlePidTip('senseFlush')">感应冲洗时间</view>
            <view class="extra value" @click="openSenseFlushPopup">
              <text>{{ senseStageOneTime }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <!-- 感应距离（结构与 faucet 一致） -->
          <view class="list-item" @click="openDistanceModal">
            <view class="label">感应距离</view>
            <view class="extra value">
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 清洁模式时间弹窗 -->
      <up-popup :show="showFlushPopup" :round="10" mode="bottom" :closeOnClickOverlay="false" @close="closePopup">
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
          <view class="description">清洁模式期间，感应功能将关闭，您可以在这段时间进行清洁等活动设置范围在1-30MIN</view>
        </view>
      </up-popup>

      <!-- 感应冲洗时间弹窗 -->
      <up-popup
        :show="showSenseFlushPopup"
        :round="10"
        mode="bottom"
        :closeOnClickOverlay="false"
        @close="closeSenseFlushPopup">
        <view class="popup-content sense-popup">
          <view class="title-row">
            <view class="action-btn action-cancel" @click="closeSenseFlushPopup">取消</view>
            <view class="title">感应冲洗时间</view>
            <view class="action-btn action-confirm" @click="confirmSenseFlushTime">确定</view>
          </view>

          <view class="sense-section">
            <view class="number-row sense-row">
              <up-number-box v-model="tempSenseStageOne" :min="1" :max="10" :step="1">
                <template #minus>
                  <view class="circle-btn">
                    <up-icon name="minus" size="14" color="#909399"></up-icon>
                  </view>
                </template>
                <template #input>
                  <text class="value-text sense-value">{{ tempSenseStageOne }}</text>
                </template>
                <template #plus>
                  <view class="circle-btn">
                    <up-icon name="plus" size="14" color="#909399"></up-icon>
                  </view>
                </template>
              </up-number-box>
            </view>
            <view class="unit sense-unit">S</view>
          </view>

          <view class="sense-note">冲洗时间设置范围在0-10S</view>
        </view>
      </up-popup>

      <!-- 自动冲洗时间弹窗 -->
      <up-picker
        :show="showAutoFlushPicker"
        :columns="autoFlushColumns"
        title="选择自动冲洗时间"
        :defaultIndex="autoFlushDefault"
        @confirm="confirmAutoFlush"
        @cancel="showAutoFlushPicker = false"></up-picker>
      <!-- 冲水段数配置弹窗   -->
      <up-picker
        :show="showWaterSegmentConfigPicker"
        :columns="waterSegmentConfigColumns"
        title="选择冲水段数配置"
        :defaultIndex="waterSegmentConfigDefault"
        @confirm="confirmWaterSegmentConfig"
        @cancel="showWaterSegmentConfigPicker = false"></up-picker>

      <!-- 感应距离弹窗（三步状态机，前端模拟流程） -->
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
            <view class="distance-title" v-if="distanceState === 'idle'">确定要重新设置对小冲器的红外距离吗？</view>
            <view class="distance-sub" v-if="distanceState === 'idle'">提示：现有红外距离将无效</view>

            <view class="distance-title" v-if="distanceState === 'sending'">指令发送中...</view>
            <view class="distance-sub" v-if="distanceState === 'sending'">请稍候，不要关闭页面</view>

            <view class="distance-title" v-if="distanceState === 'waiting'">请在设备闪烁中进入调试</view>
            <view class="distance-sub" v-if="distanceState === 'waiting'">直到设备闪烁五下</view>

            <view class="distance-title success" v-if="distanceState === 'success'">
              设置完成，红外距离已更新，请自行感受距离是否合适？
            </view>
            <view class="distance-sub" v-if="distanceState === 'success'">如不合适，请重新配置</view>

            <view class="distance-title failed" v-if="distanceState === 'failed'">指令发送失败，请稍后重试。</view>
            <view class="distance-sub" v-if="distanceState === 'failed'">请检查设备状态或稍后重试</view>
          </view>

          <!-- 操作区 -->
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
// ==================== 工具函数 ====================
const mqttUserInfo = uni.getStorageSync('mqttUserInfo');
const clientId = mqttUserInfo?.clientId || '';
// 提取字符串中的数字
const extractNumber = (str) => {
  if (str == null) return '';
  const match = String(str).match(/\d+/);
  return match ? Number(match[0]) : '';
};

// 设备相关
const device = ref('');
const status = ref('0');
const statusName = ref('离线');
const waterOn = ref(false);
const productModelDetails = ref({});

// ==================== 常量配置 ====================
const DEVICE_STATUS = ['离线', '在线', '故障'];

const DEVICE_CONFIG = {
  dst: '011025092402001D',
  did: '0111250924030004',
  dirDid: '011025092402001D',
};
let reportTopic = '';

const DEFAULT_SETTINGS = {
  cleaningMode: false,
  cleanMinutes: 3,
  autoFlushTime: '24H',
  senseStageOne: 1,
};

// 自动冲洗时间:'14'
// 一段冲洗时间:'17'
// 清洁模式时间:'35'
// 清洁模式:'53'
const PID_CONFIG = {
  AUTO_FLUSH: '14',
  SENSE_STAGE_ONE: '17',
  CLEANING_MODE_TIME: '35',
  CLEANING_MODE: '53',
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
  [PID_CONFIG.SENSE_STAGE_ONE]: (val) => {
    senseStageOne.value = val;
  },
};

// 根据返回的状态，红点提示'命令已下发，设备处于休眠状态。'
const pidStatusMap = reactive({});
const isPidWarn = (pid) => {
  const status = pidStatusMap[pid];
  return status == 1;
};

const cleaningModeWarn = computed(() => isPidWarn(PID_CONFIG.CLEANING_MODE));
const cleanTimeWarn = computed(() => isPidWarn(PID_CONFIG.CLEANING_MODE_TIME));
const autoFlushWarn = computed(() => isPidWarn(PID_CONFIG.AUTO_FLUSH));
const senseFlushWarn = computed(() => isPidWarn(PID_CONFIG.SENSE_STAGE_ONE));
const handlePidTip = (type) => {
  const warnMap = {
    cleaningMode: cleaningModeWarn,
    cleanTime: cleanTimeWarn,
    autoFlush: autoFlushWarn,
    senseFlush: senseFlushWarn,
  };
  const warnRef = warnMap[type];
  if (!warnRef || !warnRef.value) return;
  const message = '命令已下发，设备处于休眠状态。';
  uni.showToast({ title: message, icon: 'none' });
};

// 清洁模式
const cleaningMode = ref(DEFAULT_SETTINGS.cleaningMode);
const updateCleaningMode = async () => {
  const params = createControlParams({
    did: DEVICE_CONFIG.did,
    sid: 0,
    fid: 4098,
    val: cleaningMode.value ? 1 : 0,
  });
  const res = await ctrlDevice(params);
  feedbackResult(res);
};

// 清洁模式时间
const cleanMinutes = ref(DEFAULT_SETTINGS.cleanMinutes);
const tempCleanMinutes = ref(3); // 弹窗内临时调整的清洁模式时间
const cleanModeTime = computed(() => `${cleanMinutes.value}MIN`);

const showFlushPopup = ref(false);
const openCleanTimePopup = () => {
  // 打开弹窗时，用当前已生效的时间初始化临时值，避免列表跟随变化
  tempCleanMinutes.value = cleanMinutes.value;
  showFlushPopup.value = true;
};
const closePopup = () => {
  showFlushPopup.value = false;
};
const confirmCleanTime = () => {
  cleanMinutes.value = tempCleanMinutes.value;
  closePopup();
  writeDevicePidValue([{ pid: PID_CONFIG.CLEANING_MODE_TIME, val: cleanMinutes.value }]);
};

// 自动冲洗时间
const autoFlushOptions = ['0H', '12H', '24H', '48H', '72H'];
const autoFlushTime = ref(DEFAULT_SETTINGS.autoFlushTime);
const showAutoFlushPicker = ref(false);
const autoFlushColumns = ref([autoFlushOptions]);
const autoFlushDefault = ref([Math.max(0, autoFlushOptions.indexOf(autoFlushTime.value))]);
const openAutoFlushPicker = () => {
  const currentIndex = autoFlushOptions.indexOf(autoFlushTime.value);
  autoFlushDefault.value = [currentIndex === -1 ? 0 : currentIndex];
  showAutoFlushPicker.value = true;
};

const confirmAutoFlush = ({ value }) => {
  if (value && value.length) {
    autoFlushTime.value = value[0];
  }
  writeDevicePidValue([{ pid: PID_CONFIG.AUTO_FLUSH, val: extractNumber(autoFlushTime.value) }]); // 写入设备PID值
  showAutoFlushPicker.value = false;
};

// 感应冲洗时间弹窗
const senseStageOne = ref(DEFAULT_SETTINGS.senseStageOne);
const tempSenseStageOne = ref(DEFAULT_SETTINGS.senseStageOne);
const senseStageOneTime = computed(() => `${senseStageOne.value}S`);

const showSenseFlushPopup = ref(false);
const openSenseFlushPopup = () => {
  // 打开弹窗时，用当前已生效的值初始化临时值，避免列表跟随变化
  tempSenseStageOne.value = senseStageOne.value;
  showSenseFlushPopup.value = true;
};
const closeSenseFlushPopup = () => {
  showSenseFlushPopup.value = false;
};
const confirmSenseFlushTime = () => {
  // 点击确定时才将临时值写回实际值，并下发到设备
  senseStageOne.value = tempSenseStageOne.value;
  showSenseFlushPopup.value = false;
  writeDevicePidValue([{ pid: PID_CONFIG.SENSE_STAGE_ONE, val: senseStageOne.value }]);
};

// ==================== 设备控制 ====================

// 创建控制功能请求参数
const createControlParams = (params) => ({
  dst: DEVICE_CONFIG.dst,
  seq: generateRandomSeq(),
  src: clientId,
  ver: 'V1.0',
  params: params,
});

const toggleWater = async () => {
  waterOn.value = true;
  setTimeout(() => {
    waterOn.value = false;
  }, 1000);
  const params = createControlParams({
    did: DEVICE_CONFIG.did,
    sid: 0,
    fid: 4097,
    val: 1,
  });
  const res = await ctrlDevice(params);
  feedbackResult(res);
};

const applyDefaultSettings = async () => {
  const params = createDeviceParams({
    pids: [
      { pid: PID_CONFIG.CLEANING_MODE, sid: 0 },
      { pid: PID_CONFIG.CLEANING_MODE_TIME, sid: 0 },
      { pid: PID_CONFIG.AUTO_FLUSH, sid: 0 },
      { pid: PID_CONFIG.SENSE_STAGE_ONE, sid: 0 },
    ],
  });

  const res = await resetDevicePid(params);
  feedbackResult(res);
  handleDevicePidResponse(res);
};

// 恢复默认配置（仅重置前端状态）
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

// 页面级主题消息处理函数
let handleReportTopicResponse = null;
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
  reportTopic = `olt/report/pid/${DEVICE_CONFIG.did}`;
  // 阶段2：订阅并仅监听一次设备报告主题
  mqttClient.registerPageTopicHandler(reportTopic, handleReportTopicResponse);
  await Promise.all([readDevicePidValues(), loadProductModelDetails()]);
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

// 读取设备PID值
const readDevicePidValues = async () => {
  try {
    const params = createDeviceParams({
      pids: [
        { pid: PID_CONFIG.CLEANING_MODE, sid: 0 },
        { pid: PID_CONFIG.CLEANING_MODE_TIME, sid: 0 },
        { pid: PID_CONFIG.AUTO_FLUSH, sid: 0 },
        { pid: PID_CONFIG.SENSE_STAGE_ONE, sid: 0 },
      ],
    });

    const res = await readDevicePidVal(params);
    const { pids = [] } = res.data || {};
    pids.forEach((item) => {
      const pidKey = String(item.pid);
      pidStatusMap[pidKey] = item.status;
    });
    handleDevicePidResponse(res);
    console.log(`读取PID 结果:`, res);
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
  font-size: 32rpx;
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

.sense-popup {
  padding-bottom: 60rpx;
}
.sense-section {
  margin-top: 60rpx;
}
.section-title {
  font-size: 30rpx;
  text-align: center;
  color: #303133;
}
.sense-row {
  margin-top: 30rpx;
}
.sense-unit {
  font-size: 32rpx;
  letter-spacing: 4rpx;
  color: #909399;
  text-align: center;
}
.sense-divider {
  height: 2rpx;
  background: #f1f2f5;
  margin: 40rpx 0 20rpx;
}
.sense-note {
  margin-top: 48rpx;
  font-size: 24rpx;
  color: #b8bcc6;
  text-align: center;
}

/* 感应距离弹窗样式 */
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
