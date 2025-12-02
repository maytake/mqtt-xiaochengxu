/**
 * 响应式丢失问题详解
 * 
 * 这个文件展示了为什么直接解构 Pinia store 会失去响应式
 */

import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useStore } from './index';

const store = useStore();

// ============================================
// ❌ 错误示例：直接解构（失去响应式）
// ============================================
const { isLoggedIn: isLoggedInWrong, token: tokenWrong } = store;

// 问题说明：
// 1. 直接解构时，JavaScript 会获取当前时刻的值
// 2. isLoggedInWrong 和 tokenWrong 只是普通变量，不是响应式引用
// 3. 当 store 中的值改变时，这些变量不会自动更新
// 4. 在模板中使用时，视图不会更新

// 测试：修改 token
store.setToken('new-token');

// 此时：
console.log('store.isLoggedIn:', store.isLoggedIn); // ✅ true（已更新）
console.log('isLoggedInWrong:', isLoggedInWrong); // ❌ false（未更新，还是旧值）

// ============================================
// ✅ 正确示例1：使用 storeToRefs（保持响应式）
// ============================================
const { isLoggedIn: isLoggedInCorrect, token: tokenCorrect } = storeToRefs(store);

// 说明：
// 1. storeToRefs 会将 store 的响应式属性转换为 ref
// 2. isLoggedInCorrect 是一个 ref，具有响应式特性
// 3. 访问时需要使用 .value：isLoggedInCorrect.value
// 4. 当 store 中的值改变时，ref 会自动更新

// 测试：修改 token
store.setToken('another-token');

// 此时：
console.log('store.isLoggedIn:', store.isLoggedIn); // ✅ true（已更新）
console.log('isLoggedInCorrect.value:', isLoggedInCorrect.value); // ✅ true（已更新）

// ============================================
// ✅ 正确示例2：直接使用 store（保持响应式）
// ============================================
// 最简单的方式，不需要解构
// 在模板中直接使用：store.isLoggedIn
// 在脚本中直接使用：store.isLoggedIn

// 测试：修改 token
store.setToken('final-token');

// 此时：
console.log('store.isLoggedIn:', store.isLoggedIn); // ✅ true（已更新）

// ============================================
// 实际对比示例
// ============================================

export function demonstrateReactivity() {
  console.log('=== 响应式对比演示 ===\n');
  
  // 初始状态
  store.setToken('');
  console.log('1. 初始状态（token 为空）');
  console.log('   store.isLoggedIn:', store.isLoggedIn); // false
  console.log('   isLoggedInWrong:', isLoggedInWrong); // false
  console.log('   isLoggedInCorrect.value:', isLoggedInCorrect.value); // false
  console.log('');
  
  // 设置 token
  store.setToken('test-token');
  console.log('2. 设置 token 后');
  console.log('   store.isLoggedIn:', store.isLoggedIn); // ✅ true（已更新）
  console.log('   isLoggedInWrong:', isLoggedInWrong); // ❌ false（未更新！）
  console.log('   isLoggedInCorrect.value:', isLoggedInCorrect.value); // ✅ true（已更新）
  console.log('');
  
  // 清除 token
  store.setToken('');
  console.log('3. 清除 token 后');
  console.log('   store.isLoggedIn:', store.isLoggedIn); // ✅ false（已更新）
  console.log('   isLoggedInWrong:', isLoggedInWrong); // ❌ false（但这是旧值，不是响应式更新）
  console.log('   isLoggedInCorrect.value:', isLoggedInCorrect.value); // ✅ false（已更新）
  console.log('');
  
  console.log('结论：');
  console.log('  - store.isLoggedIn 始终是最新的 ✅');
  console.log('  - isLoggedInCorrect.value 始终是最新的 ✅');
  console.log('  - isLoggedInWrong 不会自动更新 ❌');
}

// ============================================
// 在组件中的使用对比
// ============================================

/**
 * ❌ 错误用法（失去响应式）
 */
export const wrongUsage = {
  setup() {
    const store = useStore();
    // 直接解构 - 会失去响应式
    const { isLoggedIn, token } = store;
    
    // 在模板中使用 {{ isLoggedIn }} 不会更新！
    return { isLoggedIn, token };
  }
};

/**
 * ✅ 正确用法1（使用 storeToRefs）
 */
export const correctUsage1 = {
  setup() {
    const store = useStore();
    // 使用 storeToRefs - 保持响应式
    const { isLoggedIn, token } = storeToRefs(store);
    
    // 在模板中使用 {{ isLoggedIn }} 会正常更新 ✅
    // 注意：在 script 中访问需要使用 .value
    return { isLoggedIn, token };
  }
};

/**
 * ✅ 正确用法2（直接使用 store）
 */
export const correctUsage2 = {
  setup() {
    const store = useStore();
    
    // 直接返回 store，在模板中使用 store.isLoggedIn
    return { store };
  }
};

// ============================================
// 为什么会失去响应式？
// ============================================

/**
 * 技术原理：
 * 
 * 1. Pinia store 使用 Vue 的响应式系统（Proxy）
 * 2. 直接解构时，JavaScript 会执行类似这样的操作：
 *    const isLoggedIn = store.isLoggedIn; // 获取当前值，不是引用
 * 3. 这相当于复制了一个普通值，失去了与原始响应式对象的连接
 * 
 * 4. storeToRefs 的工作原理：
 *    - 它会遍历 store 的所有属性
 *    - 将每个属性包装成 ref
 *    - ref 内部保持对原始响应式对象的引用
 *    - 当原始值改变时，ref 会自动更新
 * 
 * 5. 类比理解：
 *    - 直接解构 = 拍照（静态快照）
 *    - storeToRefs = 直播（实时连接）
 */

