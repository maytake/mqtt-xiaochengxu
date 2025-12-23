<template>
  <view class="test-page">
    <view class="title">{{ currentRange === 'month' ? '月度示例数据柱状图' : '每日示例数据柱状图' }}</view>
    <view class="charts-container">
      <!-- 使用两个图表实例，通过显示/隐藏切换，避免重绘闪烁 -->
      <view class="chart-wrapper" :class="{ hidden: currentRange !== 'month' }">
        <qiun-data-charts type="column" :chartData="monthChartData" :opts="opts" :ontouch="true" />
      </view>
      <view class="chart-wrapper" :class="{ hidden: currentRange !== 'day' }">
        <qiun-data-charts type="column" :chartData="dayChartData" :opts="opts" :ontouch="true" />
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
import { ref } from 'vue';

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

// 按月数据（12个月）
const monthChartData = {
  categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  series: [
    {
      name: '示例数据',
      data: [30, 40, 35, 50, 60, 55, 70, 65, 58, 72, 68, 75],
    },
  ],
};

// 按天数据（30天）
const dayChartData = {
  categories: ['1日', '2日', '3日', '4日', '5日', '6日', '7日'],
  series: [
    {
      name: '示例数据',
      data: [10, 20, 15, 25, 30, 28, 35],
    },
  ],
};

// 切换时间维度（仅切换显示状态，图表实例已预先渲染）
const switchRange = (range) => {
  if (range === currentRange.value) return;
  currentRange.value = range;
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

.chart-wrapper.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
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
