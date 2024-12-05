<template>
  <div class="app-management">
    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form
          :model="searchParams"
          layout="horizontal"
          @submit="doSearch"
      >
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item field="appName" label="应用名称">
              <a-input
                  v-model="formSearchParams.appName"
                  placeholder="请输入应用名"
                  allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item field="appDesc" label="应用描述">
              <a-input
                  v-model="formSearchParams.appDesc"
                  placeholder="请输入应用描述"
                  allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item field="reviewStatus" label="审核状态">
              <a-select
                  v-model="formSearchParams.reviewStatus"
                  placeholder="请选择审核状态"
                  allow-clear
              >
                <a-option value="0">未审核</a-option>
                <a-option value="1">已通过</a-option>
                <a-option value="2">已拒绝</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item field="scoringStrategy" label="评分策略">
              <a-select
                  v-model="formSearchParams.scoringStrategy"
                  placeholder="请选择评分策略"
                  allow-clear
              >
                <a-option value="0">自定义</a-option>
                <a-option value="1">AI</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24" style="text-align: right">
            <a-space>
              <a-button type="primary" html-type="submit">
                <template #icon><icon-search /></template>
                搜索
              </a-button>
              <a-button @click="doClean">
                <template #icon><icon-refresh /></template>
                重置
              </a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>

    <!-- 表格区域 -->
    <a-card class="table-card">
      <a-table
          :loading="loading"
          :data="dataList"
          :columns="columns"
          :pagination="{
          showTotal: true,
          showJumper: true,
          pageSize: searchParams.pageSize,
          current: searchParams.current,
          total,
          showPageSize: true
        }"
          @page-change="onPageChange"
          :bordered="false"
          :stripe="true"
          row-key="id"
      >
        <!-- 审核状态列 -->
        <template #reviewStatus="{ record }">
          <a-tag :color="getReviewStatusColor(record.reviewStatus)">
            {{ getReviewStatusText(record.reviewStatus) }}
          </a-tag>
        </template>

        <!-- 评分策略列 -->
        <template #scoringStrategy="{ record }">
          <a-tag :color="record.scoringStrategy === 0 ? 'blue' : 'green'">
            {{ record.scoringStrategy === 0 ? '自定义' : 'AI' }}
          </a-tag>
        </template>

        <!-- 时间列 -->
        <template #createTime="{ record }">
          <a-tooltip :content="dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss')">
            {{ dayjs(record.createTime).format('YYYY-MM-DD') }}
          </a-tooltip>
        </template>

        <template #updateTime="{ record }">
          <a-tooltip :content="dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss')">
            {{ dayjs(record.updateTime).format('YYYY-MM-DD') }}
          </a-tooltip>
        </template>

        <template #reviewTime="{ record }">
          <a-tooltip v-if="record.reviewTime" :content="dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss')">
            {{ dayjs(record.reviewTime).format('YYYY-MM-DD') }}
          </a-tooltip>
          <span v-else>-</span>
        </template>

        <!-- 操作列 -->
        <template #optional="{ record }">
          <a-space>
            <a-button
                type="text"
                @click="handleUpdate(record)"
            >
              <template #icon><icon-edit /></template>
              修改
            </a-button>
            <a-popconfirm
                content="确定要删除该应用吗？此操作不可恢复！"
                @ok="doDelete(record)"
            >
              <a-button
                  type="text"
                  status="danger"
              >
                <template #icon><icon-delete /></template>
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>



    <!-- 编辑抽屉 -->
    <a-drawer
        v-model:visible="updateDrawerVisible"
        title="编辑应用"
        width="500"
        @cancel="updateDrawerVisible = false"
    >
      <a-form
          ref="updateFormRef"
          :model="currentApp"
          layout="vertical"
      >
        <a-form-item label="应用名称" required>
          <a-input
              v-model="currentApp.appName"
              placeholder="请输入应用名称"
              allow-clear
          />
        </a-form-item>
        <a-form-item label="应用描述">
          <a-textarea
              v-model="currentApp.appDesc"
              placeholder="请输入应用描述"
              :auto-size="{ minRows: 3, maxRows: 5 }"
              allow-clear
          />
        </a-form-item>
        <a-form-item label="评分策略">
          <a-radio-group v-model="currentApp.scoringStrategy">
            <a-radio :value="0">自定义</a-radio>
            <a-radio :value="1">AI</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space>
          <a-button @click="updateDrawerVisible = false">取消</a-button>
          <a-button type="primary" @click="doUpdate(currentApp)">确定</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import dayjs from 'dayjs';
import { Message } from '@arco-design/web-vue';
import {
  IconSearch,
  IconRefresh,
  IconEdit,
  IconDelete,
  IconCheck
} from '@arco-design/web-vue/es/icon';
import type { FormInstance } from '@arco-design/web-vue';
import {
  deleteAppUsingPost,
  doAppReviewUsingPost, editAppUsingPost,
  listAppVoByPageUsingPost, listMyAppVoByPageUsingPost,
  updateAppUsingPost
} from '@/api/appController';
import type API from '@/api';

// 状态定义
const loading = ref(false);
const dataList = ref<API.AppVO[]>([]);
const total = ref(0);
const showReview = ref(false);
const updateDrawerVisible = ref(false);
const updateFormRef = ref<FormInstance>();

// 表单数据
const formSearchParams = ref<API.AppQueryRequest>({});
const currentApp = ref<API.AppVO>({});
const ReviewModel = ref<any>({});

// 初始化搜索参数
const initSearchParams = {
  current: 1,
  pageSize: 10
};

const searchParams = ref<API.AppQueryRequest>({
  ...initSearchParams
});

// 获取审核状态颜色
const getReviewStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'orange';
    case 1: return 'green';
    case 2: return 'red';
    default: return 'default';
  }
};

// 获取审核状态文本
const getReviewStatusText = (status: number) => {
  switch (status) {
    case 0: return '未审核';
    case 1: return '已通过';
    case 2: return '已拒绝';
    default: return '未知';
  }
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await listMyAppVoByPageUsingPost(searchParams.value);
    if (res.data.code === 0) {
      dataList.value = res.data.data?.records || [];
      total.value = res.data.data?.total || 0;
    } else {
      Message.error(`获取数据失败：${res.data.message}`);
    }
  } catch (error) {
    Message.error('加载数据失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 搜索
const doSearch = () => {
  searchParams.value = {
    ...initSearchParams,
    ...formSearchParams.value
  };
};

// 重置
const doClean = () => {
  formSearchParams.value = {
    appName: '',
    appDesc: '',
    reviewStatus: undefined,
    scoringStrategy: undefined
  };
  doSearch();
};



// 更新
const handleUpdate = (record: API.AppVO) => {
  currentApp.value = { ...record };
  updateDrawerVisible.value = true;
};

const doUpdate = async (record: API.AppVO) => {
  try {
    const res = await editAppUsingPost(record);
    if (res.data.code === 0) {
      Message.success('更新成功');
      updateDrawerVisible.value = false;
      await loadData();
    } else {
      Message.error(`更新失败：${res.data.message}`);
    }
  } catch (error) {
    Message.error('操作失败，请重试');
  }
};

// 删除
const doDelete = async (record: API.AppVO) => {
  try {
    const res = await deleteAppUsingPost(record.id);
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

// 分页
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
    title: 'ID',
    dataIndex: 'id',
    width: 80
  },
  {
    title: '应用名称',
    dataIndex: 'appName',
    ellipsis: true
  },
  {
    title: '应用描述',
    dataIndex: 'appDesc',
    ellipsis: true
  },
  {
    title: '审核状态',
    dataIndex: 'reviewStatus',
    slotName: 'reviewStatus',
    width: 100
  },
  {
    title: '评分策略',
    dataIndex: 'scoringStrategy',
    slotName: 'scoringStrategy',
    width: 100
  },
  {
    title: '审核消息',
    dataIndex: 'reviewMessage',
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 100
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    slotName: 'updateTime',
    width: 100
  },
  {
    title: '审核时间',
    dataIndex: 'reviewTime',
    slotName: 'reviewTime',
    width: 100
  },
  {
    title: '操作',
    slotName: 'optional',
    width: 200,
    fixed: 'right',
    align: 'center'
  }];
</script>
