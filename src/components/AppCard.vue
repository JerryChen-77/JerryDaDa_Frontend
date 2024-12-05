<template>
  <a-card class="app-card" hoverable @click="doCardClick">
    <!-- 操作按钮区域 -->
    <template #actions>
      <div class="action-buttons">
        <span class="action-button" @click="doThumb" v-if="!hasThumbed">
          <IconThumbUp class="icon"/>
          <span class="count">{{ thumbNum }}</span>
        </span>
        <span class="action-button" @click="doThumb" v-if="hasThumbed">
          <IconThumbUpFill class="icon active"/>
          <span class="count">{{ thumbNum }}</span>
        </span>
        <span class="action-button" @click="doShare">
          <IconShareInternal class="icon"/>
        </span>
      </div>
    </template>

    <!-- 封面图片区域 -->
    <template #cover>
      <div class="image-container">
        <img
            class="app-image"
            :alt="app.appName"
            :src="app.appIcon"
            @error="handleImageError"
        />
      </div>
    </template>

    <!-- 卡片内容区域 -->
    <a-card-meta :title="app.appName" :description="app.appDesc">
      <template #avatar>
        <div class="user-info">
          <a-avatar
              :size="28"
              class="user-avatar"
              :image-url="app.user.userAvatar"
          />
          <a-typography-text class="user-name">
            {{ app.user?.userName ?? "无名" }}
          </a-typography-text>
        </div>
      </template>
    </a-card-meta>
  </a-card>

  <!-- 分享模态框 -->
  <ShareModal
      :link="shareLink"
      title="分享应用"
      ref="shareModalRef"
  />
</template>

<script setup lang="ts">
import { IconShareInternal, IconThumbUp, IconThumbUpFill } from '@arco-design/web-vue/es/icon';
import API from "@/api";
import { defineProps, ref, watchEffect, withDefaults } from "vue";
import { useRouter } from "vue-router";
import ShareModal from "@/components/ShareModal.vue";
import message from "@arco-design/web-vue/es/message";
import { doThumbUsingPost, hasThumbedUsingPost } from "@/api/appThumbController";

// Props 定义
interface Props {
  app: API.AppVO;
}

const props = withDefaults(defineProps<Props>(), {
  app: () => ({})
});

// 路由相关
const router = useRouter();
const doCardClick = () => {
  router.push(`/app/detail/${props.app.id}`);
};

// 分享功能
const shareModalRef = ref();
const shareLink = `${window.location.protocol}//${window.location.host}/app/detail/${props.app.id}`;
const doShare = (e: Event) => {
  e.stopPropagation();
  if (shareModalRef.value) {
    shareModalRef.value.openModal();
  }
};

// 点赞功能
const hasThumbed = ref(false);
const thumbNum = ref(0);
const doThumb = async (e: Event) => {
  e.stopPropagation();
  try {
    await doThumbUsingPost({ appId: props.app.id });
    await loadThumb();
    message.success(hasThumbed.value ? '点赞成功' : '取消点赞成功');
  } catch (error) {
    message.error('操作失败，请稍后重试');
  }
};

// 加载点赞状态
const loadThumb = async () => {
  try {
    const res = await hasThumbedUsingPost({ appId: props.app.id });
    if (res.data.code === 0) {
      hasThumbed.value = res.data.data.hasThumbed;
      thumbNum.value = res.data.data.appThumbNum;
    } else {
      message.warning(res.data.message);
    }
  } catch (error) {
    console.error('加载点赞状态失败:', error);
  }
};

// 图片加载错误处理
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = 'https://picsum.photos/200/300'; // 设置默认图片
};

watchEffect(() => {
  loadThumb();
});
</script>

<style scoped>
.app-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.image-container {
  height: 204px;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
  background: #f5f6f7;
}

.app-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.app-image:hover {
  transform: scale(1.05);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.icon {
  font-size: 18px;
  transition: all 0.2s ease;
}

.icon.active {
  color: #2994ff;
}

.count {
  font-size: 14px;
  color: #666;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
}

.user-avatar {
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .app-card {
    margin: 10px;
  }

  .image-container {
    height: 160px;
  }

  .action-buttons {
    gap: 16px;
  }
}
</style>