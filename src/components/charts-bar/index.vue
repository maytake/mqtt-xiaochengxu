<template>
  <view class="wrapper-page">
    <view class="title">{{ chartTitle }}</view>
    <view class="sub-title">{{ subTitle }}</view>
    <!-- <view class="date-range">
      <view class="date-btn date-prev" @click="handleClickDate('prev')">
        <text class="font_family icon-arrow">&#xe60e;</text>
      </view>
      <view class="date-btn date-next" @click="handleClickDate('next')">
        <text class="font_family icon-arrow">&#xe60d;</text>
      </view>
    </view> -->
    <view v-if="!ready" class="charts-placeholder">数据加载中/失败，请稍后重试</view>
    <view class="charts-container" v-else>
      <!-- 动态生成图表实例，使用 v-if 确保图表在显示时才初始化 -->
      <view class="chart-wrapper">
        <scroll-view
          class="chart-scroll"
          scroll-x="true"
          :show-scrollbar="true"
          :enable-flex="true"
          :scroll-left="scrollLeft">
          <ly-charts-bar :option="chartOption" height="500rpx" :width="chartWidth"></ly-charts-bar>
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
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, getCurrentInstance } from 'vue';
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
  unitLabel: {
    type: String,
    default: '：单位L',
  },
  // 默认选中的按钮值
  defaultRange: {
    type: String,
    default: '',
  },
});

const chartTitle = ref('统计图表');
const subTitle = ref('');
// 定义事件
const emit = defineEmits(['changeRange', 'handleDate']);

// 当前时间维度，默认选中第一个按钮
const currentRange = ref('');

// 图表实例映射，key 为 tab.value
const uChartsBarMap = ref({});

// 容器宽度（用于控制图表宽度不超过外层 wrapper-page 的宽度）
const instance = getCurrentInstance();
const wrapperWidth = ref(0);
// 标志位：容器宽度是否已测量完成
const isWrapperMeasured = ref(false);

const measureWrapperWidth = () => {
  if (!instance) return;
  nextTick(() => {
    // 以 .wrapper-page 为参考容器，也可以根据需要改为 .charts-container
    uni
      .createSelectorQuery()
      .in(instance.proxy)
      .select('.wrapper-page')
      .boundingClientRect((rect) => {
        if (rect && rect.width) {
          wrapperWidth.value = rect.width;
          isWrapperMeasured.value = true;
          // 容器宽度测量完成后，重新计算图表宽度
          calculateChartWidth();
        }
      })
      .exec();
  });
};

// 计算属性：获取当前应该显示的 tab
const currentTab = computed(() => {
  return props.buttonTab.find((tab) => tab.value === currentRange.value) || props.buttonTab[0];
});
console.log('currentTab', currentTab.value);
// 设置图表 ref
const setChartRef = (el, key) => {
  if (el && uChartsBarMap && uChartsBarMap.value && key) {
    uChartsBarMap.value[key] = el;
  }
};

// 计算图表宽度：根据数据点数量动态计算
const barWidth = 10;

const chartOption = ref({
  grid: {
    top: 50,
    right: 20,
    bottom: 20, // 减小底部边距，让图例更靠近底部
    left: 50, // 确保左侧有足够空间显示Y轴
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLabel: {
      color: '#666',
      fontSize: 10,
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
const chartWidth = ref('100%'); // 设置默认宽度，避免初始为 0
// 控制 scroll-view 默认滚动位置，初始为最左侧
const scrollLeft = ref(0);

// 提取计算图表宽度的逻辑为独立函数
const calculateChartWidth = () => {
  // 如果容器宽度还未测量完成，且 wrapperWidth 为 0，则使用默认值
  if (!isWrapperMeasured.value && wrapperWidth.value === 0) {
    chartWidth.value = '100%';
    return;
  }

  const categories = Array.isArray(chartOption.value.xAxis?.data) 
    ? chartOption.value.xAxis.data 
    : [];
  
  // 简单按数量调整宽度，防止标签挤在一起
  const minCategoryWidth = barWidth * 1 + 10 + 10; // 单系列：柱宽 + 间距
  const count = categories.length || 1;
  const baseChartWidth = count * minCategoryWidth + 10;

  // 如果图表按数据计算的宽度大于容器宽度，则使用图表宽度；否则占满容器宽度（等价于 100%）
  chartWidth.value = baseChartWidth > wrapperWidth.value ? baseChartWidth : '100%';

  // 默认将滚动条滚动到最右侧（最后一个月份）
  // 这里直接使用总宽度，使 scroll-view 显示末尾区域
  scrollLeft.value = typeof chartWidth.value === 'number' ? chartWidth.value : 0;
};

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
      data: [yName + props.unitLabel || ''],
    };

    // 同步标题/副标题
    chartTitle.value = yName || '统计图表';
    subTitle.value = xName || '';

    // 计算图表宽度（如果容器宽度已测量完成，则立即计算；否则等待测量完成后再计算）
    calculateChartWidth();
  },
  { immediate: true, deep: false }
);

// 监听 defaultRange prop 的变化，同步更新 currentRange
watch(
  () => props.defaultRange,
  (newValue) => {
    if (newValue) {
      console.log('defaultRange', newValue);
      currentRange.value = newValue;
    }
  },
  { immediate: true }
);

// 初始化：设置默认选中项和图表就绪状态
onMounted(() => {
  // 首次挂载后测量外层容器宽度
  measureWrapperWidth();
  // 如果 defaultRange 有值则使用，否则使用第一个按钮的值
  currentRange.value = props.defaultRange || props.buttonTab[0]?.value;
});

// 切换时间维度（延迟初始化图表实例，避免 display:none 时 canvas 尺寸为 0）
const switchRange = (range) => {
  currentRange.value = range;
  // 使用 Vue 标准事件机制触发父组件事件
  emit('changeRange', range);
};

const handleClickDate = (type) => {
  emit('changeDate', type, currentRange.value);
};
</script>

<style lang="scss" scoped>
.wrapper-page {
  width: 100%;
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
  &:after {
    border: none;
    outline: none;
    box-shadow: none;
  }
}

.range-btn.active {
  border-color: #574b43;
  background-color: #574b43;
  color: #ffffff;
}
.date-range {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.date-btn {
  width: 42rpx;
  height: 42rpx;
  line-height: 42rpx;
  text-align: center;
  color: #333333;

  .icon-arrow {
    font-size: 22rpx;
  }
}
</style>
