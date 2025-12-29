<template>
  <view class="test-page">
    <view class="title">{{ chartTitle }}</view>
    <view class="sub-title">{{ subTitle }}</view>
    <view>
      <view v-if="!ready" class="charts-placeholder">数据加载中/失败，请稍后重试</view>

      <view class="charts-container" v-else>
        <!-- 动态生成图表实例，通过显示/隐藏切换，避免重绘闪烁 -->
        <view
          v-for="tab in buttonTab"
          :key="tab.value"
          class="chart-wrapper"
          :class="{ 'chart-ready': chartReadyMap[tab.value] }"
          v-show="currentRange === tab.value">
          <qiun-data-charts
            v-if="chartReadyMap[tab.value]"
            type="column"
            :chartData="getChartData(tab.value)"
            :opts="opts"
            :ontouch="true" />
        </view>
      </view>
      <view class="btn-group">
        <button
          v-for="tab in buttonTab"
          :key="tab.value"
          class="range-btn"
          :class="{ active: currentRange === tab.value }"
          @click="switchRange(tab.value)">
          {{ tab.label }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  // 数据是否已经请求完成（无论成功失败），用于停止 loading
  ready: {
    type: Boolean,
    default: false,
  },
  buttonTab: {
    type: Array,
    default: () => [],
  },
});

const chartTitle = ref('统计图表');
const subTitle = ref('');
// 数据是否已就绪（用于控制 qiun loading）
const isDataReady = computed(() => !!(props.ready && props.data && Object.keys(props.data).length));
// 定义事件
const emit = defineEmits(['changeRange']);

// 图表配置项，可根据需要继续扩展
const opts = {
  color: ['#574b43'],
  padding: [15, 10, 0, 15],
  enableScroll: true,
  // 关闭动画，减少切换时的闪烁
  animation: false,
  // 设置Y轴背景色（当X轴滚动时，Y轴左右两侧的背景色）
  legend: {
    show: true,
  },
  xAxis: {
    disableGrid: true,
    scrollShow: true,
    itemCount: 5,
    scrollAlign: 'right',
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

// 当前时间维度，默认选中第一个按钮
const currentRange = ref('');

// 图表就绪状态映射，用于控制图表实例的初始化（避免 display:none 时 canvas 尺寸为 0）
const chartReadyMap = ref({});

// 初始化：设置默认选中项和图表就绪状态
onMounted(() => {
  if (props.buttonTab && props.buttonTab.length > 0) {
    const firstRange = props.buttonTab[0].value;
    currentRange.value = firstRange;
    // 第一个图表立即初始化
    chartReadyMap.value[firstRange] = true;
  }
});

// 监听 buttonTab 变化，更新默认选中项
watch(
  () => props.buttonTab,
  (newTab) => {
    if (newTab && newTab.length > 0 && !currentRange.value) {
      const firstRange = newTab[0].value;
      currentRange.value = firstRange;
      chartReadyMap.value[firstRange] = true;
    }
  },
  { immediate: true }
);

/**
 * 获取指定时间维度的图表数据
 * @param {string} range - 时间维度
 * @returns {Object|null} 图表数据
 */
const getChartData = (range) => {
  if (!isDataReady.value) return null; // 让 qiun-data-charts 走 loading
  const { x = {}, y = {} } = props.data || {};
  const categories = x?.data || [];
  const seriesData = y?.data || [];
  const title = x?.name || '';
  const tag = y?.name || '';

  // 更新标题（使用当前选中维度的标题）
  chartTitle.value = tag;
  subTitle.value = title;

  return {
    categories,
    series: [
      {
        name: tag,
        data: seriesData,
      },
    ],
  };
};

// 切换时间维度（仅切换显示状态，图表实例已预先渲染）
const switchRange = (range) => {
  if (range === currentRange.value) return;

  // 标记该图表已就绪（延迟初始化，避免 display:none 时 canvas 尺寸为 0）
  if (!chartReadyMap.value[range]) {
    chartReadyMap.value[range] = true;
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
  margin-bottom: 12rpx;
  text-align: center;
  color: #333;
}

.sub-title {
  font-size: 30rpx;
  margin-bottom: 24rpx;
  text-align: center;
  color: #333;
}

.charts-container {
  width: 100%;
  height: 500rpx;
  position: relative;
}
.charts-placeholder {
  width: 100%;
  height: 500rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 26rpx;
  background: #f7f7f7;
  border: 1px dashed #ddd;
  border-radius: 12rpx;
  box-sizing: border-box;
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
  margin: 15rpx auto 0;
  display: flex;
  gap: 38rpx;
  justify-content: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
}

.range-btn {
  height: 64rpx;
  width: 236rpx;
  line-height: 64rpx;
  font-size: 26rpx;
  border-radius: 32rpx;
  border: 1rpx solid #dddddd;
  background-color: #ffffff;
  color: #333333;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}

.range-btn.active {
  border-color: #574b43;
  background-color: #574b43;
  color: #ffffff;
}
</style>
