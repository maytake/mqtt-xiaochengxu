<template>
	<view>
		<button class="close-btn" @click="loginOut">退出登录</button>
	</view>
</template>


<script setup>
import { getCurrentInstance } from 'vue'
import { onShow } from '@dcloudio/uni-app'
function loginOut() {
	uni.clearStorageSync()
}


</script>


<style></style>
