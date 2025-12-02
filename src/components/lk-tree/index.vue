<template>
  <view class="lk-tree-wrapper" @tap.stop="handleWrapperClick">
    <!-- 选择框 -->
    <view v-if="!isInner && dropdown" class="selector" @tap="toggleDropdown">
      <text class="selector-text">{{ selectedLabel || placeholder }}</text>
      <view :class="['arrow', { open: dropdownOpen }]" />
    </view>
    <!-- 树形结构 -->
    <view v-if="isInner || dropdownOpen || !dropdown" class="tree-panel">
      <view
        v-for="(node, index) in flattenedNodes"
        :key="`${node.level}-${index}-${getKey(node.data)}`"
        class="tree-node">
        <view class="node-row" :style="'padding-left:' + node.level * indent + 'rpx'" @tap="onNodeClick(node.data)">
          <view v-if="hasChildren(node.data)" class="expander" @tap.stop="toggleNode(node.data)">
            <view :class="['triangle', { open: isExpanded(node.data) }]" />
          </view>
          <text :class="['node-label', { active: isSelected(node.data) }]">
            {{ node.data[labelKey] }}
          </text>
        </view>
      </view>
      <up-empty
        v-if="flattenedNodes.length === 0"
        iconSize="80rpx"
        textColor="#999"
        textSize="28rpx"
        height="300rpx"
        text="暂无数据" />
    </view>
  </view>
</template>

<script>
// 定义组件选项
const LkTreeComponent = {
  name: 'lk-tree',
  props: {
    data: { type: Array, default: () => [] },
    props: { type: Object, default: () => ({ children: 'children', label: 'label' }) },
    nodeKey: { type: String, default: 'id' },
    modelValue: { type: [String, Number], default: undefined },
    placeholder: { type: String, default: '请选择' },
    dropdown: { type: Boolean, default: true },
    isInner: { type: Boolean, default: false },
    level: { type: Number, default: 0 },
    indent: { type: Number, default: 28 },
    checkStrictly: { type: Boolean, default: false },
  },
  data() {
    return {
      dropdownOpen: false,
      localExpandedMap: {},
      selectedLabel: '',
      componentId: '', // 用于标识组件实例
    };
  },
  created() {
    // 确保在小程序中正确初始化响应式数据
    this.localExpandedMap = this.localExpandedMap || {};
    // 生成唯一组件ID
    this.componentId = 'lk-tree-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  },
  mounted() {
    // 小程序环境下监听页面点击事件
    // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
    uni.$on('page-tap', this.handlePageTap);
    // #endif
  },
  unmounted() {
    // 清理事件监听
    // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
    uni.$off('page-tap', this.handlePageTap);
    // #endif
  },
  computed: {
    childrenKey() {
      return this.props.children || 'children';
    },
    labelKey() {
      return this.props.label || 'label';
    },
    // 扁平化节点数据，避免递归组件调用
    flattenedNodes() {
      const result = [];
      this.flattenTreeData(this.data, this.level, result);

      return result;
    },
  },
  watch: {
    modelValue: {
      handler(newVal, oldVal) {
        // 当 modelValue 变化或组件重新挂载时，自动展开到选中节点的路径（顶层与子层都执行）
        if (newVal !== undefined && newVal !== null) {
          this.expandToNode(newVal);
        }

        // 立即更新显示文本
        this.updateDisplayText(newVal);

        // 强制更新组件
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      },
      immediate: true,
    },
  },
  methods: {
    // 根据 modelValue 更新显示文本
    updateDisplayText(modelValue) {
      if (modelValue === undefined || modelValue === null) {
        return;
      }

      // 查找对应的节点
      const node = this.findNodeInTree(this.data, modelValue);
      const displayText = node ? node[this.labelKey] : '';

      // 更新 selectedLabel 用于显示
      this.selectedLabel = displayText;
    },
    getKey(node) {
      return node[this.nodeKey];
    },
    hasChildren(node) {
      if (!node || typeof node !== 'object') {
        return false;
      }
      const c = node[this.childrenKey];
      return Array.isArray(c) && c.length > 0;
    },
    isExpanded(node) {
      const key = this.getKey(node);
      return !!this.localExpandedMap[key];
    },
    toggleNode(node) {
      const key = this.getKey(node);
      const newExpanded = !this.localExpandedMap[key];

      // 修复：使用Vue 3兼容的响应式更新方式
      // 创建新对象来触发响应式更新
      this.localExpandedMap = {
        ...this.localExpandedMap,
        [key]: newExpanded,
      };

      // 强制触发响应式更新
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    isSelected(node) {
      const nodeKey = this.getKey(node);
      const selectedKey = this.modelValue;
      return selectedKey !== undefined && selectedKey !== null && selectedKey === nodeKey;
    },
    onNodeClick(node) {
      // 如果 checkStrictly 为 false，则只有叶子节点可被选中
      if (!this.checkStrictly && this.hasChildren(node)) {
        // 对于父节点，如果不可选中，则展开/收缩子节点
        this.toggleNode(node);
        return;
      }

      // 只有叶子节点或 checkStrictly 为 true 时才选中节点
      const key = this.getKey(node);

      this.$emit('update:modelValue', key);
      this.$emit('node-click', node);
      this.selectedLabel = node[this.labelKey];

      // 强制更新显示文本
      this.$forceUpdate();

      if (!this.isInner && this.dropdown) this.dropdownOpen = false;
    },
    childClick(node) {
      this.onNodeClick(node);
    },

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;

      // 当打开下拉框时，仅展开到当前选中节点路径（避免全量展开）
      if (this.dropdownOpen) {
        const key = this.modelValue;
        if (key !== undefined && key !== null) {
          this.expandToNode(key);
        }
      }
    },
    // 处理组件内部点击（tap 修饰符已阻止冒泡）
    handleWrapperClick() {
      // 预留：如需内部点击行为可在此扩展
    },
    // 处理页面级别的点击事件（小程序环境）
    handlePageTap(e) {
      // 检查点击是否发生在当前组件外部
      if (this.dropdownOpen && !this.isInner && this.dropdown) {
        // 延迟执行，确保其他点击事件先处理
        this.$nextTick(() => {
          this.dropdownOpen = false;
        });
      }
    },

    // 修复：递归查找整个树中的节点
    findNodeInTree(list, key) {
      for (let i = 0; i < list.length; i++) {
        const n = list[i];
        if (n[this.nodeKey] === key) return n;
        const c = n[this.childrenKey];
        if (c && c.length) {
          const found = this.findNodeInTree(c, key);
          if (found) return found;
        }
      }
      return null;
    },
    expandToNode(targetKey) {
      // 安全检查：确保组件仍然存在且数据有效
      if (this._isDestroyed || !this.data || !Array.isArray(this.data)) {
        console.warn('组件已销毁或数据无效，跳过展开操作');
        return;
      }

      // 确保 localExpandedMap 存在且为响应式对象
      if (!this.localExpandedMap || typeof this.localExpandedMap !== 'object') {
        this.localExpandedMap = {};
      }

      // 收集需要展开的节点，避免在递归过程中直接修改响应式数据
      const nodesToExpand = new Set();

      // 递归查找目标节点并收集需要展开的节点
      const findAndCollect = (nodes, parentPath = []) => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if (!node || !node[this.nodeKey]) continue; // 跳过无效节点

          const currentPath = [...parentPath, node];

          // 检查当前节点是否是目标节点
          if (node[this.nodeKey] === targetKey) {
            // 收集路径上的所有父节点（除了目标节点本身）
            currentPath.forEach((pathNode, index) => {
              if (index < currentPath.length - 1 && pathNode && pathNode[this.nodeKey]) {
                const nodeKey = pathNode[this.nodeKey];
                nodesToExpand.add(nodeKey);
              }
            });
            return true;
          }

          // 如果有子节点，继续递归查找
          const children = node[this.childrenKey];
          if (children && Array.isArray(children) && children.length > 0) {
            const found = findAndCollect(children, currentPath);
            if (found) {
              // 确保当前节点也被收集
              const currentNodeKey = node[this.nodeKey];
              if (currentNodeKey) {
                nodesToExpand.add(currentNodeKey);
              }
              return true;
            }
          }
        }
        return false;
      };

      // 开始查找和收集
      const result = findAndCollect(this.data);
      if (!result) {
        console.warn('未找到目标节点:', targetKey);
        return;
      }

      // 批量更新展开状态
      this.$nextTick(() => {
        try {
          if (this._isDestroyed) return;
          // 创建新的对象来触发响应式更新
          const newExpandedMap = { ...this.localExpandedMap };
          nodesToExpand.forEach((nodeKey) => {
            if (nodeKey && !newExpandedMap[nodeKey]) {
              newExpandedMap[nodeKey] = true;
            }
          });
          this.localExpandedMap = newExpandedMap;
          // 强制更新组件
          this.$forceUpdate();
        } catch (error) {
          console.error('更新展开状态时发生错误:', error);
        }
      });
    },
    // 扁平化树数据的方法
    flattenTreeData(nodes, currentLevel, result) {
      if (!nodes || !Array.isArray(nodes)) {
        return;
      }

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node) continue;

        // 添加当前节点
        result.push({
          data: node,
          level: currentLevel,
        });

        // 如果节点有子节点且已展开，递归处理子节点
        if (this.hasChildren(node) && this.isExpanded(node)) {
          const children = node[this.childrenKey];
          if (children && Array.isArray(children) && children.length > 0) {
            this.flattenTreeData(children, currentLevel + 1, result);
          }
        }
      }
    },
  },
};

export default LkTreeComponent;
</script>

<style scoped>
.lk-tree-wrapper {
  width: 100%;
}
.selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 0;
  border-radius: 8rpx;
  width: 100%;
  box-sizing: border-box;
}
.selector-text {
  color: #333;
  font-size: 30rpx;
}
.arrow {
  width: 26rpx;
  height: 26rpx;
  position: relative;
  transition: transform 0.2s;
}
.arrow::before,
.arrow::after {
  content: '';
  position: absolute;
  width: 2rpx;
  height: 18rpx;
  background-color: #666;
  border-radius: 1rpx;
}
.arrow::before {
  transform: rotate(-45deg);
  left: 6rpx;
  top: 2rpx;
}
.arrow::after {
  transform: rotate(45deg);
  right: 6rpx;
  top: 2rpx;
}
.arrow.open {
  transform: rotate(180deg);
}
.tree-panel {
  margin-top: 12rpx;
  border-radius: 8rpx;
  background-color: #fff;
  padding: 30rpx 20rpx;
  position: absolute;
  z-index: 999;
  width: 100%;
  box-sizing: border-box;
  left: 0;
  right: 0;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}
.node-row {
  display: flex;
  align-items: center;
  padding: 8rpx 8rpx;
}
.node-row:active {
  background-color: #e4e3e3;
}
.expander {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6rpx;
}
.triangle {
  width: 0;
  height: 0;
  border-left: 10rpx solid transparent;
  border-right: 10rpx solid transparent;
  border-top: 12rpx solid #bbb;
  transform: rotate(-90deg);
  transition: transform 0.2s;
}
.triangle.open {
  transform: rotate(0deg);
}
.node-label {
  color: #555;
  font-size: 28rpx;
}
.node-label.active {
  color: #c27b4b;
  font-weight: 600;
}
</style>
