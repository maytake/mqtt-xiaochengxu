<script>
import request from '@/utils/request';
import mqttService from '@/utils/mqtt';

export default {
  onLaunch: function () {
    // 全局路由拦截，只拦截 pages/intelligent/detail 页面
    uni.addInterceptor('navigateTo', {
      invoke(args) {
        console.log('路由拦截');
        const urls = ['/pages/intelligent/detail', '/pages/message/detail'];
        // 提取路径部分（去掉 query）
        const path = args.url.split('?')[0];
        if (urls.includes(path)) {
          const token = uni.getStorageSync('token');
          if (!token) {
            uni.navigateTo({
              url: '/pages/login/login?redirect=' + encodeURIComponent(args.url),
            });
            return false; // 阻止原跳转
          }
        }
        return true; // 允许跳转
      },
    });
    // 初始化MQTT连接
    this.globalData.mqttService = mqttService;

    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      // 网络从断开恢复到连接时，立即触发MQTT重连
      if (res.isConnected) {
        console.log('🌐 网络已恢复，立即重连MQTT');
        // 网络恢复时，延迟500ms后重连，确保网络稳定
        this.checkAndConnectMqtt({ delay: 500 });
      }
    });
    // 如果已有登录信息，自动连接MQTT（应用启动时无条件连接）
    this.checkAndConnectMqtt({ delay: 0 });
  },

  onShow: function () {
    // 应用回到前台时，强制断开并重新连接MQTT（解决状态不同步问题）
    this.checkAndConnectMqtt();
    // 应用回到前台时，立刻触发一次刷新，避免后台期间定时器被清理
    // this.refreshToken();
  },

  onHide: function () {
    // 清除定时器
    this.clearTimeoutToken();
  },

  data() {
    return {
      refreshTokenTimer: null,
      isRefreshing: false, // 防止重复刷新
      mqttTimer: null, // MQTT连接定时器
    };
  },

  methods: {
    clearMqttTimer() {
      if (this.mqttTimer) {
        clearTimeout(this.mqttTimer);
        this.mqttTimer = null;
      }
    },
    // 检查并连接MQTT（公共方法）
    checkAndConnectMqtt(options = {}) {
      const { delay = 300 } = options;
      const mqttUserInfo = uni.getStorageSync('mqttUserInfo');
      const token = uni.getStorageSync('token');

      if (mqttUserInfo && token) {
        const mqttService = this.globalData.mqttService;
        if (mqttService) {
          // 先断开连接（不管当前是否连接）
          mqttService.disconnect();
          // 延迟后重新连接，确保断开操作完成
          this.clearMqttTimer();
          this.mqttTimer = setTimeout(() => {
            mqttService.connect(mqttUserInfo);
          }, delay);
        }
      }
    },
    clearTimeoutToken() {
      if (this.refreshTokenTimer) {
        clearTimeout(this.refreshTokenTimer);
        this.refreshTokenTimer = null;
      }
    },
    // 刷新token
    refreshToken() {
      // 防止重复刷新
      if (this.isRefreshing) {
        console.log('token正在刷新中，跳过本次请求');
        return;
      }

      this.isRefreshing = true;
      const refresh_token = uni.getStorageSync('refresh_token');
      if (!refresh_token) {
        console.warn('refresh_token不存在，停止刷新');
        this.isRefreshing = false; // 重置刷新标志
        return;
      }

      request({
        url: '/auth/oauth/token',
        header: {
          noNeedToken: true,
          'content-Type': 'application/x-www-form-urlencoded',
          Client_type: 'applet',
        },
        method: 'POST',
        data: {
          grant_type: 'refresh_token',
          refresh_token: refresh_token,
        },
      })
        .then((res) => {
          if (res.code == 0) {
            const { access_token, refresh_token: refresh_token_new, expires_in } = res || {};
            uni.setStorageSync('token', access_token);
            uni.setStorageSync('refresh_token', refresh_token_new);

            // 计算下次刷新时间：expires_in 减 60 秒缓冲，最小 60 秒
            let nextRefreshTime = (expires_in - 60) * 1000;

            // 防止nextRefreshTime为负数，最小设置为1分钟
            if (nextRefreshTime <= 0) {
              nextRefreshTime = 60 * 1000; // 1分钟
            }

            // 清除之前的定时器
            if (this.refreshTokenTimer) {
              clearTimeout(this.refreshTokenTimer);
            }

            // 设置下次刷新定时器
            this.refreshTokenTimer = setTimeout(() => {
              this.refreshToken();
            }, nextRefreshTime);
          }
        })
        .finally(() => {
          this.isRefreshing = false; // 重置刷新标志
        });
    },
  },
};
</script>

<style lang="scss">
@import '@/static/font/iconfont.css';
</style>
