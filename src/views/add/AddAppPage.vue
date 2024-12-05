<template>
  <div class="app-form-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">
        <icon-edit-square v-if="isEdit" />
        <icon-plus-circle v-else />
        {{ isEdit ? '编辑应用' : '创建应用' }}
      </h2>
    </div>

    <!-- 表单卡片 -->
    <a-card class="form-card">
      <a-form
          ref="formRef"
          :model="form"
          :rules="rules"
          @submit="handleSubmit"
          class="app-form"
      >
        <!-- 基本信息部分 -->
        <div class="form-section">
          <div class="section-title">
            <icon-info-circle />
            基本信息
          </div>

          <a-form-item field="appName" label="应用名称" required>
            <a-input
                v-model="form.appName"
                placeholder="请输入应用名称"
                allow-clear
                :style="{ width: '85%' }"
            >
              <template #prefix>
                <icon-tag />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item field="appDesc" label="应用描述" required>
            <div style="width: 90%">
              <a-textarea
                  v-model="form.appDesc"
                  placeholder="请输入应用描述"
                  :max-length="200"
                  show-word-limit
                  allow-clear
                  :style="{ width: '85%' }"
              />
              <div class="icon-tips">
                请尽量完善，供AI生成参考
              </div>
            </div>

          </a-form-item>

          <a-form-item field="appIcon" label="应用图标" required>
            <div class="icon-upload-wrapper">
              <PictureUploader
                  biz="app_icon"
                  :value="form.appIcon"
                  :onChange="handleIconChange"
              />
              <div class="icon-tips">
                建议尺寸：200x200px，支持 jpg、png 格式
              </div>
            </div>
          </a-form-item>
        </div>

        <!-- 配置信息部分 -->
        <div class="form-section">
          <div class="section-title">
            <icon-settings />
            配置信息
          </div>

          <a-form-item field="appType" label="应用类型" required>
            <a-select
                v-model="form.appType"
                placeholder="请选择应用类型"
                :style="{ width: '85%' }"
            >
              <a-option
                  v-for="(value, key) in APP_TYPE_MAP"
                  :key="key"
                  :value="Number(key)"
              >
                <template #icon>
                  <icon-file v-if="Number(key) === 0" />
                  <icon-star v-else />
                </template>
                {{ value }}
              </a-option>
            </a-select>
          </a-form-item>

          <a-form-item field="scoringStrategy" label="评分策略" required>
            <a-select
                v-model="form.scoringStrategy"
                placeholder="请选择评分策略"
                :style="{ width: '85%' }"
            >
              <a-option
                  v-for="(value, key) in APP_SCORING_STRATEGY"
                  :key="key"
                  :value="Number(key)"
              >
                <template #icon>
                  <icon-edit v-if="Number(key) === 0" />
                  <icon-robot v-else />
                </template>
                {{ value }}
              </a-option>
            </a-select>
          </a-form-item>
        </div>

        <!-- 表单操作按钮 -->
        <div class="form-actions">
          <a-space>
            <a-button
                type="secondary"
                @click="handleCancel"
            >
              取消
            </a-button>
            <a-button
                type="primary"
                html-type="submit"
                :loading="submitting"
            >
              {{ isEdit ? '保存修改' : '创建应用' }}
            </a-button>
          </a-space>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';
import type API from '@/api';
import {
  addAppUsingPost,
  editAppUsingPost,
  getAppVoByIdUsingGet,
} from '@/api/appController';
import PictureUploader from '@/components/PictureUploader.vue';
import {
  IconHome,
  IconApps,
  IconPlusCircle,
  IconInfoCircle,
  IconSettings,
  IconTag,
  IconFile,
  IconStar,
  IconEdit,
  IconRobot,
} from '@arco-design/web-vue/es/icon';

// Props 定义
interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: ':id',
});

// 状态管理
const router = useRouter();
const formRef = ref();
const submitting = ref(false);
const oldApp = ref<API.AppVO>();

// 计算属性
const isEdit = computed(() => props.id !== ':id');

// 表单数据
const form = ref<API.AppAddRequest>({
  appName: '',
  appDesc: '',
  appIcon: '',
  appType: 0,
  scoringStrategy: 0,
});

// 表单验证规则
const rules = {
  appName: [
    { required: true, message: '请输入应用名称' },
    { maxLength: 50, message: '应用名称不能超过50个字符' },
  ],
  appDesc: [
    { required: true, message: '请输入应用描述' },
    { maxLength: 200, message: '应用描述不能超过200个字符' },
  ],
  appIcon: [
    { required: true, message: '请上传应用图标' },
  ],
  appType: [
    { required: true, message: '请选择应用类型' },
  ],
  scoringStrategy: [
    { required: true, message: '请选择评分策略' },
  ],
};

// 常量定义
const APP_TYPE_MAP = {
  0: '测试类',
  1: '评分类',
};

const APP_SCORING_STRATEGY = {
  0: '自定义',
  1: 'AI评分',
};

// 方法定义
const loadData = async () => {
  if (!isEdit.value) return;

  try {
    const res = await getAppVoByIdUsingGet({
      id: props.id as any,
    });

    if (res.data.code === 0 && res.data.data) {
      oldApp.value = res.data.data;
      form.value = res.data.data;
    } else {
      Message.error('获取数据失败：' + res.data.message);
    }
  } catch (error) {
    Message.error('加载数据出错，请重试');
  }
};

const handleIconChange = (url: string) => {
  form.value.appIcon = url;
};

const handleCancel = () => {
  router.back();
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    submitting.value = true;

    const api = isEdit.value ? editAppUsingPost : addAppUsingPost;
    const params = isEdit.value ? { id: props.id, ...form.value } : form.value;

    const res = await api(params);

    if (res.data.code === 0) {
      Message.success({
        content: isEdit.value ? '更新成功' : '创建成功',
        duration: 2000,
      });

      setTimeout(() => {
        if (isEdit.value) {
          router.push(`/app/detail/${props.id}`);
        } else {
          router.push('/');
        }
      }, 2000);
    } else {
      Message.error('操作失败：' + res.data.message);
    }
  } catch (error) {
    Message.error('表单验证失败，请检查输入');
  } finally {
    submitting.value = false;
  }
};

// 监听数据变化
watchEffect(() => {
  loadData();
});
</script>

<style scoped>
.app-form-container {
  padding: 24px;
  background: var(--color-fill-2);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0;
  color: var(--color-text-1);
}

.form-card {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
}

.app-form {
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-neutral-3);
  color: var(--color-text-1);
  font-weight: 500;
}

.icon-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.icon-tips {
  color: var(--color-text-3);
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px dashed var(--color-neutral-3);
}

:deep(.arco-input-wrapper) {
  background: var(--color-fill-2);
}

:deep(.arco-textarea-wrapper) {
  background: var(--color-fill-2);
}

:deep(.arco-select-view) {
  background: var(--color-fill-2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-form-container {
    padding: 16px;
  }

  .form-card {
    margin: 0;
  }

  .app-form {
    padding: 16px;
  }
}
</style>