# Vue3 + UniApp 项目文件提示词

这是一个完善的Vue3+UniApp项目，包含了请求封装、Vuex状态管理和多平台兼容支持。

## 项目结构

```
src/
├── utils/                 # 工具函数
│   ├── request.js        # 请求封装
│   ├── api.js           # API接口管理
│   ├── common.js        # 通用工具函数
│   ├── platform.js      # 平台兼容工具
│   └── example.js       # 使用示例
├── store/               # Vuex状态管理
│   ├── index.js         # 主入口
│   └── modules/         # 模块
│       └── system.js    # 系统模块
├── components/          # 组件
├── pages/              # 页面
├── static/             # 静态资源
├── App.vue            # 应用入口
├── main.js            # 主入口
├── pages.json         # 页面配置
└── manifest.json      # 应用配置
```

## 功能特性

### 1. 请求文件 (`src/utils/request.js`)

- **统一请求封装**: 支持GET、POST、PUT、DELETE等请求方法
- **请求拦截器**: 自动添加token和平台标识
- **响应拦截器**: 统一处理响应数据和错误
- **多平台兼容**: 支持H5、小程序、App等平台
- **错误处理**: 自动处理网络错误和业务错误

**使用示例:**
```javascript
import http from '@/utils/request'

// GET请求
const config = await http.get('/system/config')

// POST请求
const updateResult = await http.post('/system/update', {
  version: '1.0.1'
})
```

### 2. API接口管理 (`src/api/index.js`)

- **模块化管理**: 按功能模块组织API接口
- **类型安全**: 提供完整的接口定义
- **易于维护**: 集中管理所有接口地址

**使用示例:**
```javascript
import api from '@/utils/api'

// 获取系统配置
const config = await api.system.getSystemConfig()

// 获取版本信息
const versionInfo = await api.system.getVersionInfo()

// 检查更新
const updateInfo = await api.system.checkUpdate()
```

### 3. pinia状态管理

#### 主入口 
- **模块化设计**: 按功能模块组织状态
- **全局状态**: 管理应用级别的状态
- **网络监听**: 自动监听网络状态变化

#### 系统模块 
- **系统配置**: 获取系统配置信息
- **版本管理**: 版本检查和更新
- **缓存管理**: 数据缓存和过期处理
- **应用状态**: 应用启动状态和设置

### 4. 平台兼容性支持

#### 平台工具 (`src/utils/platform.js`)
- **分享功能**: 微信分享、朋友圈分享
- **支付功能**: 微信支付、支付宝支付
- **定位功能**: 获取位置、打开地图
- **媒体功能**: 拍照、选择图片/视频
- **设备功能**: 拨打电话、震动、剪贴板

#### 通用工具 (`src/utils/common.js`)
- **存储工具**: 本地存储管理
- **时间工具**: 时间格式化和相对时间
- **验证工具**: 手机号、邮箱、身份证验证
- **数字工具**: 金额格式化、数字格式化

**使用示例:**
```javascript
import { platformUtils } from '@/utils/platform'
import { storage, time, validate } from '@/utils/common'

// 分享到微信
await platformUtils.share.toWeixin({
  title: '分享标题',
  summary: '分享描述',
  imageUrl: 'https://example.com/image.jpg',
  href: 'https://example.com'
})

// 存储数据
storage.set('userToken', 'abc123')

// 格式化时间
const formattedTime = time.format(new Date(), 'YYYY-MM-DD HH:mm:ss')

// 验证手机号
const isValidPhone = validate.isPhone('13800138000')
```

## 平台支持

### H5
- ✅ 请求封装
- ✅ Vuex状态管理
- ✅ 通用工具函数
- ✅ 部分平台功能（分享、支付等需要额外配置）

### 微信小程序
- ✅ 请求封装
- ✅ Vuex状态管理
- ✅ 通用工具函数
- ✅ 完整平台功能支持

### 支付宝小程序
- ✅ 请求封装
- ✅ Vuex状态管理
- ✅ 通用工具函数
- ✅ 部分平台功能支持

### App (uni-app)
- ✅ 请求封装
- ✅ Vuex状态管理
- ✅ 通用工具函数
- ✅ 完整平台功能支持

## 安装和配置

### 1. 安装依赖
```bash
npm install vuex@next
```

### 2. 配置请求基础URL
在 `src/utils/request.js` 中修改配置：
```javascript
const config = {
  development: {
    baseURL: 'http://localhost:3000/api',  // 开发环境
    timeout: 10000
  },
  production: {
    baseURL: 'https://your-api-domain.com/api',  // 生产环境
    timeout: 10000
  }
}
```

### 3. 配置API接口
在 `src/utils/api.js` 中根据实际接口调整API地址。

### 4. 初始化应用
在 `src/main.js` 中已经配置了Vuex，应用启动时会自动初始化。

## 使用指南

### 1. 在页面中使用Vuex
```vue
<template>
  <view>
    <text>加载状态: {{ isLoading ? '加载中' : '已完成' }}</text>
    <text>网络状态: {{ isOnline ? '在线' : '离线' }}</text>
  </view>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['isLoading', 'isOnline']),
    ...mapGetters('system', ['getSystemConfig'])
  },
  methods: {
    ...mapActions(['setLoading']),
    ...mapActions('system', ['initSystem']),
    
    async handleInit() {
      this.setLoading(true)
      await this.initSystem()
      this.setLoading(false)
    }
  }
}
</script>
```

### 2. 在组件中使用API
```vue
<script>
import api from '@/utils/api'

export default {
  data() {
    return {
      systemConfig: null
    }
  },
  async onLoad() {
    try {
      const result = await api.system.getSystemConfig()
      this.systemConfig = result.data
    } catch (error) {
      console.error('获取系统配置失败:', error)
    }
  }
}
</script>
```

### 3. 使用平台功能
```vue
<script>
import { platformUtils } from '@/utils/platform'

export default {
  methods: {
    async handleShare() {
      try {
        await platformUtils.share.toWeixin({
          title: '分享标题',
          summary: '分享描述',
          imageUrl: 'https://example.com/image.jpg',
          href: 'https://example.com'
        })
      } catch (error) {
        console.error('分享失败:', error)
      }
    },
    
    async handlePayment() {
      try {
        await platformUtils.payment.weixinPay({
          timeStamp: '1234567890',
          nonceStr: 'nonceStr',
          package: 'prepay_id=wx123456789',
          signType: 'MD5',
          paySign: 'paySign'
        })
      } catch (error) {
        console.error('支付失败:', error)
      }
    }
  }
}
</script>
```

## 注意事项

1. **平台兼容性**: 某些功能在不同平台上的支持程度不同，请根据实际需求调整
2. **错误处理**: 所有异步操作都包含了错误处理，建议在生产环境中添加更详细的错误日志
3. **性能优化**: 对于大量数据的处理，建议使用分页和虚拟滚动
4. **安全性**: 敏感信息（如token）应该安全存储，避免明文存储
5. **网络状态**: 建议在网络状态变化时提示用户

## 扩展功能

### 1. 添加新的API模块
在 `src/utils/api.js` 中添加新的API模块：
```javascript
export const newApi = {
  getData: (params) => http.get('/new/data', params),
  createData: (data) => http.post('/new/data', data)
}
```

### 2. 添加新的Vuex模块
创建新的模块文件，例如 `src/store/modules/newModule.js`：
```javascript
const state = {
  // 状态定义
}

const getters = {
  // 计算属性
}

const mutations = {
  // 同步操作
}

const actions = {
  // 异步操作
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
```

然后在 `src/store/index.js` 中注册模块：
```javascript
import newModule from './modules/newModule'

export default createStore({
  modules: {
    // ... 其他模块
    newModule
  }
})
```

### 3. 添加新的平台功能
在 `src/utils/platform.js` 中添加新的平台功能：
```javascript
export const platformUtils = {
  // ... 现有功能
  newFeature: {
    doSomething: () => {
      // 平台特定实现
    }
  }
}
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request



