<template>
  <view class="test-page">
    <view class="title">{{ chartTitle }}</view>
    <view class="charts-container">
      <!-- 使用两个图表实例，通过显示/隐藏切换，避免重绘闪烁 -->
      <view class="chart-wrapper" v-show="currentRange === 'month'">
        <qiun-data-charts type="column" :chartData="monthChartData" :opts="opts" :ontouch="true" background="#efefef" />
      </view>
      <view class="chart-wrapper" v-if="dayReady" v-show="currentRange === 'day'">
        <qiun-data-charts type="column" :chartData="dayChartData" :opts="opts" :ontouch="true" background="#efefef" />
      </view>
    </view>
    <view class="btn-group">
      <button class="range-btn" :class="{ active: currentRange === 'month' }" @click="switchRange('month')">
        按月
      </button>
      <button class="range-btn" :class="{ active: currentRange === 'day' }" @click="switchRange('day')">按天</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});
const chartTitle = ref('月度用水量柱状图');
// 数据是否已就绪（用于控制 qiun loading）
const isDataReady = computed(() => !!(props.data && Object.keys(props.data).length));
// 定义事件
const emit = defineEmits(['changeRange']);
// 图表配置项，可根据需要继续扩展
const opts = {
  color: ['#574b43'],
  padding: [15, 10, 0, 15],
  enableScroll: true,
  // 关闭动画，减少切换时的闪烁
  animation: false,
  legend: {
    show: true,
  },
  xAxis: {
    disableGrid: true,
    scrollShow: true,
    itemCount: 5,
    scrollAlign: 'left',
  },
  yAxis: {
    data: [
      {
        min: 0,
      },
    ],
  },
  extra: {
    // 关闭额外动画，进一步避免重绘抖动
    animation: false,
    column: {
      type: 'group',
      width: 20,
    },
  },
};

// 当前时间维度：month | day
const currentRange = ref('month');
// 按天图表是否已经初始化，避免 display:none 时 canvas 尺寸为 0
const dayReady = ref(false);

// 使用 computed 响应式地解析从props.data传入的数据
// 按月数据（12个月）
const monthChartData = computed(() => {
  if (!isDataReady.value) return null; // 让 qiun-data-charts 走 loading
  const { x = {}, y = {} } = props.data || {};
  const monththCategories = x?.data || [];
  const monththSeries = y?.data || [];
  const monththTitle = x?.name || '';
  const monththTag = y?.name || '';
  chartTitle.value = monththTitle;
  return {
    categories: monththCategories,
    series: [
      {
        name: monththTag,
        data: monththSeries,
      },
    ],
  };
});

// 按天数据（30天）- 目前使用相同的数据结构
const dayChartData = computed(() => {
  if (!isDataReady.value) return null; // 让 qiun-data-charts 走 loading
  const { x = {}, y = {} } = props.data || {};
  const dayCategories = x?.data || [];
  const daySeries = y?.data || [];
  const dayTitle = x?.name || '';
  const dayTag = y?.name || '';
  chartTitle.value = dayTitle;
  return {
    categories: dayCategories,
    series: [
      {
        name: dayTag,
        data: daySeries,
      },
    ],
  };
});

// 切换时间维度（仅切换显示状态，图表实例已预先渲染）
const switchRange = (range) => {
  if (range === currentRange.value) return;
  if (range === 'day') {
    dayReady.value = true;
  }
  currentRange.value = range;

  // 使用 Vue 标准事件机制触发父组件事件
  emit('changeRange', range);
};
</script>

<style lang="scss" scoped>
.test-page {
  padding: 16rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 24rpx;
  text-align: center;
  color: #333;
}

.charts-container {
  width: 100%;
  height: 500rpx;
  position: relative;
}

.chart-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.2s ease;
}

.btn-group {
  margin-top: 24rpx;
  display: flex;
  gap: 24rpx;
}

.range-btn {
  flex: 1;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 26rpx;
  border-radius: 12rpx;
  border: 1rpx solid #dddddd;
  background-color: #ffffff;
  color: #333333;
}

.range-btn.active {
  border-color: #574b43;
  background-color: #574b43;
  color: #ffffff;
}
</style>
