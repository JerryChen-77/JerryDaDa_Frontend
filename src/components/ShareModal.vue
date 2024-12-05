<template>
  <a-modal
      v-model:visible="visible"
      @cancel="closeModal"
      :footer="false"
      :maskClosable="false"
      class="share-modal"
  >
    <template #title>
      <div class="modal-title">
        <icon-share />
        分享
      </div>
    </template>

    <div class="share-content">
      <!-- 链接分享区域 -->
      <div class="share-section">
        <h4 class="section-title">
          <icon-link />
          复制分享链接
        </h4>
        <div class="link-container">
          <a-typography-paragraph
              :copyable="{
              text: link,
              onCopy: handleCopy
            }"
              class="share-link"
          >
            {{ formatLink(link) }}
          </a-typography-paragraph>
        </div>
      </div>

      <!-- 二维码区域 -->
      <div class="share-section">
        <h4 class="section-title">
          <icon-qrcode />
          手机扫码查看
        </h4>
        <div class="qrcode-container">
          <img
              :src="code"
              :alt="title"
              class="qrcode-image"
              v-if="code"
          />
          <div class="qrcode-loading" v-else>
            <a-spin />
          </div>
        </div>
      </div>

      <!-- 快捷分享按钮 -->
      <div class="share-section">
        <h4 class="section-title">
          <icon-share-alt />
          快捷分享
        </h4>
        <div class="share-buttons">
          <a-button
              type="primary"
              shape="circle"
              class="share-button wechat"
              @click="shareToWeChat"
          >
            <icon-wechat />
          </a-button>
          <a-button
              type="primary"
              shape="circle"
              class="share-button weibo"
              @click="shareToWeibo"
          >
            <icon-weibo />
          </a-button>
          <a-button
              type="primary"
              shape="circle"
              class="share-button twitter"
              @click="shareToTwitter"
          >
            <icon-twitter />
          </a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import QRCode from 'qrcode';
import { Message } from '@arco-design/web-vue';
import {
  IconShare,
  IconLink,
  IconQrcode,
  IconShareAlt,
  IconWechat,
  IconWeibo,
  IconTwitter,
} from '@arco-design/web-vue/es/icon';

interface Props {
  title: string;
  link: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: () => "分享",
  link: () => "https://laoyujianli.com/share/yupi",
});

const visible = ref(false);
const code = ref('');

// 格式化链接显示
const formatLink = (url: string) => {
  if (url.length > 50) {
    return url.substring(0, 47) + '...';
  }
  return url;
};

// 复制成功回调
const handleCopy = () => {
  Message.success('链接已复制到剪贴板');
};

// 生成二维码
const generateQRCode = async () => {
  try {
    code.value = await QRCode.toDataURL(props.link, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('二维码生成失败:', err);
    Message.error('二维码生成失败');
  }
};

// 社交媒体分享
const shareToWeChat = () => {
  // 实现微信分享逻辑
  Message.info('微信分享功能开发中');
};

const shareToWeibo = () => {
  const url = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(props.link)}&title=${encodeURIComponent(props.title)}`;
  window.open(url, '_blank');
};

const shareToTwitter = () => {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.title)}&url=${encodeURIComponent(props.link)}`;
  window.open(url, '_blank');
};

const openModal = () => {
  visible.value = true;
  generateQRCode();
};

const closeModal = () => {
  visible.value = false;
};

defineExpose({
  openModal,
});
</script>

<style scoped>
.share-modal :deep(.arco-modal-header) {
  border-bottom: 1px solid var(--color-neutral-3);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: var(--color-text-1);
}

.share-content {
  padding: 16px 0;
}

.share-section {
  margin-bottom: 24px;
}

.share-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  color: var(--color-text-1);
  font-size: 15px;
}

.link-container {
  padding: 12px;
  background: var(--color-fill-2);
  border-radius: 4px;
}

.share-link {
  margin: 0;
  word-break: break-all;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background: white;
  border: 1px solid var(--color-neutral-3);
  border-radius: 8px;
  overflow: hidden;
}

.qrcode-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qrcode-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.share-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.share-button {
  width: 40px;
  height: 40px;
  transition: transform 0.2s ease;
}

.share-button:hover {
  transform: translateY(-2px);
}

.wechat {
  background: #07c160;
  border-color: #07c160;
}

.wechat:hover {
  background: #06ae56;
  border-color: #06ae56;
}

.weibo {
  background: #e6162d;
  border-color: #e6162d;
}

.weibo:hover {
  background: #d41528;
  border-color: #d41528;
}

.twitter {
  background: #1da1f2;
  border-color: #1da1f2;
}

.twitter:hover {
  background: #1a94da;
  border-color: #1a94da;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .share-buttons {
    flex-wrap: wrap;
  }

  .qrcode-container {
    width: 160px;
    height: 160px;
  }
}
</style>