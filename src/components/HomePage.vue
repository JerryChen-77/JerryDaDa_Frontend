<template>
  <div class="home-container">
    <!-- 搜索区域 -->
    <!-- 搜索区域和波浪背景 -->
    <div class="search-section">
      <div ref="vantaRef" class="wave-background"></div>
      <div class="search-content">
        <h1 class="search-title">Jerry DA</h1>
        <div class="subtitle-container">
          <p class="search-subtitle">探索您的智能助手</p>
        </div>
        <div class="search-wrapper">
          <a-input-search
              class="search-input"
              placeholder="搜索您感兴趣的应用..."
              search-button
              size="large"
              @search="onSearch"
          >
            <template #button-icon>
              <icon-search />
            </template>
          </a-input-search>
        </div>
      </div>
    </div>

    <!-- 应用列表区域 -->
    <div class="content-section">
      <!-- 筛选器和排序（可选功能） -->
      <div class="filter-bar">
        <a-space>
          <a-tag
              v-for="(tag, index) in filterTags"
              :key="index"
              :checked="tag.checked"
              checkable
              @check="handleTagCheck(index)"
          >
            {{ tag.name }}
          </a-tag>
        </a-space>
        <a-select
            class="sort-select"
            :style="{ width: '160px' }"
            :default-value="sortOption"
            @change="handleSort"
        >
          <a-option value="thumbNum">最受欢迎</a-option>
          <a-option value="createTime">最新发布</a-option>
        </a-select>
      </div>

      <!-- 应用列表 -->
      <transition-group name="list" tag="div" class="app-list">
        <a-list
            :grid-props="{
            gutter: [24, 24],
            sm: 24,
            md: 12,
            lg: 8,
            xl: 6
          }"
            :bordered="false"
            :data="dataList"
            :loading="loading"
            class="list-container"
            :pagination-props="{
            pageSize: searchParams.pageSize,
            current: searchParams.current,
            total: total,
            hideOnSinglePage: true,
            showTotal: true,
            showJumper: true,
          }"
            @page-change="onPageChange"
        >
          <template #item="{ item }">
            <div class="card-wrapper">
              <AppCard :app="item" />
            </div>
          </template>

          <!-- 空状态展示 -->
          <template #empty>
            <div class="empty-state">
              <icon-empty />
              <p>暂无相关应用</p>
            </div>
          </template>
        </a-list>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, onBeforeUnmount } from 'vue';
import { IconSearch, IconEmpty } from '@arco-design/web-vue/es/icon';
import AppCard from "@/components/AppCard.vue";
import type API from "@/api";
import { listAppVoByPageUsingPost } from "@/api/appController";
import message from "@arco-design/web-vue/es/message";
import * as THREE from "three";
import WAVES from "vanta/src/vanta.waves";

// 数据状态
const dataList = ref<API.AppVO[]>([]);
const total = ref<number>(0);
const loading = ref(false);
const sortOption = ref('thumbNum');
const vantaRef = ref(null);
let vantaEffect = null;

// 波浪效果初始化
onMounted(() => {
  vantaEffect = WAVES({
    el: vantaRef.value,
    THREE: THREE,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 300.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color: 0x1e88e5,
    shininess: 76.0,
    waveHeight: 12.0,
    waveSpeed: 0.95,
    zoom: 0.89,
  });
});

// 清理效果
onBeforeUnmount(() => {
  if (vantaEffect) {
    vantaEffect.destroy();
  }
});



// 搜索参数
const initSearchParams = {
  current: 1,
  pageSize: 8,
};

const searchParams = ref<API.AppQueryRequest>({
  ...initSearchParams,
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      reviewStatus: 1,
      sortField: sortOption.value,
      ...searchParams.value,
    };
    const res = await listAppVoByPageUsingPost(params);
    if (res.data.code === 0) {
      dataList.value = res.data.data?.records || [];
      total.value = res.data.data?.total || 0;
    } else {
      message.error('获取数据失败：' + res.data.message);
    }
  } catch (error) {
    message.error('加载失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const onSearch = (value: string) => {
  searchParams.value = {
    ...searchParams.value,
    searchText: value,
    current: 1,
  };
};

// 排序处理
const handleSort = (value: string) => {
  sortOption.value = value;
  searchParams.value.current = 1;
};


// 分页处理
const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};

// 监听数据变化
watchEffect(() => {
  loadData();
});
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #f5f6f7;
}

.search-section {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.wave-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.search-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 20px 0;
  text-align: center;
  color: white;
}

.search-title {
  font-size: 3.5em;
  font-weight: bold;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.search-subtitle {
  font-size: 1.5em;
  margin-bottom: 32px;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.search-input {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.9);
}

.content-section {
  max-width: 1200px;
  margin: -40px auto 0;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.home-container {
  min-height: 100vh;
  background: #f5f6f7;
}

.search-section {
  padding: 60px 0;
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  color: white;
  text-align: center;
}

.search-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-title {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 16px;
  background: linear-gradient(45deg, #ffffff, #e3f2fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.search-input {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.content-section {
  max-width: 1200px;
  margin: -40px auto 0;
  padding: 0 20px;
  position: relative;
}

.filter-bar {
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-list {
  margin-top: 24px;
}

.card-wrapper {
  transition: transform 0.3s ease;
}

.empty-state {
  padding: 48px 0;
  text-align: center;
  color: #86909c;
}

.empty-state :deep(svg) {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-section {
    padding: 40px 0;
  }

  .search-title {
    font-size: 2em;
  }

  .filter-bar {
    flex-direction: column;
    gap: 16px;
  }

  .sort-select {
    width: 100% !important;
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>