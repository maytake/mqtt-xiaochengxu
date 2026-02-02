<template>
  <view class="page">
    <view class="page-bg">
      <!-- 设置按钮 -->
      <view class="settings-btn">
        <text class="settings-text" @click="goToSetting">设置</text>
      </view>

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
        <view class="status-item">
          <up-icon class="font_family m-arrow icon" name="wifi"></up-icon>
          <text>
            信号：
            <text :class="signalRedColor">
              {{ signalStrength }}
            </text>
          </text>
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
              今日使用次数：
              <text class="status-amount">{{ todayCount }}次</text>
            </text>
          </view>
        </view>
      </view>

      <!-- 统计表格 -->
      <view class="statistical-table-container">
        <charts-bar
          @changeRange="handleChangeRange"
          :data="statisticalData"
          @changeDate="handleChangeDate"
          :ready="statisticalReady"
          :buttonTab="[
            { label: '按天', value: 'day' },
            { label: '按小时', value: 'hour' },
          ]" />
      </view>
      <!-- 统计表格-end -->
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { getProductModelDetails } from '@/api/mqttCommon';
import { queryDeviceStatisticGroup } from '@/api/uEchartsApi';
import { generateRandomSeq } from '@/utils/common';
import { triggerPidReport } from '@/api/index';
import ChartsBar from '@/components/charts-bar/index.vue';
// 创建设备请求参数
const mqttUserInfo = uni.getStorageSync('mqttUserInfo');
const clientId = mqttUserInfo?.clientId || '';

const mqttClient = getApp().globalData.mqttService;
import { formatDate } from '@/utils/common';
// 设备相关
const device = ref('');
const status = ref('0');
const statusName = ref('离线');
const productModelDetails = ref({});
const statisticalData = ref({});
const statisticalReady = ref(false);
// ==================== 常量配置 ====================
const DEVICE_STATUS = ['离线', '在线', '故障'];

const DEVICE_CONFIG = {
  dst: '011025092402001D',
  did: '0111250924030004',
  dirDid: '011025092402001D',
};
let reportTopic = '';
let todayCount = ref(0); // 今日统计次数
// 当前已展示的按天区间
const currentDayRange = ref({
  statrDate: '',
  endDate: '',
});
// 当前已展示的按小时区间
const currentHourRange = ref({
  statDateHour: '',
  endDateHour: '',
});
// ==================== 设备控制 ====================
// 公用：构造“按天，往前推6天”的统计参数
const buildLastDayParams = () => {
  const now = new Date();
  const endDate = formatDate(now, 'yyyy-MM-dd');
  // 往前推6天
  const startDateObj = new Date(now);
  startDateObj.setDate(now.getDate() - 6);
  const statrDate = formatDate(startDateObj, 'yyyy-MM-dd');

  return {
    dataType: 2,
    statrDate,
    endDate,
  };
};

const buildLastHoursParams = () => {
  const now = new Date();
  const endDate = formatDate(now, 'yyyy-MM-dd HH') + ':00:00';
  // 往前推7小时
  const startDateObj = new Date(now);
  startDateObj.setHours(now.getHours() - 6);
  const statrDate = formatDate(startDateObj, 'yyyy-MM-dd HH') + ':00:00';
  return {
    dataType: 3,
    statDateHour: statrDate,
    endDateHour: endDate,
  };
};

// 公用：构造“按天，整体往前/往后推7天”的统计参数（基于当前已展示区间）
const buildMove7DayParams = (type, currentRange) => {
  const { statrDate, endDate } = currentRange || {};
  // 如果当前没有区间，就退回到默认最近区间
  if (!statrDate || !endDate) {
    return buildLastDayParams();
  }

  const parseDay = (str) => new Date((str || '').replace(/-/g, '/'));
  const addDays = (date, n) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  };

  const startDate = parseDay(statrDate);
  const endDateDate = parseDay(endDate);
  const step = type === 'prev' ? -7 : 7;
  const newStart = addDays(startDate, step);
  const newEnd = addDays(endDateDate, step);

  return {
    dataType: 2,
    statrDate: formatDate(newStart, 'yyyy-MM-dd'),
    endDate: formatDate(newEnd, 'yyyy-MM-dd'),
  };
};

// 公用：构造“按小时，整体往前/往后推7小时”的统计参数（基于当前已展示区间）
const buildMove7HourParams = (type, currentRange) => {
  const { statDateHour, endDateHour } = currentRange || {};
  // 如果当前没有区间，就退回到默认最近区间
  if (!statDateHour || !endDateHour) {
    return buildLastHoursParams();
  }

  const parseHour = (str) => new Date((str || '').replace(/-/g, '/'));
  const addHours = (date, n) => {
    const d = new Date(date);
    d.setHours(d.getHours() + n);
    return d;
  };

  const startDate = parseHour(statDateHour);
  const endDateDate = parseHour(endDateHour);
  const step = type === 'prev' ? -7 : 7;
  const newStart = addHours(startDate, step);
  const newEnd = addHours(endDateDate, step);

  return {
    dataType: 3,
    statDateHour: formatDate(newStart, 'yyyy-MM-dd HH') + ':00:00',
    endDateHour: formatDate(newEnd, 'yyyy-MM-dd HH') + ':00:00',
  };
};

// 触发设备信号强度
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
const triggerPidReportFn = async () => {
  const params = createDeviceParams({
    pids: [{ pid: 2, sid: 0 }],
  });
  const res = await triggerPidReport(params);
};

let signalTopic = ''// 设备信号强度主题
let handleSignalTopicResponse = null;// 设备信号强度主题处理函数
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
  reportTopic = `olt/report/eid/${DEVICE_CONFIG.did}/8218`;
  // 阶段2：订阅并仅监听一次设备报告主题
  mqttClient.registerPageTopicHandler(reportTopic, handleReportTopicResponse);
  // 订阅设备信号强度主题
  signalTopic = `olt/report/pid/${DEVICE_CONFIG.did}`;
  mqttClient.registerPageTopicHandler(signalTopic, handleSignalTopicResponse);

  await Promise.all([loadProductModelDetails()]);
  const params = buildLastDayParams();
  getStatisticalData(params);
  triggerPidReportFn()
});

// 页面级主题消息处理变量
handleReportTopicResponse = (messageData, topic) => {
  console.log('pageMessage', messageData);
  if (messageData?.topic === reportTopic) {
    const params = messageData?.params;
    if (params) {
      todayCount.value++;
    }
  }
};

handleReportTopicResponse();

// 设备信号强度主题处理函数
const signalStrength = ref('无');
const signalRedColor = ref('status-offline');
handleSignalTopicResponse = (messageData, topic) => {
  if (messageData?.topic === signalTopic) {
    console.log('signalTopic', messageData);
    const pids = messageData?.params?.properties?.pids || [];
    if (Array.isArray(pids) && pids.some((item) => item.pid == 2)) {
      const signal = pids.find((item) => item.pid == 2)?.val;
      // 信号返回值是0：无信号，10-30：信号弱，31-50：信号中，51-100：信号强
      if (signal === 0) {
        signalStrength.value = '无';
        signalRedColor.value = 'status-offline';
      } else if (signal >= 10 && signal <= 30) {
        signalStrength.value = '弱';
        signalRedColor.value = 'status-offline';
      } else if (signal >= 31 && signal <= 50) {
        signalStrength.value = '中';
        signalRedColor.value = 'status-online';
      } else if (signal >= 51 && signal <= 100) {
        signalStrength.value = '强';
        signalRedColor.value = 'status-online';
      }
    }
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
      todayCount.value = data.waterTotal;
    }
  } catch (error) {
    console.error('获取产品模型详情失败:', error);
  }
};

const goToSetting = () => {
  uni.navigateTo({
    url: '/pages/faucet/setting?device=' + encodeURIComponent(JSON.stringify(device.value)),
  });
};

const handleChangeRange = (range) => {
  console.log('range', range);
  let params = {};
  if (range === 'day') {
    params = buildLastDayParams();
    currentDayRange.value = {
      statrDate: params.statrDate,
      endDate: params.endDate,
    };
  } else {
    params = buildLastHoursParams();
    currentHourRange.value = {
      statDateHour: params.statDateHour,
      endDateHour: params.endDateHour,
    };
  }

  getStatisticalData(params);
};

const handleChangeDate = (type, range = 'month') => {
  let params = {};
  if (range === 'day') {
    if (type === 'prev') {
      // 往前推7天
      params = buildMove7DayParams('prev', currentDayRange.value);
    } else {
      // 往后推7天
      params = buildMove7DayParams('next', currentDayRange.value);
      // 校验：开始时间必须小于当前时间
      const now = new Date();
      const today = formatDate(now, 'yyyy-MM-dd');
      if (params.statrDate >= today) {
        uni.showToast({
          title: '开始时间不能大于等于当前时间',
          icon: 'none',
          duration: 2000,
        });
        return;
      }
    }
    currentDayRange.value = {
      statrDate: params.statrDate,
      endDate: params.endDate,
    };
  } else {
    if (type === 'prev') {
      // 往前推7小时
      params = buildMove7HourParams('prev', currentHourRange.value);
    } else {
      // 往后推7小时
      params = buildMove7HourParams('next', currentHourRange.value);
      // 校验：开始时间必须小于当前时间
      const now = new Date();
      const today = formatDate(now, 'yyyy-MM-dd HH');
      if (params.statDateHour >= today) {
        uni.showToast({
          title: '开始时间不能大于等于当前时间',
          icon: 'none',
          duration: 2000,
        });
        return;
      }
    }
    currentHourRange.value = {
      statDateHour: params.statDateHour,
      endDateHour: params.endDateHour,
    };
  }

  getStatisticalData(params);
};

async function getStatisticalData(objParams) {
  const params = {
    did: DEVICE_CONFIG.did,
    infoType: 2,
    ...objParams,
  };
  try {
    statisticalReady.value = false;
    const res = await queryDeviceStatisticGroup(params);
    const { code, data } = res || {};
    if (code === 0) {
      const { y = {} } = data || {};
      y.data = y.data.map((item) => Math.round(item / 1000));
      statisticalData.value = data;
    } else {
      statisticalData.value = {};
    }
  } finally {
    statisticalReady.value = true;
  }
}

onUnload(() => {
  mqttClient.unregisterPageTopicHandler(reportTopic, handleReportTopicResponse);
  mqttClient.unregisterPageTopicHandler(signalTopic, handleSignalTopicResponse);
});
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
  margin-top: 20rpx;
  display: flex;
  gap: 30rpx;
  justify-content: space-between;
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

.statistical-table-container {
  margin: 32rpx 0 200rpx;
}
</style>
