<template>
  <view class="page">
    <!-- 头部背景和用户信息区域 -->
    <view class="header-section">
      <image class="bg-image" src="/static/images/minebg.jpg" mode="aspectFill"></image>
      <view class="user-info">
        <image class="avatar" src="/static/images/avatar.jpg" mode="aspectFill"></image>
        <text class="username">娜威森林</text>
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
import { getCurrentInstance } from 'vue';
import { onShow } from '@dcloudio/uni-app';

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
        uni.clearStorageSync();
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
</style>
