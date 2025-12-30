<template>
  <view class="test-page">
    <view class="title">{{ chartTitle }}</view>
    <view class="sub-title">{{ subTitle }}</view>
    <view>
      <view v-if="!ready" class="charts-placeholder">数据加载中/失败，请稍后重试</view>

      <view class="charts-container" v-else>
        <!-- 动态生成图表实例，使用 v-if 确保图表在显示时才初始化 -->
        <view v-for="tab in buttonTab" :key="tab.value" class="chart-wrapper" v-show="currentRange === tab.value">
          <scroll-view
            class="chart-scroll"
            scroll-x="true"
            :show-scrollbar="true"
            :enable-flex="true"
            :scroll-left="scrollLeft">
            <ly-charts-bar
              :ref="(el) => setChartRef(el, tab.value)"
              :option="chartOption"
              height="500rpx"
              :width="chartWidth"></ly-charts-bar>
          </scroll-view>
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
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import LyChartsBar from '@/uni_modules/ly-charts/components/ly-charts-bar/ly-charts-bar.vue';

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
// 定义事件
const emit = defineEmits(['changeRange']);

// 当前时间维度，默认选中第一个按钮
const currentRange = ref('');

// 图表实例映射，key 为 tab.value
const uChartsBarMap = ref({});

// 设置图表 ref
const setChartRef = (el, key) => {
  if (el && uChartsBarMap && uChartsBarMap.value && key) {
    uChartsBarMap.value[key] = el;
  }
};

// 计算图表宽度：根据数据点数量动态计算
const barWidth = 12;

const chartOption = ref({
  grid: {
    top: 50,
    right: 20,
    bottom: 20, // 减小底部边距，让图例更靠近底部
    left: 80, // 确保左侧有足够空间显示Y轴
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLabel: {
      color: '#666',
      fontSize: 12,
      show: true, // 显示 X 轴标签
    },
    axisLine: {
      show: true, // 显示 X 轴线
      lineStyle: {
        color: '#999',
      },
    },
    axisTick: {
      show: true, // 显示 X 轴刻度
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#666',
      fontSize: 12,
      show: true, // 显示 Y 轴标签
    },
    axisLine: {
      show: true, // 显示 Y 轴线
      lineStyle: {
        color: '#999',
      },
    },
    axisTick: {
      show: true, // 显示 Y 轴刻度
    },
    splitLine: {
      show: true, // 显示网格线
      lineStyle: {
        color: '#e0e0e0',
        type: 'dashed',
      },
    },
  },
  series: [
    {
      name: '销售额',
      type: 'bar',
      data: [120, 200, 150, 80, 70, 110, 130],
      itemStyle: {
        color: '#574b43',
      },
      barWidth: barWidth, // 使用较小的柱子宽度
      label: {
        show: true, // 显示标签
        position: 'top', // 标签位置：top（柱子上方）、inside（柱子内部）、bottom（柱子下方）
        color: '#333', // 标签颜色
        fontSize: 10, // 标签字体大小
      },
    },
  ],
  legend: {
    bottom: 10, // 图例距离底部的间距（像素值，越小越靠近底部）
    left: 'center', // 图例居中显示
    data: ['销售额'],
    textStyle: {
      color: '#666',
    },
  },
  backgroundColor: 'transparent',
});
const chartWidth = ref(500); // 设置默认宽度，避免初始为 0
// 控制 scroll-view 默认滚动位置，初始为最左侧
const scrollLeft = ref(0);

// 根据父组件传入的 props.data 动态更新 x 轴和数据
// 约定数据结构：{ x: { name, data: [] }, y: { name, data: [] } }
watch(
  () => props.data,
  (newData) => {
    const { x = {}, y = {} } = newData || {};
    const categories = Array.isArray(x.data) ? x.data : [];
    const seriesData = Array.isArray(y.data) ? y.data : [];
    const xName = x.name || '';
    const yName = y.name || '';

    // 更新 X 轴和系列数据（只改必要字段，保持其它样式不变）
    chartOption.value.xAxis = {
      ...chartOption.value.xAxis,
      data: categories,
    };
    if (chartOption.value.series && chartOption.value.series.length > 0) {
      chartOption.value.series[0] = {
        ...chartOption.value.series[0],
        name: yName || chartOption.value.series[0].name,
        data: seriesData,
      };
    }
    // 图例名称同步
    chartOption.value.legend = {
      ...chartOption.value.legend,
      data: [yName || (chartOption.value.legend?.data?.[0] ?? '')],
    };

    // 同步标题/副标题
    chartTitle.value = yName || '统计图表';
    subTitle.value = xName || '';

    // 简单按数量调整宽度，防止标签挤在一起
    const minCategoryWidth = barWidth * 1 + 10 + 15 // 单系列：柱宽 + 间距
    const count = categories.length || 1;
    chartWidth.value = Math.max(count * minCategoryWidth + 100, 500);

    // 默认将滚动条滚动到最右侧（最后一个月份）
    // 这里直接使用总宽度，使 scroll-view 显示末尾区域
    scrollLeft.value = chartWidth.value;
  },
  { immediate: true, deep: false }
);

// 初始化：设置默认选中项和图表就绪状态
onMounted(() => {
  currentRange.value = props.buttonTab[0]?.value;
});

// 监听 buttonTab 变化，更新默认选中项
watch(
  () => props.buttonTab,
  (newTab) => {
    currentRange.value = newTab[0]?.value;
  },
  { immediate: true }
);

// 切换时间维度（延迟初始化图表实例，避免 display:none 时 canvas 尺寸为 0）
const switchRange = (range) => {
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
.chart-scroll {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
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
