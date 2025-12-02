/**
 * 统一请求封装，含请求/响应拦截器，兼容H5、小程序、App
 *
 * 使用示例：
 * // 默认 loading（显示"正在加载中..."）
 * request({ url: '/api/data' })
 *
 * // 自定义 loading 标题
 * request({ url: '/api/data', loadingTitle: '获取数据中...' })
 *
 * // 关闭 loading
 * request({ url: '/api/data', loading: false })
 *
 * // 其他参数
 * request({
 *   url: '/api/data',
 *   method: 'POST',
 *   data: { name: 'test' },
 *   loading: true,
 *   loadingTitle: '提交中...'
 * })
 */

// 基础配置
const config = {
  // 开发环境
  development: {
    baseURL: 'https://smart.tck.com.cn',
    timeout: 10000,
  },
  // 生产环境
  production: {
    baseURL: 'https://smart.tck.com.cn',
    timeout: 10000,
  },
};

// 获取当前环境配置
const getConfig = () => {
  // #ifdef H5
  return process.env.NODE_ENV === 'development' ? config.development : config.production;
  // #endif

  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ || MP-JD || MP-KUAISHOU || MP-LARK || MP-XHS
  return config.production;
  // #endif

  // #ifdef APP-PLUS
  return config.production;
  // #endif
};

function buildUrl(url, params) {
  if (!params) return url;
  const query = Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  return url + (url.includes('?') ? '&' : '?') + query;
}

function getPlatform() {
  // #ifdef H5
  return 'h5';
  // #endif

  // #ifdef MP-WEIXIN
  return 'mp-weixin';
  // #endif

  // #ifdef MP-ALIPAY
  return 'mp-alipay';
  // #endif

  // #ifdef MP-BAIDU
  return 'mp-baidu';
  // #endif

  // #ifdef MP-TOUTIAO
  return 'mp-toutiao';
  // #endif

  // #ifdef MP-QQ
  return 'mp-qq';
  // #endif

  // #ifdef MP-JD
  return 'mp-jd';
  // #endif

  // #ifdef MP-KUAISHOU
  return 'mp-kuaishou';
  // #endif

  // #ifdef MP-LARK
  return 'mp-lark';
  // #endif

  // #ifdef MP-XHS
  return 'mp-xhs';
  // #endif

  // #ifdef APP-PLUS
  return 'app-plus';
  // #endif

  return 'unknown';
}

// 请求拦截器
function requestInterceptor(options) {
  let {
    url,
    method = 'GET',
    params,
    data,
    header = {},
    loading = true,
    loadingTitle = '正在加载中...',
    ...rest
  } = options;
  method = method.toUpperCase();

  // GET请求自动拼接params
  if (method === 'GET' && params) {
    url = buildUrl(url, params);
  }
  // 其他请求兼容data
  if (['POST', 'PUT', 'DELETE'].includes(method) && data == null && params) {
    data = params;
  }

  // 自动加token
  const token = uni.getStorageSync('token');
  if (token && !header.noNeedToken) {
    header.Authorization = `Bearer ${token}`;
  } else {
    header.Authorization = 'Basic dG9pbGV0QXBpOnRvaWxldEFwaXRlc3QxMjM0NTgw';
  }
  header['X-Platform'] = getPlatform();

  return {
    url,
    method,
    data: method === 'GET' ? undefined : data,
    header,
    loading,
    loadingTitle,
    ...rest,
  };
}

// 响应拦截器
function responseInterceptor(res) {
  const { statusCode, data } = res;
  if (statusCode >= 200 && statusCode < 300) {
    return data;
  }
  // 统一错误处理
  let message = '请求失败';
  switch (statusCode) {
    case 401:
      message = '未授权，请重新登录';
      uni.removeStorageSync('token');
      // 登录成功后启动token刷新机制
      const app = getApp();
      const appVm = app && (app.clearTimeoutToken ? app : app.$vm);
      if (appVm && appVm.clearTimeoutToken) {
        appVm.clearTimeoutToken();
      }
      uni.reLaunch({ url: '/pages/login/login' });
      break;
    case 403:
      message = '拒绝访问';
      break;
    case 404:
      message = '请求地址出错';
      break;
    case 500:
      message = '服务器内部错误';
      break;
    default:
      message = data?.message || '网络错误';
  }
  // 延迟显示 toast，避免与 loading 冲突
  setTimeout(() => {
    uni.showToast({ title: message, icon: 'none', duration: 2000 });
  }, 100);
  throw data;
}

export default function request(options) {
  const cfg = getConfig();
  const reqOptions = requestInterceptor(options);

  // 显示 loading
  if (reqOptions.loading) {
    uni.showLoading({
      title: reqOptions.loadingTitle,
      mask: true,
    });
  }

  return new Promise((resolve, reject) => {
    uni.request({
      ...reqOptions,
      url: cfg.baseURL + reqOptions.url,
      method: reqOptions.method,
      data: reqOptions.data,
      header: reqOptions.header,
      timeout: cfg.timeout,
      success: (res) => {
        try {
          const result = responseInterceptor(res);
          const { code, msg } = result;
          if (code !== 0 && msg) {
            // 先关闭 loading，避免与 toast 冲突
            if (reqOptions.loading) {
              uni.hideLoading();
            }
            // 延迟显示 toast，确保 loading 完全关闭
            setTimeout(() => {
              uni.showToast({ title: msg, icon: 'none', duration: 2000 });
            }, 100);
            reject(result);
          } else {
            resolve(result);
          }
        } catch (err) {
          // 如果 responseInterceptor 抛出错误，先关闭 loading
          if (reqOptions.loading) {
            uni.hideLoading();
          }
          reject(err);
        }
      },
      fail: (err) => {
        // 先关闭 loading，避免与 toast 冲突
        if (reqOptions.loading) {
          uni.hideLoading();
        }
        // 延迟显示 toast，确保 loading 完全关闭
        setTimeout(() => {
          uni.showToast({ title: '网络连接失败', icon: 'none', duration: 2000 });
        }, 100);
        reject(err);
      },
      complete: () => {
        // 隐藏 loading（如果还未关闭）
        if (reqOptions.loading) {
          uni.hideLoading();
        }
      },
    });
  });
}
