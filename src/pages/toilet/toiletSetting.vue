<template>
  <view class="page">
    <view class="page-bg">
      <!-- 设置卡片 1 -->
      <view class="card settings-card">
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
              <up-switch v-model="cleaningMode" size="20" activeColor="#5a4a3f" @change="updateCleaningMode" />
            </view>
          </view>
          <view class="divider"></view>

          <view class="list-item">
            <view :class="['label', { dot: energySavingWarn }]" @click="handlePidTip('energySaving')">节能模式</view>
            <view class="extra">
              <up-switch v-model="energySaving" size="20" activeColor="#5a4a3f" @change="updateEnergySaving" />
            </view>
          </view>
          <view class="divider"></view>

          <view class="list-item">
            <view :class="['label', { dot: seasonModeWarn }]" @click="handlePidTip('seasonMode')">四季温感模式</view>
            <view class="extra">
              <up-switch v-model="seasonMode" size="20" activeColor="#5a4a3f" @change="updateSeasonMode" />
            </view>
          </view>
          <view class="divider"></view>

          <view class="list-item">
            <view :class="['label', { dot: silentModeWarn }]" @click="handlePidTip('silentMode')">静音</view>
            <view class="extra">
              <up-switch v-model="silentMode" size="20" activeColor="#5a4a3f" @change="updateSilentMode" />
            </view>
          </view>
        </view>
      </view>

      <!-- 设置卡片 2 -->
      <view class="card settings-card">
        <view class="list">
          <view class="list-item">
            <view :class="['label', { dot: preWetWarn }]" @click="handlePidTip('preWet')">预湿润</view>
            <view class="extra">
              <up-switch v-model="preWet" size="20" activeColor="#5a4a3f" @change="updatePreWet" />
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view :class="['label', { dot: autoFlushSeatWarn }]" @click="handlePidTip('autoFlushSeat')">
              离座自动冲水
            </view>
            <view class="extra">
              <up-switch v-model="autoFlushSeat" size="20" activeColor="#5a4a3f" @change="updateAutoFlushSeat" />
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view :class="['label', { dot: autoMaleFlushWarn }]" @click="handlePidTip('autoMaleFlush')">
              自动男士小便冲
            </view>
            <view class="extra">
              <up-switch v-model="autoMaleFlush" size="20" activeColor="#5a4a3f" @change="updateAutoMaleFlush" />
            </view>
          </view>
        </view>
      </view>

      <!-- 设置卡片 3 -->
      <view class="card settings-card mb-150">
        <view class="list">
          <view class="list-item" @click="openTempPopup">
            <view :class="['label', { dot: tempUnitWarn }]" @click="handlePidTip('tempUnit')">温度单位</view>
            <view class="extra value">
              <text>{{ tempUnit }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view :class="['label', { dot: flushVolumeWarn }]" @click="handlePidTip('flushVolume')">冲水量</view>
            <view class="extra value">
              <up-picker-data
                v-model="flushVolumeValue"
                title="请选择风量模式"
                :options="flushVolumeOptions"
                valueKey="id"
                labelKey="label"
                @confirm="confirmFlushVolume">
                <template #trigger="{ current }">
                  <view class="picker-text">{{ current || '一档' }}</view>
                </template>
              </up-picker-data>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view :class="['label', { dot: autoLidWarn }]" @click="handlePidTip('autoLid')">自动翻盖</view>
            <view class="extra">
              <up-switch v-model="autoLid" size="20" activeColor="#5a4a3f" @change="updateAutoLid" />
            </view>
          </view>
          <view class="divider"></view>
          <!-- <view class="list-item" @click="openLaserPopup">
            <view :class="['label', { dot: laserTypeWarn }]" @click="handlePidTip('laserType')">激光模式</view>
            <view class="extra value">
              <text>{{ getLaserTypeText() }}</text>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view> -->
          <view class="list-item">
            <view :class="['label', { dot: microwaveValueWarn }]" @click="handlePidTip('microwaveValue')">
              微波模式
            </view>
            <view class="extra value">
              <up-picker-data
                v-model="microwaveValue"
                title="请选择微波模式"
                :options="microwaveOptions"
                valueKey="id"
                labelKey="label"
                @confirm="confirmMicrowave">
                <template #trigger="{ current }">
                  <view class="picker-text">{{ current || '一档' }}</view>
                </template>
              </up-picker-data>
              <text class="font_family m-arrow arrow">&#xe60d;</text>
            </view>
          </view>
          <view class="divider"></view>
          <view class="list-item">
            <view :class="['label', { dot: footLidWarn }]" @click="handlePidTip('footLid')">脚感翻盖</view>
            <view class="extra">
              <up-switch v-model="footLid" size="20" activeColor="#5a4a3f" @change="updateFootLid" />
            </view>
          </view>
        </view>
      </view>

      <!-- 温度单位弹窗（自定义分段选择） -->
      <up-popup :show="showTemp" :round="10" mode="bottom" @close="showTemp = false">
        <view class="popup-content">
          <view class="title-row">
            <view class="action-btn action-cancel" @click="showTemp = false">取消</view>
            <view class="title">温度单位</view>
            <view class="action-btn action-confirm" @click="confirmTemp">确定</view>
          </view>
          <view class="seg-toggle">
            <view :class="['seg-opt', { active: tempDraft === '℃' }]" @click="tempDraft = '℃'">℃</view>
            <view :class="['seg-opt', { active: tempDraft === '℉' }]" @click="tempDraft = '℉'">℉</view>
          </view>
        </view>
      </up-popup>

      <!-- 激光模式弹窗 -->
      <up-popup :show="showLaser" :round="10" mode="bottom" @close="cancelLaser">
        <view class="popup-content">
          <view class="title-row">
            <view class="action-btn action-cancel" @click="cancelLaser">取消</view>
            <view class="title">激光模式</view>
            <view class="action-btn action-confirm" @click="confirmLaser">确定</view>
          </view>
          <!-- 等级选择器 -->
          <view class="level-selector">
            <view class="arrow-btn" @click="decreaseLaserLevel">
              <text class="arrow-icon">‹</text>
            </view>
            <view class="level-display">{{ laserTempDraft }}</view>
            <view class="arrow-btn" @click="increaseLaserLevel">
              <text class="arrow-icon">›</text>
            </view>
          </view>
          <view class="description">感应距离三挡可调</view>
          <!-- 分段控件 -->
          <view class="seg-row">
            <view :class="['seg', { active: laserLevel === 0 }]" @click="laserLevel = 0">开盖</view>
            <view :class="['seg', { active: laserLevel === 1 }]" @click="laserLevel = 1">开关盖</view>
          </view>
        </view>
      </up-popup>
    </view>
  </view>
</template>
<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { useStore } from '@/stores/globalMqttInfo';
import { ctrlDevice, resetDevicePid, readDevicePidVal, writeDevicePid, setSensingDistance } from '@/api/mqttCommon';
import { generateRandomSeq } from '@/utils/common';
const mqttClient = getApp().globalData.mqttService;
// ==================== 工具函数 ====================
const mqttUserInfo = uni.getStorageSync('mqttUserInfo');
const clientId = mqttUserInfo?.clientId || '';

const device = ref({});
// 页面级主题消息处理函数
let handleReportTopicResponse = null;
onLoad(async (options) => {
  const deviceData = options.device;
  if (deviceData) {
    const data = JSON.parse(decodeURIComponent(deviceData));
    device.value = data;
    DEVICE_CONFIG.did = data.did;
    DEVICE_CONFIG.dst = data.dirDid;
    DEVICE_CONFIG.dirDid = data.dirDid;
  }
  reportTopic = `olt/report/pid/${DEVICE_CONFIG.did}`;
  // 阶段2：订阅并仅监听一次设备报告主题
  mqttClient.registerPageTopicHandler(reportTopic, handleReportTopicResponse);
  readDevicePidValues();
});

// ==================== 常量配置 ====================
const DEVICE_CONFIG = {
  dst: '011025092402001D',
  did: '0111250924030004',
  dirDid: '011025092402001D',
};
let reportTopic = '';

// 基本设置
const cleaningMode = ref(false);
const energySaving = ref(false);
const seasonMode = ref(false);
const silentMode = ref(false);

const preWet = ref(false);
const autoFlushSeat = ref(false);
const autoMaleFlush = ref(false);
const tempUnit = ref('℃');
const flushVolumeValue = ref(0);
const autoLid = ref(false);
const laserLevel = ref(0); // '开盖' : '开关盖' 在弹窗内的临时选择值，取消时不落盘
const microwaveValue = ref(0);
const footLid = ref(false);

// 清洁模式 53
// 节能模式 23
// 四季温感模式 24
// 静音 25
// 除臭
// 过流UVC杀菌
// 预湿润 29
// 离座自动冲水 30
// 自动男士小便冲 31
// 温度单位 36
// 冲水量 37
// 自动翻盖 32
// 激光模式档位 39
// 激光模式 40
// 微波模式 38
// 脚感翻盖 33
const PID_CONFIG = {
  CLEANING_MODE: '53',
  ENERGY_SAVING: '23',
  SEASON_MODE: '24',
  SILENT: '25',

  UVC_STERILIZATION: '27',
  PRE_WET: '29',
  AUTO_FLUSH_SEAT: '30',
  AUTO_MALE_FLUSH: '31',
  TEMP_UNIT: '36',
  FLUSH_VOLUME: '37',
  AUTO_LID: '32',
  LASER_MODE_LEVEL: '39',
  LASER_MODE: '40',
  MICrowave_MODE: '38',
  FOOT_LID: '33',
};
// PID 值处理映射
const pidHandlers = {
  [PID_CONFIG.CLEANING_MODE]: (val) => {
    cleaningMode.value = Number(val) === 1;
  },
  [PID_CONFIG.ENERGY_SAVING]: (val) => {
    energySaving.value = Number(val) === 1;
  },
  [PID_CONFIG.SEASON_MODE]: (val) => {
    seasonMode.value = Number(val) === 1;
  },
  [PID_CONFIG.SILENT]: (val) => {
    silentMode.value = Number(val) === 1;
  },

  [PID_CONFIG.PRE_WET]: (val) => {
    preWet.value = Number(val) === 1;
  },
  [PID_CONFIG.AUTO_FLUSH_SEAT]: (val) => {
    autoFlushSeat.value = Number(val) === 1;
  },
  [PID_CONFIG.AUTO_MALE_FLUSH]: (val) => {
    autoMaleFlush.value = Number(val) === 1;
  },
  [PID_CONFIG.TEMP_UNIT]: (val) => {
    tempUnit.value = val === 0 ? '℃' : '℉';
  },
  [PID_CONFIG.FLUSH_VOLUME]: (val) => {
    flushVolumeValue.value = val;
  },
  [PID_CONFIG.AUTO_LID]: (val) => {
    autoLid.value = Number(val) === 1;
  },
  [PID_CONFIG.LASER_MODE_LEVEL]: (val) => {
    laserTempLevel.value = laserLevels[Number(val)];
  },
  [PID_CONFIG.LASER_MODE]: (val) => {
    laserType.value = Number(val);
  },
  [PID_CONFIG.MICrowave_MODE]: (val) => {
    microwaveValue.value = Number(val);
  },
  [PID_CONFIG.FOOT_LID]: (val) => {
    footLid.value = Number(val) === 1;
  },
};

// 根据返回的状态，红点提示'命令已下发，设备处于休眠状态。'
const pidStatusMap = reactive({});
const isPidWarn = (pid) => {
  const status = pidStatusMap[pid];
  return status == 1;
};

const cleaningModeWarn = computed(() => isPidWarn(PID_CONFIG.CLEANING_MODE));
const energySavingWarn = computed(() => isPidWarn(PID_CONFIG.ENERGY_SAVING));
const seasonModeWarn = computed(() => isPidWarn(PID_CONFIG.SEASON_MODE));
const silentModeWarn = computed(() => isPidWarn(PID_CONFIG.SILENT));
const preWetWarn = computed(() => isPidWarn(PID_CONFIG.PRE_WET));
const autoFlushSeatWarn = computed(() => isPidWarn(PID_CONFIG.AUTO_FLUSH_SEAT));
const autoMaleFlushWarn = computed(() => isPidWarn(PID_CONFIG.AUTO_MALE_FLUSH));
const tempUnitWarn = computed(() => isPidWarn(PID_CONFIG.TEMP_UNIT));
const flushVolumeWarn = computed(() => isPidWarn(PID_CONFIG.FLUSH_VOLUME));
const autoLidWarn = computed(() => isPidWarn(PID_CONFIG.AUTO_LID));
const laserTempLevelWarn = computed(() => isPidWarn(PID_CONFIG.LASER_MODE_LEVEL));
const laserTypeWarn = computed(() => isPidWarn(PID_CONFIG.LASER_MODE));
const microwaveValueWarn = computed(() => isPidWarn(PID_CONFIG.MICrowave_MODE));
const footLidWarn = computed(() => isPidWarn(PID_CONFIG.FOOT_LID));
const handlePidTip = (type) => {
  const warnMap = {
    cleaningMode: cleaningModeWarn,
    energySaving: energySavingWarn,
    seasonMode: seasonModeWarn,
    silentMode: silentModeWarn,
    preWet: preWetWarn,
    autoFlushSeat: autoFlushSeatWarn,
    autoMaleFlush: autoMaleFlushWarn,
    tempUnit: tempUnitWarn,
    flushVolume: flushVolumeWarn,
    autoLid: autoLidWarn,
    laserTempLevel: laserTempLevelWarn,
    laserType: laserTypeWarn,
    microwaveValue: microwaveValueWarn,
    footLid: footLidWarn,
  };
  const warnRef = warnMap[type];
  if (!warnRef || !warnRef.value) return;
  const message = '命令已下发，设备处于休眠状态。';
  uni.showToast({ title: message, icon: 'none' });
};

// 创建控制功能请求参数
const createControlParams = (params) => ({
  dst: DEVICE_CONFIG.dst,
  seq: generateRandomSeq(),
  src: clientId,
  ver: 'V1.0',
  params: params,
});

// 清洁模式
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

// 节能模式
const updateEnergySaving = async () => {
  const val = energySaving.value ? 1 : 0;
  writeDevicePidValue([{ pid: PID_CONFIG.ENERGY_SAVING, val: val }]); // 写入设备PID值
};

// 四季温感模式
const updateSeasonMode = async () => {
  const val = seasonMode.value ? 1 : 0;
  writeDevicePidValue([{ pid: PID_CONFIG.SEASON_MODE, val: val }]); // 写入设备PID值
};
// 静音
const updateSilentMode = async () => {
  const val = silentMode.value ? 1 : 0;
  writeDevicePidValue([{ pid: PID_CONFIG.SILENT, val: val }]); // 写入设备PID值
};

// 预湿润
const updatePreWet = async () => {
  const val = preWet.value ? 1 : 0;
  writeDevicePidValue([{ pid: PID_CONFIG.PRE_WET, val: val }]); // 写入设备PID值
};
// 离座自动冲水
const updateAutoFlushSeat = async () => {
  const val = autoFlushSeat.value ? 1 : 0;
  writeDevicePidValue([{ pid: PID_CONFIG.AUTO_FLUSH_SEAT, val: val }]); // 写入设备PID值
};
// 自动男士小便冲
const updateAutoMaleFlush = async () => {
  const val = autoMaleFlush.value ? 1 : 0;
  writeDevicePidValue([{ pid: PID_CONFIG.AUTO_MALE_FLUSH, val: val }]); // 写入设备PID值
};

// 自动翻盖
const updateAutoLid = async () => {
  const val = autoLid.value ? 1 : 0;
  writeDevicePidValue([{ pid: PID_CONFIG.AUTO_LID, val: val }]); // 写入设备PID值
};

// 脚感翻盖
const updateFootLid = async () => {
  const val = footLid.value ? 1 : 0;
  writeDevicePidValue([{ pid: PID_CONFIG.FOOT_LID, val: val }]); // 写入设备PID值
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
        { pid: PID_CONFIG.ENERGY_SAVING, sid: 0 },
        { pid: PID_CONFIG.SEASON_MODE, sid: 0 },
        { pid: PID_CONFIG.SILENT, sid: 0 },

        { pid: PID_CONFIG.UVC_STERILIZATION, sid: 0 },
        { pid: PID_CONFIG.PRE_WET, sid: 0 },
        { pid: PID_CONFIG.AUTO_FLUSH_SEAT, sid: 0 },
        { pid: PID_CONFIG.AUTO_MALE_FLUSH, sid: 0 },
        { pid: PID_CONFIG.TEMP_UNIT, sid: 0 },
        { pid: PID_CONFIG.FLUSH_VOLUME, sid: 0 },
        { pid: PID_CONFIG.AUTO_LID, sid: 0 },

        { pid: PID_CONFIG.MICrowave_MODE, sid: 0 },
        { pid: PID_CONFIG.FOOT_LID, sid: 0 },
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

// 反馈结果
function feedbackResult(res) {
  if (res.code === 0) {
    uni.showToast({ icon: 'success', title: '操作成功', duration: 500 });
  } else {
    uni.showToast({ icon: 'error', title: '操作失败', duration: 500 });
  }
}

// 风量模式
const flushVolumeOptions = [
  {
    label: '一挡',
    id: 0,
  },
  {
    label: '二挡',
    id: 1,
  },
  {
    label: '三挡',
    id: 2,
  },
];
const confirmFlushVolume = () => {
  writeDevicePidValue([{ pid: PID_CONFIG.FLUSH_VOLUME, val: flushVolumeValue.value }]); // 写入设备PID值
};

// 微波模式
const microwaveOptions = [
  {
    label: '一挡',
    id: 0,
  },
  {
    label: '二挡',
    id: 1,
  },
  {
    label: '三挡',
    id: 2,
  },
];

const confirmMicrowave = () => {
  writeDevicePidValue([{ pid: PID_CONFIG.MICrowave_MODE, val: microwaveValue.value }]); // 写入设备PID值
};

// 温度单位弹窗
const showTemp = ref(false);
const tempDraft = ref('℃');
const openTempPopup = () => {
  tempDraft.value = tempUnit.value;
  showTemp.value = true;
};
const confirmTemp = () => {
  tempUnit.value = tempDraft.value;
  writeDevicePidValue([{ pid: PID_CONFIG.TEMP_UNIT, val: tempUnit.value === '℃' ? 0 : 1 }]); // 写入设备PID值  0:'℃' 或 1:'℉'
  showTemp.value = false;
};

// 激光模式
const showLaser = ref(false);
const laserType = ref(0); // 0:'开盖' 或 1:'开关盖'
// 持久化的激光感应等级
const laserTempLevel = ref('二挡');
// 弹窗内的临时选择值，取消时不落盘
const laserTempDraft = ref('二挡');
const laserLevels = ['一挡', '二挡', '三挡'];

// 激光模式：0:'开盖' 或 1:'开关盖'
const openLaserPopup = () => {
  // 打开弹窗时同步当前持久化的激光类型到临时值
  laserLevel.value = laserType.value === 0 || laserType.value === 1 ? laserType.value : 0;
  // 打开弹窗时同步当前持久化等级到草稿
  laserTempDraft.value = laserTempLevel.value;
  showLaser.value = true;
};

const decreaseLaserLevel = () => {
  const currentIndex = laserLevels.indexOf(laserTempDraft.value);
  if (currentIndex > 0) {
    laserTempDraft.value = laserLevels[currentIndex - 1];
  }
};

const increaseLaserLevel = () => {
  const currentIndex = laserLevels.indexOf(laserTempDraft.value);
  if (currentIndex < laserLevels.length - 1) {
    laserTempDraft.value = laserLevels[currentIndex + 1];
  }
};

const confirmLaser = () => {
  // 将临时选择的激光类型同步到持久化值
  laserType.value = laserLevel.value;
  // 保存当前选择的等级
  laserTempLevel.value = laserTempDraft.value;
  writeDevicePidValue([{ pid: PID_CONFIG.LASER_MODE_LEVEL, val: laserLevels.indexOf(laserTempLevel.value) }]); // 写入设备PID值
  writeDevicePidValue([{ pid: PID_CONFIG.LASER_MODE, val: laserType.value }]); // 写入设备PID值  0:'开盖' 或 1:'开关盖'
  showLaser.value = false;
};

// 关闭/取消弹窗，恢复草稿为已保存值（laserLevel 不需要恢复，因为下次打开时会重新同步）
const cancelLaser = () => {
  laserTempDraft.value = laserTempLevel.value;
  showLaser.value = false;
};

// 获取激光类型显示文本
const getLaserTypeText = () => {
  // 根据 laserType 的值返回对应的文本（laserType 已从设备读取并转换）
  return laserType.value === 1 ? '开关盖' : '开盖';
};

// 恢复默认设置（与 faucet.vue 一致的交互）
const resetToDefaults = () => {
  uni.showModal({
    title: '提示',
    content: '确定是否恢复默认初始设置？',
    confirmText: '确定',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) applyDefaultSettings();
    },
  });
};

const applyDefaultSettings = async () => {
  const params = createDeviceParams({
    pids: [
      { pid: PID_CONFIG.CLEANING_MODE, sid: 0 },
      { pid: PID_CONFIG.ENERGY_SAVING, sid: 0 },
      { pid: PID_CONFIG.SEASON_MODE, sid: 0 },
      { pid: PID_CONFIG.SILENT, sid: 0 },

      { pid: PID_CONFIG.UVC_STERILIZATION, sid: 0 },
      { pid: PID_CONFIG.PRE_WET, sid: 0 },
      { pid: PID_CONFIG.AUTO_FLUSH_SEAT, sid: 0 },
      { pid: PID_CONFIG.AUTO_MALE_FLUSH, sid: 0 },
      { pid: PID_CONFIG.TEMP_UNIT, sid: 0 },
      { pid: PID_CONFIG.FLUSH_VOLUME, sid: 0 },
      { pid: PID_CONFIG.AUTO_LID, sid: 0 },
      { pid: PID_CONFIG.MICrowave_MODE, sid: 0 },
      { pid: PID_CONFIG.FOOT_LID, sid: 0 },
    ],
  });
  const res = await resetDevicePid(params);
  feedbackResult(res);
  handleDevicePidResponse(res);
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

.settings-card {
  margin-top: 32rpx;
  padding: 8rpx 0;
}

.mb-150 {
  margin-bottom: 150rpx;
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

/* 激光模式等级选择器 */
.level-selector {
  margin-top: 65rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40rpx;
}

.arrow-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.arrow-icon {
  font-size: 50rpx;
  color: #7f7f7f;
  line-height: 1;
  font-weight: normal;
}

.level-display {
  font-size: 50rpx;
  font-weight: bold;
  color: #1f1f1f;
  min-width: 140rpx;
  text-align: center;
  letter-spacing: 2rpx;
}

.description {
  margin-top: 24rpx;
  text-align: center;
  font-size: 24rpx;
  color: #9aa0a6;
}

.seg-row {
  margin-top: 48rpx;
  margin-bottom: 32rpx;
  display: flex;
  justify-content: center;
  gap: 20rpx;
}
.seg {
  min-width: 160rpx;
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: 100rpx;
  background: #ffffff;
  color: #3b3b3b;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 26rpx rgba(0, 0, 0, 0.06);
}
.seg.active {
  background: #6a4f40;
  color: #fff;
}

/* 温度单位分段控件 */
.seg-toggle {
  margin-top: 48rpx;
  align-self: center;
  width: 560rpx;
  height: 80rpx;
  background: #e6e6e6;
  border-radius: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 145rpx auto 120rpx;
}
.seg-opt {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #7f7f7f;
  height: 100%;
}
.seg-opt.active {
  background: #5a4a3f;
  color: #ffffff;
}
.picker-text {
  text-align: right;
  background: none;
  color: #9aa0a6;
  font-size: 28rpx;
  width: 120rpx;
}
</style>
