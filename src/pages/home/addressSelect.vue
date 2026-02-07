<template>
  <view class="page">
    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-box">
        <u-icon name="search" size="24" color="#999"></u-icon>
        <input class="search-input" placeholder="请搜索项目" v-model="searchKeyword" @input="handleSearch" />
      </view>
    </view>

    <!-- 地址列表 -->
    <view class="address-list">
      <view
        class="address-item"
        v-for="(item, index) in addressList"
        :key="item.projectId"
        @click="selectAddress(item)"
        :class="{ selected: selectedAddress && selectedAddress.projectId === item.projectId }">
        <view class="address-content">
          <view class="address-info">
            <view class="address-name">{{ item?.name || '未知地址' }}</view>
            <view class="address-desc">
              {{ (item?.provinceName || '') + (item?.cityName || '') + (item?.areaName || '') }}
            </view>
          </view>
        </view>
        <view class="address-check" v-if="selectedAddress && selectedAddress.projectId === item.projectId">
          <u-icon name="checkmark-circle-fill" size="20" color="#4e4036"></u-icon>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="addressList.length === 0">
        <view class="empty-icon">🔍</view>
        <view class="empty-text">未找到相关地址</view>
        <view class="empty-desc">请尝试其他关键词</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { ref } from 'vue';

import { projectList } from '@/api/home';

const selectedAddress = ref({});
const searchKeyword = ref('');
const addressList = ref([]);

onLoad(async (options) => {
  const selected = options.selectedAddress;
  await getAddressList();
  if (selected && addressList.value.length > 0) {
    selectedAddress.value = selected ? JSON.parse(decodeURIComponent(selected)) : addressList.value[0];
  }
});

async function getAddressList() {
  const res = await projectList();
  const data = res.data || [];
  console.log('data', data);
  addressList.value = data;
  return res;
}


function filterAddressList(keyword) {
  if (!keyword) return selectedAddress.value;
  addressList.value = addressList.value.filter(
    (item) =>
      item.name.toLowerCase().includes(keyword.toLowerCase()) ||
      item.provinceName.toLowerCase().includes(keyword.toLowerCase()) ||
      item.cityName.toLowerCase().includes(keyword.toLowerCase()) ||
      (item.areaName && item.areaName.toLowerCase().includes(keyword.toLowerCase()))
  );
}


const handleSearch = () => {

  filterAddressList(searchKeyword.value);
};


const selectAddress = (item) => {
  selectedAddress.value = item;
  uni.$emit('selected-address', item);
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.page {
  background: linear-gradient(90deg, #efefef 0%, #f7f7f7 50%, #fff 100%);
  min-height: 100vh;
  overflow: hidden;
}

.search-section {
  padding: 30rpx;

  .search-box {
    display: flex;
    align-items: center;
    padding: 20rpx 24rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
    border: 2rpx solid transparent;
    transition: all 0.3s ease;

    &:focus-within {
      border-color: #4e4036;
      box-shadow: 0 8rpx 32rpx rgba(78, 64, 54, 0.2);
    }

    .search-input {
      flex: 1;
      margin-left: 20rpx;
      font-size: 30rpx;
      color: #333;
      border: none;
      outline: none;
      background: transparent;

      &::placeholder {
        color: #999;
      }
    }
  }
}

.address-list {
  padding: 0 30rpx 30rpx;

  .address-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 26rpx 24rpx;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    border: 2rpx solid transparent;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.12);
    }

    &.selected {
      border-color: #4e4036;
      box-shadow: 0 8rpx 32rpx rgba(78, 64, 54, 0.15);
    }

    .address-content {
      display: flex;
      align-items: center;
      flex: 1;

      .address-info {
        flex: 1;

        .address-name {
          font-size: 30rpx;
          font-weight: 700;
          color: #333;
          margin-bottom: 8rpx;
          letter-spacing: 0.5rpx;
        }

        .address-desc {
          font-size: 28rpx;
          color: #666;
        }
      }
    }

    .address-check {
      width: 50rpx;
      height: 50rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
  }

  .empty-state {
    text-align: center;
    padding: 100rpx 50rpx;

    .empty-icon {
      font-size: 120rpx;
      margin-bottom: 30rpx;
      opacity: 0.6;
    }

    .empty-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #666;
      margin-bottom: 12rpx;
    }

    .empty-desc {
      font-size: 28rpx;
      color: #999;
    }
  }
}


.address-item {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
