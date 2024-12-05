<template>
  <div class="user-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>
        <icon-user-group /> 用户管理
      </h2>
    </div>

    <!-- 搜索区域 -->
    <a-card class="search-card">
      <a-form
          :model="formSearchParams"
          layout="horizontal"
          @submit="doSearch"
      >
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="userName" label="用户名">
              <a-input
                  v-model="formSearchParams.userName"
                  placeholder="请输入用户名"
                  allow-clear
              >
                <template #prefix>
                  <icon-user />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="userProfile" label="用户简介">
              <a-input
                  v-model="formSearchParams.userProfile"
                  placeholder="请输入用户简介"
                  allow-clear
              >
                <template #prefix>
                  <icon-info-circle />
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
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
          :data="dataList"
          :columns="columns"
          :loading="loading"
          :pagination="{
          showTotal: true,
          showJumper: true,
          pageSize: searchParams.pageSize,
          current: searchParams.current,
          total,
          showPageSize: true,
        }"
          @page-change="onPageChange"
          :bordered="false"
          :stripe="true"
          row-key="id"
      >
        <!-- 用户头像列 -->
        <template #userAvatar="{ record }">
          <a-image
              :src="record.userAvatar"
              width="64"
              height="50"
              :preview-visible="false"
              fallback="https://p3-passport.byteimg.com/img/user-avatar/18e88966242b92cb4a4651840b85d680~100x100.awebp"
          />
        </template>

        <!-- 用户角色列 -->
        <template #userRole="{ record }">
          <a-tag :color="record.userRole === 'admin' ? 'purple' : 'blue'">
            {{ record.userRole.toUpperCase() }}
          </a-tag>
        </template>

        <!-- 时间列 -->
        <template #createTime="{ record }">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>

        <template #updateTime="{ record }">
          {{ dayjs(record.updateTime).format('YYYY-MM-DD HH:mm:ss') }}
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
                content="确定要删除该用户吗？此操作不可恢复！"
                position="left"
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

    <!-- 修改用户抽屉 -->
    <a-drawer
        v-model:visible="updateDrawerVisible"
        title="修改用户信息"
        placement="right"
        width="500px"
        unmount-on-close
    >
      <template #header>
        <a-space>
          <icon-edit />
          修改用户信息
        </a-space>
      </template>

      <a-form
          ref="updateFormRef"
          :model="currentUser"
          layout="vertical"
          :rules="rules"
      >
        <a-form-item field="id" label="用户ID" disabled>
          <a-input v-model="currentUser.id" disabled />
        </a-form-item>

        <a-form-item field="userAccount" label="账号" disabled>
          <a-input v-model="currentUser.userAccount" disabled />
        </a-form-item>

        <a-form-item field="userName" label="用户名" required>
          <a-input
              v-model="currentUser.userName"
              placeholder="请输入用户名"
              allow-clear
          />
        </a-form-item>

        <a-form-item field="userAvatar" label="用户头像">
          <a-input
              v-model="currentUser.userAvatar"
              placeholder="请输入用户头像URL"
              allow-clear
          />
        </a-form-item>

        <a-form-item field="userProfile" label="简介">
          <a-textarea
              v-model="currentUser.userProfile"
              placeholder="请输入用户简介"
              :max-length="200"
              show-word-limit
              allow-clear
          />
        </a-form-item>

        <a-form-item field="userRole" label="角色">
          <a-radio-group v-model="currentUser.userRole">
            <a-radio value="user">普通用户</a-radio>
            <a-radio value="admin">管理员</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item field="createTime" label="创建时间" disabled>
          <a-input v-model="currentUser.createTime" disabled />
        </a-form-item>

        <a-form-item field="updateTime" label="更新时间" disabled>
          <a-input v-model="currentUser.updateTime" disabled />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-space>
          <a-button @click="updateDrawerVisible = false">取消</a-button>
          <a-button
              type="primary"
              :loading="updating"
              @click="doUpdate(currentUser)"
          >
            保存修改
          </a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import dayjs from 'dayjs';
import { Message } from '@arco-design/web-vue';
import type { FormInstance } from '@arco-design/web-vue';
import {
  IconUserGroup,
  IconUser,
  IconInfoCircle,
  IconSearch,
  IconRefresh,
  IconEdit,
  IconDelete,
} from '@arco-design/web-vue/es/icon';
import type API from '@/api';
import {
  deleteUserUsingPost,
  listUserByPageUsingPost,
  updateUserUsingPost,
} from '@/api/userController';


// 状态定义
const loading = ref(false);
const updating = ref(false);
const updateFormRef = ref<FormInstance>();
const dataList = ref<API.User[]>([]);
const total = ref(0);
const updateDrawerVisible = ref(false);
const currentUser = ref<API.User>({});

// 搜索参数
const formSearchParams = ref<API.UserQueryRequest>({
  userName: '',
  userProfile: '',
});

// 分页参数
const initSearchParams = {
  current: 1,
  pageSize: 10,
};

const searchParams = ref<API.UserQueryRequest>({
  ...initSearchParams,
});

// 表单验证规则
const rules = {
  userName: [
    { required: true, message: '请输入用户名' },
    { maxLength: 32, message: '用户名最长32个字符' },
  ],
  userProfile: [
    { maxLength: 200, message: '简介最长200个字符' },
  ],
};

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await listUserByPageUsingPost(searchParams.value);
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
  formSearchParams.value = {
    userName: '',
    userProfile: '',
  };
  searchParams.value = { ...initSearchParams };
};

// 删除用户
const doDelete = async (record: API.User) => {
  try {
    const res = await deleteUserUsingPost(record.id);
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

// 更新用户
const doUpdate = async (record: API.User) => {
  try {
    await updateFormRef.value?.validate();
    updating.value = true;
    const res = await updateUserUsingPost(record);
    if (res.data.code === 0) {
      Message.success('更新成功');
      updateDrawerVisible.value = false;
      await loadData();
    } else {
      Message.error(`更新失败：${res.data.message}`);
    }
  } catch (error) {
    if (error.type === 'form') {
      Message.error('请检查表单填写是否正确');
    } else {
      Message.error('操作失败，请重试');
    }
  } finally {
    updating.value = false;
  }
};

// 显示编辑抽屉
const handleUpdate = (record: API.User) => {
  currentUser.value = { ...record };
  updateDrawerVisible.value = true;
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
    title: 'ID',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    width: 120,
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
    width: 120,
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
    slotName: 'userAvatar',
    width: 80,
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
    ellipsis: true,
    width: 200,
  },
  {
    title: '角色',
    dataIndex: 'userRole',
    slotName: 'userRole',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
    width: 120,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    slotName: 'updateTime',
    width: 120,
  },
  {
    title: '操作',
    slotName: 'optional',
    width: 160,
    fixed: 'right',
    align: 'center'
  },
];
</script>

<style scoped>
.user-management {
  padding: 16px;
  background: var(--color-fill-2);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
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

:deep(.arco-upload-trigger) {
  background: transparent;
}

:deep(.arco-form-item-label-col) {
  font-weight: 500;
}

@media (max-width: 768px) {
  .user-management {
    padding: 8px;
  }

  :deep(.arco-table-th) {
    white-space: nowrap;
  }
}
</style>