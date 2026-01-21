import mqtt from 'wx-mqtt';
import { useStore } from '@/stores/globalMqttInfo';
// ==================== 常量配置 ====================
const MQTT_CONFIG = {
  url: 'wxs://iot.tck.com.cn:8084/mqtt',
  keepalive: 30,
  connectTimeout: 9 * 1000,
  reconnectPeriod: 1000,
  defaultUsername: 'XCX0001:0101000000000002',
  defaultPassword: '39dc0125d2489439:679836',
  passwordPrefix: '39dc0125d2489439:',
};

// ==================== 状态管理 ====================
let client = null;
let defaultTopic = '';
let isConnected = false;
const subscriptions = []; // 订阅主题列表，用于重连后恢复
const pageTopicHandlers = {}; // 主题 -> 处理函数数组映射
let reconnectTimer = null; // 重新连接定时器
let softReconnectAttempts = 0; // 软重连失败计数
const MAX_SOFT_RECONNECT_ATTEMPTS = 10; // 软重连失败最大次数
// ==================== 工具方法 ====================
const generateClientId = () => 'mqttjs_' + Math.random().toString(16).substring(2, 8);

const findSubscription = (topic) => subscriptions.find((sub) => sub.topic === topic);

const saveSubscription = (topic, options) => {
  const existing = findSubscription(topic);
  if (existing) {
    existing.options = options;
  } else {
    subscriptions.push({ topic, options });
  }
};

const removeSubscription = (topic) => {
  const index = subscriptions.findIndex((sub) => sub.topic === topic);
  if (index > -1) subscriptions.splice(index, 1);
};

const resetConnection = () => {
  client = null;
  isConnected = false;
};

// ==================== MQTT服务 ====================
const mqttService = {
  connect(mqttUserInfo = {}) {
    // 如果已有客户端实例
    if (client) {
      // 复用现有连接（如果仍然在线）
      if (isConnected) return client;

      // 如果已有 client 但当前未连接，尝试主动重连或重建连接
      try {
        if (typeof client.reconnect === 'function') {
          client.reconnect();
          return client;
        }
      } catch (e) {
        console.warn('MQTT 重连失败，即将重建连接:', e);
      }

      // 如果无法正常重连，则重置连接，后续重新创建新的客户端
      resetConnection();
    }

    const { clientId, username, password } = mqttUserInfo;
    const finalClientId = clientId || generateClientId();
    const finalPassword = password ? `${MQTT_CONFIG.passwordPrefix}${password}` : MQTT_CONFIG.defaultPassword;

    client = mqtt.connect(MQTT_CONFIG.url, {
      keepalive: MQTT_CONFIG.keepalive,
      clientId: finalClientId,
      clean: true,
      connectTimeout: MQTT_CONFIG.connectTimeout,
      username: username || MQTT_CONFIG.defaultUsername,
      password: finalPassword,
      reconnectPeriod: MQTT_CONFIG.reconnectPeriod,
      rejectUnauthorized: false,
    });

    // 保存默认订阅主题
    defaultTopic = `olt/receiver/${finalClientId}`;
    if (!findSubscription(defaultTopic)) {
      subscriptions.push({ topic: defaultTopic, options: { qos: 0 } });
    }

    this._bindEvent();
    return client;
  },

  /**
   * 断开连接（主动断开，不会自动重连）
   */
  disconnect() {
    if (client) {
      // 使用 end(true) 强制断开，阻止自动重连
      try {
        client.end(true);
      } catch (e) {
        console.warn('断开连接时出错:', e);
      }
      resetConnection();
      softReconnectAttempts = 0;
    }
  },

  /**
   * 发布消息
   */
  publish(topic, message, options = {}, cb) {
    if (client && isConnected) {
      client.publish(topic, message, options, cb);
      return;
    }
  },

  /**
   * 订阅主题
   */
  subscribe(topic, options = {}, cb) {
    if (client && isConnected) {
      client.subscribe(topic, options, cb);
      saveSubscription(topic, options);
    }
  },

  /**
   * 取消订阅
   */
  unsubscribe(topic, cb) {
    if (client && isConnected) {
      console.log('取消订阅主题:', topic);
      client.unsubscribe(topic, cb);
      removeSubscription(topic);
    }
  },

  /**
   * 监听事件
   */
  on(event, callback) {
    if (!client) return;
    client.on(event, callback);
  },

  /**
   * 移除事件监听
   */
  off(event, callback) {
    if (!client) return;
    // 兼容不同客户端实现
    const removeMethods = ['off', 'removeListener', 'removeEventListener'];
    for (const method of removeMethods) {
      if (typeof client[method] === 'function') {
        try {
          client[method](event, callback);
          break;
        } catch (e) {
          // 继续尝试下一个方法
        }
      }
    }
  },

  /**
   * 检查连接状态
   */
  isConnected() {
    return isConnected;
  },

  // 注册页面级主题处理函数
  registerPageTopicHandler(topic, handler) {
    if (!pageTopicHandlers[topic]) {
      pageTopicHandlers[topic] = [];
      // 当第一个页面处理器注册时，才全局订阅该主题，避免重复订阅
      this.subscribe(topic);
    }
    pageTopicHandlers[topic].push(handler);
    console.log('注册页面级主题处理函数:', topic);
  },

  // 注销页面级主题处理函数
  unregisterPageTopicHandler(topic, handler) {
    if (pageTopicHandlers[topic]) {
      const index = pageTopicHandlers[topic].indexOf(handler);
      if (index > -1) {
        pageTopicHandlers[topic].splice(index, 1);
      }
      // 如果没有页面关心这个主题了，可以退订（根据业务需求谨慎决定）
      if (pageTopicHandlers[topic].length === 0) {
        delete pageTopicHandlers[topic];
        this.unsubscribe(topic);
      }
    }
  },
  /**
   * 绑定MQTT事件
   */
  _bindEvent() {
    if (!client) return;
    const self = this;
    // 移除旧的事件监听器，避免重复绑定（兼容性处理）
    const events = ['message', 'connect', 'error', 'close', 'reconnect', 'offline'];
    events.forEach((event) => {
      if (typeof client.removeAllListeners === 'function') {
        try {
          client.removeAllListeners(event);
        } catch (e) {
          // 忽略错误，继续执行
        }
      }
    });
    let messageHandler = null;

    // 若已存在旧回调，先解绑以避免重复绑定
    if (messageHandler) {
      try {
        if (typeof client.off === 'function') {
          client.off('message', messageHandler);
        }
      } catch (e) {}
    }
    // 定义并绑定新的回调
    messageHandler = (topic, message) => {
      let messageData;
      try {
        messageData = JSON.parse(message);
        messageData.topic = topic;
      } catch (e) {}

      switch (topic) {
        case defaultTopic:
          console.log('接收全局主题消息:', messageData);
          // 接收全局主题消息
          useStore().setUserInfo(messageData);
          break;
        default:
          // 其他全局主题，检查是否有页面级注册了此主题的处理函数
          if (pageTopicHandlers[topic]) {
            pageTopicHandlers[topic].forEach((handler) => {
              try {
                handler(messageData, topic);
              } catch (error) {
                console.error(`处理主题 ${topic} 的页面回调出错:`, error);
              }
            });
          }
          break;
      }
    };
    client.on('message', messageHandler);

    client.on('connect', () => {
      isConnected = true;
      softReconnectAttempts = 0;
      console.log('✅ MQTT连接成功');
      // 连接成功后，重新订阅所有主题
      this._resubscribeAll();
    });

    client.on('error', (err) => {
      isConnected = false;
      console.error('❌ MQTT连接错误:', err);
      // 不主动关闭连接，让库根据 reconnectPeriod 自动重连
    });

    client.on('close', () => {
      isConnected = false;
      console.log('🔌 MQTT连接关闭，等待自动重连...');
      // close 事件触发后，库会根据 reconnectPeriod 自动尝试重连
    });

    client.on('reconnect', () => {
      console.log('🔄 MQTT正在重连...');
      // 重连过程中保持 isConnected 为 false
    });

    client.on('offline', () => {
      isConnected = false;
      console.log('📴 MQTT客户端离线');
      handlerReconnect();
    });
    // 客户端离线后，手动调用重新连接
    function handlerReconnect() {
      if (reconnectTimer) return; // 避免重复触发
      if (softReconnectAttempts >= MAX_SOFT_RECONNECT_ATTEMPTS) {
        console.warn(`MQTT 软重连超过 ${MAX_SOFT_RECONNECT_ATTEMPTS} 次，停止重试`);
        return;
      }
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        try {
          client.end(true); // 强制断开，清理旧 socket
        } catch (e) {}
        softReconnectAttempts += 1;
        self.connect(uni.getStorageSync('mqttUserInfo') || {}); // 重建连接
      }, 2000); // 延迟 2s，给自动重连一点时间，视情况调节
    }
  },

  /**
   * 重新订阅所有主题（重连后恢复）
   */
  _resubscribeAll() {
    if (!client || !isConnected || subscriptions.length === 0) {
      return;
    }
    console.log(`开始重新订阅 ${subscriptions.length} 个主题...`);
    subscriptions.forEach(({ topic, options }) => {
      client.subscribe(topic, options, (error) => {
        if (error) {
          console.error(`重新订阅主题失败 [${topic}]:`, error);
        } else {
          console.log(`重新订阅主题成功 [${topic}]`);
        }
      });
    });
  },
};

export default mqttService;
