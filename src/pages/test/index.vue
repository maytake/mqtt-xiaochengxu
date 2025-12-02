<template>
  <view class="container" @tap="handlePageTap">
    <view class="section">
      <text class="title">树形选择器调试</text>

      <view class="tree-section">
        <text class="subtitle">当前选中值: {{ selectedValue }}</text>
        <text class="subtitle">当前选中标签: {{ selectedLabel }}</text>

        <lk-tree
          v-model="selectedValue"
          :data="treeData"
          :props="defaultProps"
          placeholder="请选择部门"
          @node-click="handleNodeClick" />
      </view>

      <view class="controls">
        <button @tap="setSelectedValue(5)" class="btn">选中研发部门</button>
        <button @tap="setSelectedValue(6)" class="btn">选中市场部门</button>
        <button @tap="setSelectedValue(10)" class="btn">选中石家庄市场部门</button>
        <button @tap="setSelectedValue(2)" class="btn">选中深圳总公司</button>
        <button @tap="clearSelection" class="btn">清除选择</button>
        <button @tap="testExpand" class="btn test-btn">测试展开功能</button>
        <button @tap="testPlatform" class="btn test-btn">测试平台信息</button>
      </view>
      

    </view>
  </view>
</template>

<script>
import LkTree from '@/components/lk-tree/index.vue';

export default {
  components: {
    LkTree,
  },
  data() {
    return {
      selectedValue: 8, // 默认选中研发部门
      defaultProps: {
        children: 'children',
        label: 'label',
      },
      treeData: [
        {
          id: 1,
          label: '匠人科技',
          children: [
            {
              id: 2,
              label: '深圳总公司',
              children: [
                { id: 5, label: '研发部门' },
                { id: 6, label: '市场部门' },
                { id: 7, label: '测试部门' },
                { id: 8, label: '财务部门' },
                { id: 9, label: '运维部门' },
              ],
            },
            {
              id: 3,
              label: '石家庄分公司',
              children: [
                { id: 10, label: '市场部门' },
                { id: 11, label: '财务部门' },
                { id: 12, label: '演示部门' },
              ],
            },
          ],
        },
      ],
    };
  },
  computed: {
    selectedLabel() {
      if (!this.selectedValue) return '未选择';
      const node = this.findNodeByKey(this.treeData, this.selectedValue);
      return node ? node.label : '未找到';
    },
  },
  methods: {
    // 处理页面点击事件，用于小程序环境下的点击外部检测
    handlePageTap(e) {
      // 触发全局事件，通知所有 lk-tree 组件
      uni.$emit('page-tap', e);
    },
    handleNodeClick(node) {
      console.log('选中节点:', node);
      uni.showToast({
        title: `选中: ${node.label}`,
        icon: 'none',
      });
    },
    setSelectedValue(value) {
      console.log('设置选中值:', value);
      this.selectedValue = value;
    },
    clearSelection() {
      console.log('清除选择');
      this.selectedValue = null;
    },
    testExpand() {
      console.log('测试展开功能');
      // 设置一个深层节点
      this.selectedValue = 10; // 石家庄市场部门
      uni.showToast({
        title: '已选中石家庄市场部门，请关闭并重新打开下拉框',
        icon: 'none',
        duration: 3000
      });
    },
    testPlatform() {

    },
    findNodeByKey(list, key) {
      for (let i = 0; i < list.length; i++) {
        const n = list[i];
        if (n.id === key) return n;
        const c = n.children;
        if (c && c.length) {
          const found = this.findNodeByKey(c, key);
          if (found) return found;
        }
      }
      return null;
    },
  },
};
</script>

<style scoped>
.container {
  padding: 20rpx;
}

.section {
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.subtitle {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.tree-section {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.btn {
  background-color: #2979ff;
  color: white;
  border: none;
  padding: 20rpx 30rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.test-btn {
  background-color: #ff5722;
}



</style>
