<template>
  <view class="page">
    <!-- 头部背景和用户信息区域 -->
    <view class="header-section">
      <image class="bg-image" src="/static/images/minebg.jpg" mode="aspectFill"></image>
      <view class="user-info">
        <image class="avatar" src="/static/images/avatar.jpg" mode="aspectFill"></image>
        <text class="username">娜威森林</text>
        <!-- 顶部地址选择 -->
        <view class="location-section">
          <view class="location-selector" @click="selectAddress">
            <view class="location-icon">
              <text class="font_family location-icon-text">&#xe60c;</text>
            </view>
            <view class="location-text">{{ selectedAddress?.name || 'TCK产业园' }}</view>
            <view class="location-arrow">
              <u-icon name="arrow-down" size="16" color="#666"></u-icon>
            </view>
          </view>
        </view>
        <!-- 顶部地址选择 end-->
      </view>
    </view>

    <!-- 菜单选项列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="handleMenuClick('account')">
        <text class="menu-text">账号</text>
        <text class="font_family arrow">&#xe60d;</text>
      </view>

      <view class="menu-item noline" @click="handleMenuClick('password')">
        <text class="menu-text">密码</text>
        <text class="font_family arrow">&#xe60d;</text>
      </view>

      <view class="divider"></view>

      <view class="menu-item" @click="handleMenuClick('bindPhone')">
        <text class="menu-text">绑定手机</text>
        <text class="font_family arrow">&#xe60d;</text>
      </view>

      <view class="menu-item noline" @click="handleMenuClick('help')">
        <text class="menu-text">帮助与反馈</text>
        <text class="font_family arrow">&#xe60d;</text>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-btn" @click="loginOut">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance();
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { useStore } from '@/stores/index';
import { projectList } from '@/api/home';
const mainStore = useStore();
const selectedAddress = ref({});
onLoad(async () => {
  const url = proxy.$getCurrentRoute();
  const isLogin = proxy.$checkLogin(url);
  if (isLogin) {
    // 优先尝试从本地缓存恢复上次选择的地址与楼层
    const cacheAddress = uni.getStorageSync('HOME_SELECTED_ADDRESS');
    if (cacheAddress && cacheAddress.parentCode) {
      uni.$emit('selected-address', cacheAddress, 'mine');
    } else {
      // 加载数据
      initData();
    }
  }
});
// 处理菜单点击
function handleMenuClick(type) {
  switch (type) {
    case 'account':
      uni.showToast({
        title: '账号设置',
        icon: 'none',
      });
      break;
    case 'password':
      uni.showToast({
        title: '密码设置',
        icon: 'none',
      });
      break;
    case 'bindPhone':
      uni.showToast({
        title: '绑定手机',
        icon: 'none',
      });
      break;
    case 'help':
      uni.showToast({
        title: '帮助与反馈',
        icon: 'none',
      });
      break;
  }
}

// 退出登录
function loginOut() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: function (res) {
      if (res.confirm) {
        uni.removeStorageSync('token');
        uni.removeStorageSync('refresh_token');
        uni.showToast({
          title: '已退出登录',
          icon: 'success',
        });
        uni.redirectTo({
          url: '/pages/login/login',
        });
        let mqttService = getApp().globalData.mqttService;
        if (mqttService) {
          mqttService.disconnect();
          mqttService = null;
        }
      }
    },
  });
}

async function initData() {
  // 获取第一个默认地址
  const res = await projectList();
  if (res.code === 0) {
    const data = res.data || [];
    const itemAddress = data[0];
    selectedAddress.value = itemAddress; // 选中项目地址
    mainStore.setProjectItem(itemAddress); // 设置项目地址
    uni.setStorageSync('HOME_SELECTED_ADDRESS', itemAddress);
  }
}

uni.$on('selected-address', (itemAddress) => {
  selectedAddress.value = itemAddress; // 选中项目地址
  mainStore.setProjectItem(itemAddress); // 设置项目地址
});

const selectAddress = () => {
  const query = encodeURIComponent(JSON.stringify(selectedAddress.value));
  uni.navigateTo({
    url: `/pages/home/addressSelect?selectedAddress=${query}`,
  });
};

onUnload(() => {
  // 页面卸载时再移除监听，防止重复注册
  uni.$off('selected-address');
});
</script>

<style lang="scss" scoped>
.page {
  background: linear-gradient(90deg, #efefef 0%, #f7f7f7 50%, #fff 100%);
  min-height: 100vh;
  overflow: hidden;
}
/* 头部区域 */
.header-section {
  position: relative;
  height: 398rpx;
  overflow: hidden;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.user-info {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.avatar {
  width: 138rpx;
  height: 138rpx;
  border-radius: 69rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
  margin-bottom: 20rpx;
}

.username {
  color: #222;
  font-size: 32rpx;
  font-weight: 500;
  text-shadow: 0 1rpx 2rpx rgba(255, 255, 255, 0.8);
}

/* 菜单列表 */
.menu-list {
  overflow: hidden;
}

.menu-item {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 110rpx;
  padding: 0 30rpx;
  position: relative;
  background-color: #fff;

  &::after {
    content: '';
    position: absolute;
    left: 30rpx;
    right: 0;
    bottom: 0;
    height: 1px;
    background: #eeeeee;
    pointer-events: none;
  }
}

.noline::after {
  display: none;
}

.menu-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #222;
}

.arrow {
  font-size: 24rpx;
  color: #7e7e7f;
}

.divider {
  width: 100%;
  height: 30rpx;
}

/* 退出登录按钮 */
.logout-section {
  margin: 400rpx 0 200rpx;
  display: flex;
  justify-content: center;
}

.logout-btn {
  width: 100%;
  height: 100rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: #222;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

uni-button:after,
wx-button:after {
  border: none;
}

.location-section {
  margin-top: 30rpx;

  .location-selector {
    display: inline-flex;
    align-items: center;
    // padding: 24rpx 0;
    border-radius: 16rpx;

    .location-icon {
      margin-right: 12rpx;
    }
    .location-icon-text {
      font-size: 26rpx;
      color: #333;
    }
    .location-text {
      font-size: 30rpx;
      color: #333;
    }

    .location-arrow {
      margin-left: 16rpx;
    }
  }
}
</style>
