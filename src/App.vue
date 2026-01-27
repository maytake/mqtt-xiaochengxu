<script>
import request from '@/utils/request';
import mqttService from '@/utils/mqtt';
import { getFaultMessageCount } from '@/api/message';

import { computed, watch, getCurrentInstance, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useStore } from '@/stores/index';

export default {
  setup() {
    let reportTopic = ''
    const { proxy } = getCurrentInstance();

    // 页面级主题消息处理函数
    const handleReportTopicResponse = (messageData, topic) => {
      console.log('pageMessage', messageData);
      if (messageData) {
        // 后端返回的消息总量 messageCount 需要在接口基础上累加
        proxy.messageCount = (proxy.messageCount || 0) + 1;
        proxy.updateTabBarBadge();
      }
    };

    const { projectItem } = storeToRefs(useStore());
    const projectId = computed(() => projectItem.value?.projectId);

    // 监听 projectId 变化，切换订阅主题
    watch(
      projectId,
      (newVal, oldVal) => {
        console.log('projectId', newVal, oldVal);
        // 先取消旧主题订阅
        if (oldVal) {
          const oldTopic = `olt/fault/push/${oldVal}`;
          mqttService.unregisterPageTopicHandler(oldTopic, handleReportTopicResponse);
        }

        // 订阅新主题
        if (newVal) {
          reportTopic = `olt/fault/push/${newVal}`;
          mqttService.registerPageTopicHandler(reportTopic, handleReportTopicResponse);
          // 等下一轮视图/TabBar 更新完毕后再去请求接口
          // 等下一轮视图/TabBar 更新完毕后再去请求接口
          nextTick(() => {
            proxy.getFaultMessageCountFn();
          });
        }
      },
      { immediate: false }
    );

    // 可以根据需要在初始化时手动调用一次
    // handleReportTopicResponse();
  },
  onLaunch() {
    // 全局路由拦截，只拦截 pages/intelligent/detail 页面
    uni.addInterceptor('navigateTo', {
      invoke(args) {
        console.log('路由拦截');
        const urls = ['/pages/intelligent/detail', '/pages/message/detail'];
        // 提取路径部分（去掉 query）
        const path = args.url.split('?')[0];
        if (urls.includes(path)) {
          const token = uni.getStorageSync('token');
          console.log('token', token);
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
      messageCount: 0,
    };
  },

  methods: {
    // 更新（或移除）TabBar 角标
    updateTabBarBadge() {
      const count = this.messageCount ? String(this.messageCount) : null;

      // ============ 辅助：设置角标（带最多 5 次重试） =============
      const trySet = (retry = 0) => {
        uni.setTabBarBadge({
          index: 1,
          text: count,
          success: () => { },
          fail: (err) => {
            if (retry < 5) {
              setTimeout(() => trySet(retry + 1), 300);
            }
          },
        });
      };

      // 如果不需要显示数字，仅移除即可
      if (!count) {
        const tryRemove = (retry = 0) => {
          uni.removeTabBarBadge({
            index: 1,
            success: () => { },
            fail: () => {
              // if (retry < 5) {
              //   setTimeout(() => tryRemove(retry + 1), 300);
              // }
            },
          });
        };
        return tryRemove();
      }

      // 需要显示数字：先移除再设置，确保顺序
      const removeThenSet = (retry = 0) => {
        uni.removeTabBarBadge({
          index: 1,
          // 无论成功失败，都继续 set（失败多半是还未设置过角标，本来也无需再移除）
          complete: () => {
            // 给一点点缓冲再设置，避免极端渲染冲突；无需双重 setTimeout
            setTimeout(() => trySet(), 50);
          },
          fail: () => {
            // 如果 remove 失败，重试几次；超过次数直接继续 set
            if (retry < 5) {
              setTimeout(() => removeThenSet(retry + 1), 300);
            }
          },
        });
      };
      removeThenSet();
    },
    // 获取未读消息数量
    async getFaultMessageCountFn() {
      const { projectItem } = storeToRefs(useStore());
      const projectId = projectItem.value?.projectId
      console.log('全局页面projectId', projectId)
      if (!projectId) return;
      const res = await getFaultMessageCount({ projectId });
      if (res.code === 0) {
        console.log('全局页面的故障消息数量', res.data);
        this.messageCount = res.data;
        this.updateTabBarBadge();
      }
    },
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

/* 全局样式 */
.settings-btn {
  display: flex;
  justify-content: flex-end;
  margin: 10rpx 0 20rpx;
}

.settings-text {
  background: linear-gradient(-90deg, #efefef 0%, #fff 100%);
  border-radius: 30rpx;
  padding: 8rpx 24rpx;
  font-size: 28rpx;
  color: #333;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid #e0e0e0;
}
.picker-text {
  text-align: right;
  background: none;
  color: #9aa0a6;
  font-size: 28rpx;
  width: 120rpx;
}
</style>