<template>
  <view class="test-page">
    <charts-bar
      @changeRange="handleChangeRange"
      :data="chartData"
      :ready="chartReady"
      :buttonTab="[
        { label: '按月', value: 'month' },
        { label: '按天', value: 'day' },
      ]" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ChartsBar from '@/components/charts-bar/index.vue';
import { queryHomeStatisticGroup } from '@/api/uEchartsApi';
import { formatDate } from '@/utils/common';

const chartData = ref({});
const chartReady = ref(false);
const selectedValue = ref(355); // 默认选中的项目ID，可以根据实际需求修改

// 公用：构造"按月，往前推12个月"的统计参数
const buildLast12MonthParams = () => {
  const now = new Date();
  const endDate = formatDate(now, 'yyyy-MM');
  // 往前推12个月
  const startDateObj = new Date(now);
  startDateObj.setMonth(now.getMonth() - 11);
  const statrDate = formatDate(startDateObj, 'yyyy-MM');

  return {
    dataType: 1,
    statrDate,
    endDate,
  };
};

// 切换时间维度
const handleChangeRange = (range) => {
  let params = {};
  if (range === 'month') {
    // 按月endDate为当前月，statrDate为往前推12个月：yyyy-MM
    params = buildLast12MonthParams();
  } else {
    // 按天endDate为当前天，statrDate为往前15天：yyyy-MM-dd
    const now = new Date();
    now.setDate(now.getDate() - 1); // 减去一天
    const endDate = formatDate(now, 'yyyy-MM-dd');
    // 往前推15天
    const startDateObj = new Date(now);
    startDateObj.setDate(now.getDate() - 14);
    const statrDate = formatDate(startDateObj, 'yyyy-MM-dd');
    params = {
      dataType: 2,
      statrDate,
      endDate,
    };
  }

  chartReady.value = false;
  getChartData(params);
};

// 获取图表数据
async function getChartData(objParams) {
  const { dataType, statrDate, endDate } = objParams || {};
  const params = {
    homeId: selectedValue.value,
    dataType,
    infoType: 2,
    statrDate,
    endDate,
  };
  console.log('请求图表数据，params:', params);
  const res = await queryHomeStatisticGroup(params);
  const { code, data } = res || {};
  console.log('图表数据响应:', { code, data });
  if (code === 0) {
    chartData.value = data || {};
    console.log('设置图表数据:', chartData.value);
  } else {
    // 接口失败时也置空，避免子组件卡 loading
    chartData.value = {};
    console.warn('图表数据接口失败，code:', code);
  }
  chartReady.value = true;
  console.log('图表数据就绪状态:', chartReady.value);
}

// 初始化：默认加载"按月"数据
onMounted(() => {
  const params = buildLast12MonthParams();
  getChartData(params);
});
</script>

<style lang="scss" scoped>
.test-page {
  padding: 16rpx;
}
</style>
