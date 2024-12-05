<template>
  <div class="answer-page">
    <a-card class="answer-card">
      <template v-if="loading">
        <a-skeleton :animation="true">
          <a-space direction="vertical" style="width: 100%">
            <a-skeleton-line :rows="1" />
            <a-skeleton-line :rows="4" />
          </a-space>
        </a-skeleton>
      </template>

      <template v-else>
        <div class="container">
          <!-- 应用信息区域 -->
          <div class="app-info" v-if="app">
            <h1 class="app-title">{{ app.appName }}</h1>
            <p class="app-desc">{{ app.appDesc }}</p>
          </div>

          <!-- 题目区域 -->
          <div v-if="questionContent && questionContent.length > 0" class="question-area">
            <h2 class="question-title">
              <span class="question-number">{{ current }}</span>
              {{ currentQuestion?.title }}
            </h2>

            <div class="options-area">
              <a-radio-group
                  v-model="currentAnswer"
                  direction="vertical"
                  :options="questionOptions"
                  @change="onRadioChange"
                  size="large"
              />
            </div>

            <div class="action-area">
              <a-space size="large">
                <template v-if="current < questionContent.length">
                  <a-button
                      type="primary"
                      shape="round"
                      :disabled="!currentAnswer"
                      @click="handleNext"
                  >
                    下一题
                    <template #icon><icon-right /></template>
                  </a-button>
                </template>

                <template v-else>
                  <a-button
                      type="primary"
                      shape="round"
                      :disabled="!currentAnswer"
                      :loading="submitting"
                      @click="handleSubmit"
                  >
                    {{ submitting ? "评分中" : "查看结果" }}
                    <template #icon>
                      <icon-check v-if="!submitting" />
                      <icon-loading v-else />
                    </template>
                  </a-button>
                </template>

                <template v-if="current > 1">
                  <a-button
                      shape="round"
                      @click="handlePrev"
                  >
                    <template #icon><icon-left /></template>
                    上一题
                  </a-button>
                </template>
              </a-space>
            </div>

            <div class="progress-indicator">
              <span>当前进度: {{ current }}/{{ questionContent.length }}</span>
              <a-progress
                  :percent="(current / questionContent.length) "
                  :show-text="false"
                  size="small"
                  status="success"
              />
            </div>
          </div>

          <!-- 无数据状态 -->
          <div v-else class="empty-area">
            <a-empty description="暂无题目数据" />
          </div>
        </div>
      </template>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';
import type API from '@/api';
import {
  listQuestionVoByPageUsingPost,
  generateUniqueUserAnswerIdUsingGet,
} from '@/api/questionController';
import { getAppVoByIdUsingGet } from '@/api/appController';
import { addUserAnswerUsingPost } from '@/api/userAnswerController';
import {
  IconRight,
  IconLeft,
  IconCheck,
  IconLoading,
} from '@arco-design/web-vue/es/icon';

interface Props {
  appId: string;
}

const props = withDefaults(defineProps<Props>(), {
  appId: '',
});

const router = useRouter();
const loading = ref(true);
const submitting = ref(false);
const current = ref(1);
const uniqueId = ref<number>();
const app = ref<API.AppVO>();
const questionContent = ref<API.QuestionContentDTO[]>([]);
const currentAnswer = ref<string>();
const answerList = ref<string[]>([]);

const currentQuestion = computed(() =>
    questionContent.value[current.value - 1] || {}
);

const questionOptions = computed(() => {
  if (!currentQuestion.value?.options) return [];
  return currentQuestion.value.options.map((option) => ({
    label: `${option.key}. ${option.value}`,
    value: option.key,
  }));
});

const generateId = async () => {
  try {
    const res = await generateUniqueUserAnswerIdUsingGet();
    if (res.data.code === 0) {
      uniqueId.value = res.data.data;
    }
  } catch (error) {
    Message.error('获取答题ID失败');
  }
};

const loadData = async () => {
  if (!props.appId) return;

  try {
    const [appRes, questionRes] = await Promise.all([
      getAppVoByIdUsingGet({ id: props.appId as any }),
      listQuestionVoByPageUsingPost({
        appId: props.appId as any,
        current: 1,
        pageSize: 1,
        sortField: 'createTime',
        sortOrder: 'descend',
      })
    ]);

    if (appRes.data.code === 0 && appRes.data.data) {
      app.value = appRes.data.data;
    }

    if (questionRes.data.code === 0 && questionRes.data.data?.records) {
      questionContent.value = questionRes.data.data.records[0].questionContent || [];
      answerList.value = new Array(questionContent.value.length).fill('');
    }
  } catch (error) {
    Message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

const handleNext = () => {
  if (current.value < questionContent.value.length) {
    current.value += 1;
    currentAnswer.value = answerList.value[current.value - 1];
  }
};

const handlePrev = () => {
  if (current.value > 1) {
    current.value -= 1;
    currentAnswer.value = answerList.value[current.value - 1];
  }
};

const onRadioChange = (value: string) => {
  currentAnswer.value = value;
  answerList.value[current.value - 1] = value;
};

const handleSubmit = async () => {
  if (!props.appId || !uniqueId.value) return;

  submitting.value = true;
  try {
    const res = await addUserAnswerUsingPost({
      id: uniqueId.value,
      appId: props.appId as any,
      choices: answerList.value,
    });

    if (res.data.code === 0 && res.data.data) {
      await router.push(`/answer/result/${res.data.data}`);
    } else {
      Message.error(res.data.message || '提交失败');
    }
  } catch (error) {
    Message.error('提交答案失败');
  } finally {
    submitting.value = false;
  }
};

// 在组件挂载后初始化数据
onMounted(async () => {
  await generateId();
  await loadData();
});
</script>

<style scoped>
.answer-page {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.answer-card {
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.container {
  padding: 20px;
}

.app-info {
  text-align: center;
  margin-bottom: 40px;
}

.app-title {
  font-size: 24px;
  color: var(--color-text-1);
  margin-bottom: 12px;
}

.app-desc {
  font-size: 14px;
  color: var(--color-text-3);
  line-height: 1.6;
}

.loading-area,
.empty-area {
  padding: 40px 0;
  text-align: center;
}

.loading-content {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.question-area {
  position: relative;
}

.question-title {
  font-size: 18px;
  color: var(--color-text-1);
  margin-bottom: 24px;
  line-height: 1.6;
}

.question-number {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  background: var(--color-primary-light-1);
  color: var(--color-white);
  border-radius: 50%;
  margin-right: 8px;
}

.options-area {
  margin: 24px 0 36px;
}

.options-area :deep(.arco-radio-group-direction-vertical) {
  row-gap: 16px;
}

.options-area :deep(.arco-radio) {
  padding: 12px 16px;
  border: 1px solid var(--color-neutral-3);
  border-radius: 4px;
  transition: all 0.2s;
}

.options-area :deep(.arco-radio:hover) {
  border-color: var(--color-primary-light-3);
  background: var(--color-primary-light-1);
}

.options-area :deep(.arco-radio-checked) {
  background: var(--color-primary-light-1);
}

.action-area {
  text-align: center;
  margin-top: 36px;
}

.progress-indicator {
  margin-top: 24px;
  text-align: center;
}

.progress-indicator span {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text-3);
  font-size: 14px;
}

@media screen and (max-width: 576px) {
  .answer-page {
    margin: 10px;
    padding: 0;
  }

  .container {
    padding: 16px;
  }

  .app-title {
    font-size: 20px;
  }

  .question-title {
    font-size: 16px;
  }

  .action-area .arco-space {
    flex-direction: column-reverse;
  }

  .action-area .arco-btn {
    width: 100%;
    margin: 8px 0;
  }
}
</style>