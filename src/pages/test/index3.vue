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
const selectedValue = ref(355);


const buildLast12MonthParams = () => {
  const now = new Date();
  const endDate = formatDate(now, 'yyyy-MM');

  const startDateObj = new Date(now);
  startDateObj.setMonth(now.getMonth() - 5);
  const statrDate = formatDate(startDateObj, 'yyyy-MM');

  return {
    dataType: 1,
    statrDate,
    endDate,
  };
};


const handleChangeRange = (range) => {
  let params = {};
  if (range === 'month') {

    params = buildLast12MonthParams();
  } else {

    const now = new Date();
    now.setDate(now.getDate() - 1);
    const endDate = formatDate(now, 'yyyy-MM-dd');

    const startDateObj = new Date(now);
    startDateObj.setDate(now.getDate() - 6);
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

    chartData.value = {};
    console.warn('图表数据接口失败，code:', code);
  }
  chartReady.value = true;
  console.log('图表数据就绪状态:', chartReady.value);
}


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
