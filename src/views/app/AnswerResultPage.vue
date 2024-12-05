<template>
  <div class="answer-result">
    <a-card class="result-card">
      <a-row :gutter="[32, 24]">
        <!-- 左侧内容区域 -->
        <a-col :span="24" :lg="16" class="content-area">
          <!-- 结果标题 -->
          <div class="result-header">
            <h1 class="result-title">{{ data.resultName }}</h1>
            <a-tag :color="getScoreColor(data.resultScore)">
              得分：{{ data.resultScore }}
            </a-tag>
          </div>

          <!-- 结果描述 -->
          <div class="result-desc">
            <a-typography-paragraph>
              {{ data.resultDesc }}
            </a-typography-paragraph>
          </div>

          <!-- 答题信息 -->
          <div class="result-info">
            <a-descriptions :column="1" size="large" layout="horizontal">
              <!-- 用户信息 -->
              <a-descriptions-item label="答题人">
                <a-space>
                  <a-avatar
                      :size="32"
                      :image-url="data.user?.userAvatar"
                  />
                  <span>{{ data.user?.userName }}</span>
                </a-space>
              </a-descriptions-item>

              <!-- 应用信息 -->
              <a-descriptions-item label="应用类型">
                <a-tag>{{ APP_TYPE_MAP[data.appType] }}</a-tag>
              </a-descriptions-item>

              <a-descriptions-item label="评分策略">
                <a-tag>{{ APP_SCORING_STRATEGY[data.scoringStrategy] }}</a-tag>
              </a-descriptions-item>

              <!-- 答题详情 -->
              <a-descriptions-item label="答题时间">
                {{ formatDate(data.createTime) }}
              </a-descriptions-item>

              <a-descriptions-item label="我的答案">
                <a-space wrap>
                  <a-tag
                      v-for="(choice, index) in data.choices"
                      :key="index"
                      :color="'arcoblue'"
                  >
                    {{ choice }}
                  </a-tag>
                </a-space>
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <!-- 操作按钮 -->
          <div class="action-area">
            <a-space size="large">
              <a-button type="primary" shape="round" @click="handleRetry">
                重新答题
                <template #icon><icon-refresh /></template>
              </a-button>
              <a-button shape="round" @click="handleShare">
                分享结果
                <template #icon><icon-share-alt /></template>
              </a-button>
            </a-space>
          </div>
        </a-col>

        <!-- 右侧图片区域 -->
        <a-col :span="24" :lg="8" class="image-area">
          <div class="image-wrapper">
            <a-image
                :src="data.resultPicture"
                :preview-visible="false"
                :footer="false"
                alt="结果图片"
            />
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import API from '@/api';
import { getUserAnswerVoByIdUsingGet } from '@/api/userAnswerController';
import {
  IconRefresh,
  IconShareAlt
} from '@arco-design/web-vue/es/icon';

const APP_TYPE_MAP = {
  0: '测试类',
  1: '评分类',
} as const;

const APP_SCORING_STRATEGY = {
  0: '自定义',
  1: 'AI评分',
} as const;

interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: '',
});

const router = useRouter();
const data = ref<API.UserAnswerVO>({});

const formatDate = (date: string | number) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  return 'red';
};

const loadData = async () => {
  if (!props.id) return;

  try {
    const res = await getUserAnswerVoByIdUsingGet({
      id: props.id as any,
    });

    if (res.data.code === 0 && res.data.data) {
      data.value = res.data.data;
    } else {
      Message.error(res.data.message || '获取数据失败');
    }
  } catch (error) {
    Message.error('加载结果失败，请重试');
  }
};

const handleRetry = () => {
  if (data.value.appId) {
    router.push(`/answer/do/${data.value.appId}`);
  }
};

const handleShare = () => {
  // 实现分享功能
  Message.info('分享功能开发中');
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.answer-result {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
}

.result-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.result-title {
  margin: 0;
  font-size: 28px;
  color: var(--color-text-1);
}

.result-desc {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text-2);
}

.result-info {
  padding: 20px;
  background: var(--color-fill-2);
  border-radius: 8px;
}

.result-info :deep(.arco-descriptions-item-label) {
  color: var(--color-text-3);
  font-weight: 500;
}

.result-info :deep(.arco-descriptions-item-value) {
  color: var(--color-text-1);
}

.action-area {
  margin-top: 12px;
}

.image-area {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.image-wrapper {
  width: 100%;
  max-width: 320px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media screen and (max-width: 768px) {
  .answer-result {
    margin: 12px auto;
    padding: 0 12px;
  }

  .result-title {
    font-size: 24px;
  }

  .result-desc {
    font-size: 14px;
  }

  .result-info {
    padding: 16px;
  }

  .action-area {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .action-area .arco-space {
    width: 100%;
  }

  .action-area .arco-btn {
    width: 100%;
  }

  .image-wrapper {
    margin-top: 24px;
  }
}
</style>