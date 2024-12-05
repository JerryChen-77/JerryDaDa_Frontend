<template>
  <div class="app-detail">
    <a-card class="detail-card">
      <a-row :gutter="[32, 24]">
        <!-- 左侧内容区域 -->
        <a-col :span="24" :lg="16" class="content-area">
          <!-- 应用标题和类型 -->
          <div class="app-header">
            <h1 class="app-title">{{ data?.appName }}</h1>
            <div class="app-tags">
              <a-tag color="arcoblue">{{ AppTypeMap[data?.appType] }}</a-tag>
              <a-tag color="green">{{ ScoringStrategyMap[data?.scoringStrategy] }}</a-tag>
            </div>
          </div>

          <!-- 应用描述 -->
          <div class="app-desc">
            <a-typography-paragraph>
              {{ data?.appDesc }}
            </a-typography-paragraph>
          </div>

          <!-- 作者信息 -->
          <div class="author-info">
            <a-descriptions :column="1" layout="horizontal" title="应用信息">
              <a-descriptions-item label="创建作者">
                <a-space>
                  <a-avatar
                      :size="40"
                      :image-url="data?.user?.userAvatar"
                  />
                  <div class="author-detail">
                    <div class="author-name">{{ data?.user?.userName ?? "无名" }}</div>
                    <div class="create-time">
                      创建于 {{ formatDate(data?.createTime) }}
                    </div>
                  </div>
                </a-space>
              </a-descriptions-item>
            </a-descriptions>
          </div>

          <!-- 操作按钮区域 -->
          <div class="action-area">
            <!-- 普通用户操作 -->
            <a-space size="large" wrap>
              <a-button type="primary" size="large" @click="handleStart">
                开始答题
                <template #icon>
                  <icon-play-circle/>
                </template>
              </a-button>
              <a-button size="large" @click="doShare">
                分享应用
                <template #icon>
                  <icon-share-alt/>
                </template>
              </a-button>
            </a-space>

            <!-- 作者特有操作 -->
            <a-space v-if="isMy" size="large" wrap class="author-actions">
              <a-button type="outline" @click="handleEditQuestion">
                设置题目
                <template #icon>
                  <icon-edit/>
                </template>
              </a-button>
              <a-button
                  type="outline"
                  v-if="data?.scoringStrategy === 0"
                  @click="handleEditScoring"
              >
                设置评分
                <template #icon>
                  <icon-trophy/>
                </template>
              </a-button>
              <a-button type="outline" @click="handleEditApp">
                修改应用
                <template #icon>
                  <icon-settings/>
                </template>
              </a-button>
            </a-space>
          </div>
        </a-col>

        <!-- 右侧图片区域 -->
        <a-col :span="24" :lg="8" class="image-area">
          <div class="image-wrapper">
            <a-image
                :src="data?.appIcon"
                :preview-visible="false"
                :footer="false"
                alt="应用图标"
                width="400"
                height="320"
            />
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 分享弹窗 -->
    <ShareModal :link="shareLink" title="应用分享" ref="shareModalRef"/>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {Message} from '@arco-design/web-vue';
import {useRouter} from 'vue-router';
import dayjs from 'dayjs';
import {getAppVoByIdUsingGet} from "@/api/appController";
import {useLoginUserStore} from "@/store/userStore";
import ShareModal from "@/components/ShareModal.vue";
import {IconEdit, IconPlayCircle, IconSettings, IconShareAlt, IconTrophy,} from '@arco-design/web-vue/es/icon';

const AppTypeMap = {
  0: "测评类",
  1: "得分类"
} as const;

const ScoringStrategyMap = {
  0: "自定义得分",
  1: "AI得分"
} as const;

interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: '',
});

const router = useRouter();
const data = ref<API.AppVO>();
const shareModalRef = ref();
const loginUserStore = useLoginUserStore();

const shareLink = computed(() =>
    `${window.location.protocol}//${window.location.host}/app/detail/${props.id}`
);

const isMy = computed(() => {
  const loginUserId = loginUserStore.loginUser.id;
  return loginUserId && loginUserId === data.value?.user?.id;
});

const formatDate = (date: string | number) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

const loadData = async () => {
  if (!props.id) return;

  try {
    const res = await getAppVoByIdUsingGet({
      id: props.id as any,
    });

    if (res.data.code === 0 && res.data.data) {
      data.value = res.data.data;
    } else {
      Message.error(res.data.message || '获取数据失败');
    }
  } catch (error) {
    Message.error('加载应用详情失败');
  }
};

const handleStart = () => {
  router.push(`/answer/do/${props.id}`);
};

const handleEditQuestion = () => {
  router.push(`/add/question/${props.id}`);
};

const handleEditScoring = () => {
  router.push(`/add/scoring_result/${props.id}`);
};

const handleEditApp = () => {
  router.push(`/add/app/${props.id}`);
};

const doShare = (e: Event) => {
  e?.stopPropagation();
  shareModalRef.value?.openModal();
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.app-detail {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 20px;
}

.detail-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.app-title {
  margin: 0;
  font-size: 32px;
  color: var(--color-text-1);
  flex: 1;
}

.app-tags {
  display: flex;
  gap: 8px;
}

.app-desc {
  font-size: 16px;
  line-height: 1.6;
  color: var(--color-text-2);
}

.author-info {
  padding: 20px;
  background: var(--color-fill-2);
  border-radius: 8px;
}

.author-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-1);
}

.create-time {
  font-size: 14px;
  color: var(--color-text-3);
}

.action-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.author-actions {
  padding-top: 16px;
  border-top: 1px solid var(--color-neutral-3);
}

.image-area {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.image-wrapper {
  height: auto;
  width: 100%;
  max-width: 320px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media screen and (max-width: 768px) {
  .app-detail {
    margin: 12px auto;
    padding: 0 12px;
  }

  .app-header {
    flex-direction: column;
  }

  .app-title {
    font-size: 24px;
  }

  .app-desc {
    font-size: 14px;
  }

  .action-area .arco-space {
    width: 100%;
  }

  .action-area .arco-btn {
    width: 100%;
  }

  .image-wrapper {
    width: 100%;
    max-width: 320px;
    border-radius: 8px;
    overflow: visible;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: auto; /* 或者直接去掉height: 400px这一行 */
  }

}
</style>