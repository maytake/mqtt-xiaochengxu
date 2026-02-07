<template>
  <view class="m-content">
    <!-- 背景图懒加载 -->
    <view class="bg-container">
      <image v-if="showBackground" class="bg-image" :class="{ loaded: backgroundLoaded }" :src="backgroundUrl"
        mode="aspectFill" @load="onBackgroundLoad" @error="onBackgroundError" lazy-load />
      <!-- 加载占位 -->
      <view v-if="!backgroundLoaded" class="bg-placeholder"></view>
    </view>

    <view class="m-header">
      <image class="m-logo" src="@/static/images/logo.png" mode="scaleToFill" lazy-load />
    </view>
    <view class="form-section">
      <form class="form-section-form">
        <view class="m-form-item">
          <text class="font_family m-icon">&#xe609;</text>
          <input class="m-input" v-model="form.username" placeholder="请输入用户名" type="text" border="none"
            @input="onUsernameInput" @blur="onUsernameBlur" />
        </view>
        <view v-if="usernameError && usernameTouched" class="error-tip">{{ usernameError }}</view>

        <view class="m-form-item mt45">
          <text class="font_family m-icon">&#xe60a;</text>
          <input class="m-input" v-model="form.password" type="password" placeholder="请输入密码" border="none"
            :disabled="!isUsernameValid" @input="onPasswordInput" @blur="onPasswordBlur" />
        </view>
        <view v-if="passwordError && passwordTouched" class="error-tip">{{ passwordError }}</view>
        <view class="m-form-item mt45">
          <text class="font_family m-icon">&#xe60a;</text>
          <input class="m-input" v-model="form.code" type="text" placeholder="请输入验证码" border="none" @input="onCodeInput"
            @blur="onCodeBlur" />
          <image @click="getCode" class="m-code-img" :src="codeUrl" mode="scaleToFill" />
        </view>
        <view v-if="codeError && codeTouched" class="error-tip">{{ codeError }}</view>
        <button class="login-btn" :disabled="loading" @click="onLogin">立即登录</button>
        <view class="register">
          还没有账号？
          <text class="register-link">马上注册</text>
        </view>
      </form>
    </view>
    <view class="protocol">
      <view class="protocol-checkbox">
        <view class="custom-checkbox-label" @click="toggleCheck">
          <view :class="['custom-checkbox-view', checked ? 'checked' : '']">
            <view v-if="checked" class="checkmark"></view>
          </view>
          <text>
            我已阅读并同意
            <text class="link" @tap.stop="openUserAgreement">《用户协议》</text>
            与
            <text class="link" @tap.stop="openPrivacyPolicy">《隐私政策》</text>
          </text>
        </view>
      </view>
    </view>
    <!-- 用户协议与隐私政策弹窗 -->
    <u-modal :show="showAgreementModal" title="用户协议及隐私政策" content="我已阅读并同意《用户协议》与《隐私政策》" :showCancelButton="true"
      confirmText="同意并登录" cancelText="不同意" @confirm="onAgreeAndLogin" @cancel="onDisagree"
      @close="showAgreementModal = false" />
  </view>
</template>
<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue';
import { onLoad, onHide } from '@dcloudio/uni-app';
import { encryptPassword, decryptPassword, generateUnique15DigitNumber } from '@/utils/common';
import { getCode as getCodeApi, loginIn, getMqttUserInfo } from '@/api/auth';


const form = reactive({
  username: '',
  password: '',
  code: '',
});


const checked = ref(false);
const loading = ref(false);


const usernameError = ref('');
const passwordError = ref('');
const codeError = ref('');
const usernameTouched = ref(false);
const passwordTouched = ref(false);
const codeTouched = ref(false);


const redirect = ref('');


const codeUrl = ref('');
const randomStr = ref(generateUnique15DigitNumber());


const backgroundUrl = ref('https://smart.tck.com.cn/itemDevice-api/images_xiaochengxu/login_bg.jpg');
const showBackground = ref(false);
const backgroundLoaded = ref(false);
let backgroundLoadTimer = null;


const showAgreementModal = ref(false);


let refreshTokenTimer = null;


const isUsernameValid = computed(() => {
  return /^[a-zA-Z0-9_]{3,16}$/.test(form.username);
});


const canLogin = computed(() => {
  return (
    /^[a-zA-Z0-9_]{3,16}$/.test(form.username) &&
    /^[a-zA-Z0-9_]{6,20}$/.test(form.password) &&
    /^[a-zA-Z0-9_]{4,16}$/.test(form.code)
  );
});


const getCode = async () => {
  randomStr.value = generateUnique15DigitNumber();
  try {
    const result = await getCodeApi({ randomStr: randomStr.value });
    codeUrl.value = 'data:image/gif;base64,' + result;
  } catch (error) {
    console.error('获取验证码失败:', error);
  }
};

const validateUsername = () => {
  const val = form.username;
  if (!val) {
    usernameError.value = '请输入用户名';
  } else if (!/^[a-zA-Z0-9_]{3,16}$/.test(val)) {
    usernameError.value = '用户名3-16位字母、数字或下划线';
  } else {
    usernameError.value = '';
  }
};

const validatePassword = () => {
  const val = form.password;
  if (!val) {
    passwordError.value = '请输入密码';
  } else if (!/^[a-zA-Z0-9_]{6,20}$/.test(val)) {
    passwordError.value = '密码6-20位，需包含字母和数字';
  } else {
    passwordError.value = '';
  }
};

const validateCode = () => {
  const val = form.code;
  if (!val) {
    codeError.value = '请输入验证码';
  } else if (!/^[a-zA-Z0-9_]{4,16}$/.test(val)) {
    codeError.value = '请输入正确的验证码';
  } else {
    codeError.value = '';
  }
};


const onUsernameInput = (e) => {
  console.log('onUsernameInput value:', e.detail.value, 'form.username:', form.username);
  form.username = e.detail.value;
  usernameTouched.value = true;
  validateUsername();
};

const onPasswordInput = (e) => {
  form.password = e.detail.value;
  passwordTouched.value = true;
  validatePassword();
};

const onUsernameBlur = () => {
  console.log('用户名:', form.username);
  usernameTouched.value = true;
  validateUsername();
};

const onPasswordBlur = () => {
  passwordTouched.value = true;
  validatePassword();
};

const onCodeInput = (e) => {
  form.code = e.detail.value;
  codeTouched.value = true;
  validateCode();
};

const onCodeBlur = () => {
  codeTouched.value = true;
  validateCode();
};


const toggleCheck = () => {
  checked.value = !checked.value;
};


const getMqttUserInfofn = async (mqtt_id) => {
  const params = {
    manufacturer: '01',
    model: 'XCX0001',
    productType: '01',
    serial: mqtt_id,
  };
  const mqttUserInfo = await getMqttUserInfo(params);
  const { data = {}, code } = mqttUserInfo || {};
  if (code == 0) {
    const password = decryptPassword(data.password || 'skMxpOYhg+KnJXiwOBGi4w==');
    const newMqttUserInfo = {
      ...data,
      password,
    };
    console.log(newMqttUserInfo);
    uni.setStorageSync('mqttUserInfo', newMqttUserInfo);

    const mqttService = getApp().globalData.mqttService;
    mqttService.connect(newMqttUserInfo);
  }
};


const refreshToken = async (expires_in) => {

  const app = getApp();
  const appVm = app && (app.refreshToken ? app : app.$vm);
  if (appVm && appVm.refreshToken) {

    let nextRefreshTime = (expires_in - 30) * 1000;


    if (nextRefreshTime <= 0) {
      nextRefreshTime = 60 * 1000;
    }


    if (refreshTokenTimer) {
      clearTimeout(refreshTokenTimer);
    }


    refreshTokenTimer = setTimeout(() => {
      console.log('refreshToken');
      appVm.refreshToken();
    }, nextRefreshTime);
  }
};


const onLogin = async (e) => {

  if (e && e.preventDefault) e.preventDefault();

  usernameTouched.value = true;
  passwordTouched.value = true;
  validateUsername();
  validatePassword();

  if (usernameError.value || passwordError.value) return;

  if (!checked.value) {

    showAgreementModal.value = true;
    return;
  }
  try {
    const res = await loginIn({
      grant_type: 'password',
      username: form.username,
      password: encryptPassword(form.password),
      code: form.code,
      randomStr: randomStr.value,
    });
    const { access_token, refresh_token: refresh_token_new, expires_in, mqtt_id, code, msg } = res || {};
    if (code == 0) {
      uni.showToast({
        icon: 'success',
        title: '登录成功',
      });
      uni.setStorageSync('userInfo', res);
      uni.setStorageSync('token', access_token);
      uni.setStorageSync('refresh_token', refresh_token_new);


      getMqttUserInfofn(mqtt_id);

      if (expires_in) {
        refreshToken(expires_in);
      }

      if (redirect.value) {
        if (redirect.value.includes('tabBar')) {
          uni.switchTab({ url: redirect.value });
        } else {
          uni.reLaunch({ url: redirect.value });
        }
      } else {
        uni.reLaunch({ url: '/pages/tabBar/home/index' });
      }
    } else {
      uni.showToast({
        icon: 'none',
        title: msg || '登录失败',
      });
    }
  } catch (error) {
    console.error(error);
  } finally {
    getCode();
  }
};


const onAgreeAndLogin = () => {

  showAgreementModal.value = false;
  checked.value = true;

  onLogin();
};

const onDisagree = () => {

  showAgreementModal.value = false;
};


const startBackgroundLazyLoad = () => {

  backgroundLoadTimer = setTimeout(() => {
    showBackground.value = true;
  }, 100);
};

const onBackgroundLoad = () => {

  backgroundLoaded.value = true;
};

const onBackgroundError = () => {

  backgroundLoaded.value = false;
};

const openUserAgreement = () => {
  uni.navigateTo({
    url: '/pages/login/userAgreement',
  });
};

const openPrivacyPolicy = () => {
  uni.navigateTo({
    url: '/pages/login/privacyPolicy',
  });
};


onLoad((options) => {
  getCode();

  if (options && options.redirect) {
    redirect.value = decodeURIComponent(options.redirect);
  }

  startBackgroundLazyLoad();
});

onHide(() => {

  if (refreshTokenTimer) {
    clearTimeout(refreshTokenTimer);
    refreshTokenTimer = null;
  }

  if (backgroundLoadTimer) {
    clearTimeout(backgroundLoadTimer);
    backgroundLoadTimer = null;
  }
});

onUnmounted(() => {

  if (refreshTokenTimer) {
    clearTimeout(refreshTokenTimer);
    refreshTokenTimer = null;
  }
  if (backgroundLoadTimer) {
    clearTimeout(backgroundLoadTimer);
    backgroundLoadTimer = null;
  }
});
</script>
<style lang="scss" scoped>
.m-content {
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  position: relative;
}

/* 背景图容器 */
.bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

/* 背景图片 */
.bg-image {
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.bg-image.loaded {
  opacity: 1;
}

/* 背景图占位符 */
.bg-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #dedede 0%, #d5d6d7 100%);
}

.m-header {
  width: 100%;
}

.m-logo {
  margin: 200rpx auto 0;
  width: 250rpx;
  height: 154rpx;
  display: block;
}

.form-section {
  margin: 130rpx 90rpx 0 90rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.form-section-form {
  width: 100%;

  .m-form-item {
    display: flex;
    align-items: center;
    background: #e2e2e2;
    height: 100rpx;
    border-radius: 50rpx;
    padding: 0 30rpx;

    .m-input {
      flex: 1;
      height: 48rpx;
      font-size: 28rpx;
      color: #7e7e7e;
      border: none;
      background: transparent;
    }

    .m-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.m-form-item {
  padding: 0 0 20rpx 0;
}

.mt45 {
  margin-top: 45rpx;
}

.m-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 42rpx;
  font-size: 28rpx;
  color: #7e7e7e;
  text-align: center;
  line-height: 48rpx;
}

.login-btn {
  width: 100%;
  margin: 82rpx 0 34rpx 0;
  height: 84rpx;
  line-height: 84rpx;
  background: #574b43;
  color: #fff;
  font-size: 32rpx;
  border: none;
  border-radius: 42rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.15);
}

button[disabled]:not([type]),
button[disabled][type='default'] {
  background: #bbbbbb;
  color: #ffffff;
  cursor: not-allowed;
  opacity: 0.5;
}

.register {
  text-align: center;
  color: #8c8c8c;
  font-size: 26rpx;
  margin-bottom: 16rpx;
}

.register-link {
  color: #574b43;
  margin-left: 8rpx;
}

.protocol {
  position: fixed;
  bottom: 108rpx;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24rpx;
  color: #999;
  z-index: 10;
}

.protocol-checkbox {
  justify-content: center;
}

.checkbox {
  margin-right: 8rpx;
  transform: scale(0.8);
}

.link {
  color: #574b43;
  margin: 0 4rpx;
}


.protocol-checkbox .custom-checkbox-label {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #999;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox-view {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  background: #fff;
  margin-right: 12rpx;
  position: relative;
  box-sizing: border-box;
  transition: border-color 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-checkbox-view.checked {
  border-color: #574b43;
  background: #574b43;
}

.checkmark {
  width: 14rpx;
  height: 6rpx;
  border-left: 3rpx solid #fff;
  border-bottom: 3rpx solid #fff;
  transform: rotate(-45deg);
  position: absolute;
  left: 7rpx;
  top: 7rpx;
}

.error-tip {
  color: #ff4d4f;
  font-size: 24rpx;
  margin: 10rpx 0 0 88rpx;
  min-height: 28rpx;
}

.m-code-img {
  width: 120rpx;
  height: 56rpx;
}
</style>
