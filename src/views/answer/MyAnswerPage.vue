<template>
  <div class="answer-list-container">
    <!-- 搜索表单 -->
    <a-card class="search-card">
      <a-form
          :model="formSearchParams"
          layout="horizontal"
          @submit="doSearch"
      >
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item field="resultName" label="结果名称">
              <a-input
                  v-model="formSearchParams.resultName"
                  placeholder="请输入结果名称"
                  allow-clear
              >
                <template #prefix>
                  <icon-search />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item field="resultDesc" label="结果描述">
              <a-input
                  v-model="formSearchParams.resultDesc"
                  placeholder="请输入结果描述"
                  allow-clear
              >
                <template #prefix>
                  <icon-file />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item field="userId" label="创建人">
              <a-input
                  v-model="formSearchParams.userId"
                  placeholder="请输入创建人ID"
                  allow-clear
              >
                <template #prefix>
                  <icon-user />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-space>
              <a-button type="primary" html-type="submit">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="doClean">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card class="table-card">
      <template #title>
        <a-space>
          <icon-list /> 答案列表
        </a-space>
      </template>

      <a-table
          :data="dataList"
          :columns="columns"
          :pagination="{
          showTotal: true,
          showJumper: true,
          pageSize: searchParams.pageSize,
          current: searchParams.current,
          total,
          showPageSize: true,
        }"
          :loading="loading"
          @page-change="onPageChange"
          :bordered="false"
          :stripe="true"
          row-key="id"
      >
        <!-- 图片列 -->
        <template #resultPicture="{ record }">
          <a-image
              :src="record.resultPicture"
              :preview-visible="false"
              width="64"
              height="64"
              fit="cover"
              border-radius="4px"
          />
        </template>

        <!-- 应用类型列 -->
        <template #appType="{ record }">
          <a-tag :color="record.appType === 0 ? 'blue' : 'green'">
            {{ record.appType === 0 ? '测评类' : '得分类' }}
          </a-tag>
        </template>

        <!-- 评分策略列 -->
        <template #scoringStrategy="{ record }">
          <a-tag :color="record.scoringStrategy === 0 ? 'purple' : 'orange'">
            {{ record.scoringStrategy === 0 ? '自定义' : 'AI评分' }}
          </a-tag>
        </template>

        <!-- 创建时间列 -->
        <template #createTime="{ record }">
          <a-tooltip :content="dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')">
            {{ dayjs(record.createTime).format('YYYY-MM-DD') }}
          </a-tooltip>
        </template>

        <!-- 操作列 -->
        <template #optional="{ record }">
          <a-space>
            <a-button type="text" @click="viewResult(record)">
              <template #icon><icon-eye /></template>
              查看
            </a-button>
            <a-popconfirm
                content="确定要删除这条记录吗？"
                @ok="doDelete(record)"
            >
              <a-button type="text" status="danger">
                <template #icon><icon-delete /></template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { Message } from '@arco-design/web-vue';
import dayjs from 'dayjs';
import {
  IconSearch,
  IconFile,
  IconUser,
  IconRefresh,
  IconList,
  IconEye,
  IconDelete,
} from '@arco-design/web-vue/es/icon';
import type API from '@/api';
import {
  deleteUserAnswerUsingPost,
  listMyUserAnswerVoByPageUsingPost,
} from '@/api/userAnswerController';

const router = useRouter();
const loading = ref(false);
const dataList = ref<API.UserAnswerVO[]>([]);
const total = ref(0);

const formSearchParams = ref<API.UserAnswerQueryRequest>({});
const initSearchParams = {
  current: 1,
  pageSize: 10,
};

const searchParams = ref<API.UserAnswerQueryRequest>({
  ...initSearchParams,
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await listMyUserAnswerVoByPageUsingPost(searchParams.value);
    if (res.data.code === 0) {
      dataList.value = res.data.data?.records || [];
      total.value = res.data.data?.total || 0;
    } else {
      Message.error(`获取数据失败：${res.data.message}`);
    }
  } catch (error) {
    Message.error('加载数据出错，请重试');
  } finally {
    loading.value = false;
  }
};

// 搜索
const doSearch = () => {
  searchParams.value = {
    ...initSearchParams,
    ...formSearchParams.value,
  };
};

// 重置
const doClean = () => {
  formSearchParams.value = {};
  searchParams.value = { ...initSearchParams };
};

// 删除
const doDelete = async (record: API.UserAnswerVO) => {
  try {
    const res = await deleteUserAnswerUsingPost(record.id);
    if (res.data.code === 0) {
      Message.success('删除成功');
      await loadData();
    } else {
      Message.error(`删除失败：${res.data.message}`);
    }
  } catch (error) {
    Message.error('操作失败，请重试');
  }
};

// 查看详情
const viewResult = (record: API.UserAnswerVO) => {
  router.push(`/answer/result/${record.id}`);
};

// 分页变化
const onPageChange = (page: number) => {
  searchParams.value.current = page;
};

// 监听数据变化
watchEffect(() => {
  loadData();
});

// 表格列配置
const columns = [
  {
    title: '应用ID',
    dataIndex: 'appId',
    width: 100,
  },
  {
    title: '名称',
    dataIndex: 'resultName',
    width: 150,
  },
  {
    title: '描述',
    dataIndex: 'resultDesc',
    width: 200,
    ellipsis: true,
  },
  {
    title: '选项',
    dataIndex: 'choices',
    width: 150,
    ellipsis: true,
  },
  {
    title: '图片',
    dataIndex: 'resultPicture',
    slotName: 'resultPicture',
    width: 100,
  },
  {
    title: '得分',
    dataIndex: 'resultScore',
    width: 100,
  },
  {
    title: '应用类型',
    dataIndex: 'appType',
    slotName: 'appType',
    width: 100,
  },
  {
    title: '评分策略',
    dataIndex: 'scoringStrategy',
    slotName: 'scoringStrategy',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 120,
  },
  {
    title: '操作',
    slotName: 'optional',
    width: 150,
    fixed: 'right',
  },
];
</script>

<style scoped>
.answer-list-container {
  padding: 16px;
  background: var(--color-fill-2);
  min-height: 100vh;
}

.search-card {
  margin-bottom: 16px;
  background: white;
  border-radius: 4px;
}

.table-card {
  background: white;
  border-radius: 4px;
}

:deep(.arco-table-th) {
  background: var(--color-fill-2) !important;
}

:deep(.arco-table-hover) {
  transition: background-color 0.3s;
}

:deep(.arco-table-row:hover) {
  background-color: var(--color-fill-2);
}

:deep(.arco-btn-text) {
  padding: 0 4px;
}

:deep(.arco-image) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.arco-tag) {
  margin: 0;
}

@media (max-width: 768px) {
  .answer-list-container {
    padding: 8px;
  }

  :deep(.arco-table-th) {
    white-space: nowrap;
  }
}
</style>