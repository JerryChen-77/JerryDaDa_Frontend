<template>

  <a-form
      style="margin-bottom: 20px"
      label-align="left"
      auto-label-width
      :model="searchParams"
      layout="inline"
      @submit="doSearch"
  >
    <a-form-item field="appName" label="应用名称">
      <a-input v-model="formSearchParams.appName" placeholder="请输入应用名"/>
    </a-form-item>
    <a-form-item field="appDesc" label="应用描述">
      <a-input v-model="formSearchParams.appDesc" placeholder="请输入应用简介"/>
    </a-form-item>
    <a-form-item field="reviewStatus" label="审核状态">
      <a-select v-model="formSearchParams.reviewStatus" placeholder="请选择审核状态">
        <a-option value="0">未审核</a-option>
        <a-option value="1">通过</a-option>
        <a-option value="2">拒绝</a-option>
      </a-select>
    </a-form-item>
    <a-form-item field="scoringStrategy" label="评分策略">
      <a-select v-model="formSearchParams.scoringStrategy" placeholder="请选择评分策略">
        <a-option value="0">自定义</a-option>
        <a-option value="1">AI</a-option>
      </a-select>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit" style="width: 80px">
        搜索
      </a-button>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit" @click="doClean" style="width: 80px">
        重置
      </a-button>
    </a-form-item>
  </a-form>
  <a-table
      :ref="tableRef"
      :columns="columns"
      :data="dataList"
      :pagination="{
    showTotal: true,
    pageSize: searchParams.pageSize,
    current: searchParams.current,
    total,
  }"
      @page-change="onPageChange"
  >
    <template #userAvatar="{ record }">
      <a-image :src="record.userAvatar" width="64px" height="50"/>
    </template>

    <template #optional="{ record }">
      <a-space>
        <a-button type="primary" status="warning" @click="handleReview(record)">审核</a-button>
        <a-button type="primary" @click="handleUpdate(record)">修改</a-button>
        <a-button status="danger" @click="handleDelete(record)">删除</a-button>
      </a-space>
    </template>

    <template #reviewStatus="{ record }">
      <a-tag v-if="record.reviewStatus === 0" color="red">待审核</a-tag>
      <a-tag v-else-if="record.reviewStatus === 1" color="green">通过</a-tag>
      <a-tag v-else-if="record.reviewStatus === 2" color="red">拒绝</a-tag>
    </template>

    <template #scoringStrategy="{ record }">
      <a-tag v-if="record.scoringStrategy === 0" color="blue">自定义</a-tag>
      <a-tag v-else-if="record.scoringStrategy === 1" color="green">AI</a-tag>
    </template>


    <template #createTime="{ record }">
      {{ formatDate(record.createTime) }}
    </template>

    <template #updateTime="{ record }">
      {{ formatDate(record.updateTime) }}
    </template>

    <template #reviewTime="{ record }">
      {{ formatDate(record.reviewTime) }}
    </template>
  </a-table>

  <a-modal v-model:visible="visible" @ok="handleOk(currentApp)" @cancel="handleCancel">
    <template #title>
      删除应用
    </template>
    <div>您确认要删除应用吗，删除以后可能无法找回</div>
  </a-modal>


  <!-- 抽屉组件 -->
  <a-drawer
      v-model:visible="updateDrawerVisible"
      title="修改应用"
      placement="right"
      width="90%"
  ><!-- 抽屉中的表单组件 -->
    <a-form
        :model="currentApp"
        label-align="left"
        auto-label-width
        layout="vertical"
    >
      <a-form-item disabled field="id" label="ID">
        <a-input v-model="currentApp.id" placeholder="请输入ID"/>
      </a-form-item>
      <a-form-item field="appName" label="应用名称">
        <a-input v-model="currentApp.appName" placeholder="请输入应用名称"/>
      </a-form-item>
      <a-form-item field="appDesc" label="应用描述">
        <a-input v-model="currentApp.appDesc" placeholder="请输入应用描述"/>
      </a-form-item>
      <a-form-item disabled field="createTime" label="创建时间">
        <a-input v-model="currentApp.createTime" placeholder="请输入创建时间"/>
      </a-form-item>
      <a-form-item disabled field="updateTime" label="更新时间">
        <a-input v-model="currentApp.updateTime" placeholder="请输入更新时间"/>
      </a-form-item>
      <a-select v-model="currentApp.scoringStrategy" placeholder="请选择评分策略">
        <a-option :value="0">自定义</a-option>
        <a-option :value="1">AI</a-option>
      </a-select>
    </a-form>


    <template #footer>
      <a-button type="primary" @click="doUpdate(currentApp)">确认</a-button>
      <a-button style="background: white;color: black" type="primary" @click="()=>{
          updateDrawerVisible = false
        }">取消
      </a-button>
    </template>
  </a-drawer>

  <a-modal v-model:visible="showReview" @ok="doReview(ReviewModel)" @cancel="() => showReview = false">
    <template #title>
      审核应用
    </template>
    <a-form :model="ReviewModel" label-align="left" auto-label-width layout="vertical">
      <a-form-item field="id" label="ID">
        <a-input v-model="ReviewModel.id" disabled/>
      </a-form-item>
      <a-form-item field="appName" label="应用名称">
        <a-input v-model="ReviewModel.appName" disabled/>
      </a-form-item>
      <a-form-item field="appDesc" label="应用描述">
        <a-input v-model="ReviewModel.appDesc" disabled/>
      </a-form-item>
      <a-form-item field="scoringStrategy" label="评分策略">
        <a-select v-model="ReviewModel.scoringStrategy" placeholder="请选择评分策略" disabled>
          <a-option :value="0">自定义</a-option>
          <a-option :value="1">AI</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="reviewStatus" label="审核状态">
        <a-select v-model="ReviewModel.reviewStatus" placeholder="请选择审核状态">
          <a-option :value="0">未审核</a-option>
          <a-option :value="1">通过</a-option>
          <a-option :value="2">拒绝</a-option>
        </a-select>
      </a-form-item>
      <a-form-item field="reviewMessage" label="审核消息">
        <a-input v-model="ReviewModel.reviewMessage"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
// 表单数据
import {
  deleteAppUsingPost,
  doAppReviewUsingPost,
  listAppVoByPageUsingPost,
  updateAppUsingPost
} from "@/api/appController";


import {ref, watchEffect} from "vue";
import API from "@/api"
import message from "@arco-design/web-vue/es/message";

const dataList = ref<API.AppVO[]>([]);
const total = ref<number>(0);
const showReview = ref(false)
const formSearchParams = ref<API.AppQueryRequest>({});

// 不能被修改
const initSearchParams = {
  current: 1,
  pageSize: 8,
}
const searchParams = ref<API.AppQueryRequest>({
  ...initSearchParams,
})

const visible = ref(false);

const currentApp = ref<API.AppVO>({});
const handleDelete = (record: API.AppVO) => {
  currentApp.value = record;
  visible.value = true;
};
// 抽屉显示状态
const updateDrawerVisible = ref(false);

// 显示抽屉的方法
const handleUpdate = (record: API.AppVO) => {
  currentApp.value = record;
  updateDrawerVisible.value = true;
};
const ReviewModel = ref({})

const handleReview = (record: API.AppVO) => {
  ReviewModel.value = record;
  showReview.value = true;
}


const doReview = async (record: API.AppVO) => {
  const res = await doAppReviewUsingPost({
    id: ReviewModel.value.id,
    reviewStatus: ReviewModel.value.reviewStatus,
    reviewMessage: ReviewModel.value.reviewMessage,
  })
  if (res.data.code === 0) {
    message.info("正在审核" + record.appName + "的信息")
    await loadData();
  }else {
    message.error("审核失败   " + res.data.message)
    await loadData();
  }
}
const handleOk = (record: API.AppVO) => {
  doDelete(record);
  visible.value = false;
  message.warning("正在删除");

};
const handleCancel = () => {
  visible.value = false;
  message.info("取消删除");
}

// 格式化时间
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const loadData = async () => {
  const res = await listAppVoByPageUsingPost(searchParams.value)
  if (res.data.code === 0) {
    dataList.value = res.data.data?.records || [];
    total.value = res.data.data?.total;
  } else {
    message.error("获取数据失败" + res.data.message)
  }
}

const doClean = () => {
  formSearchParams.value = {
    appName: "",
    appDesc: "",
    reviewStatus: undefined,
    scoringStrategy: undefined
  }
}
const doSearch = () => {
  searchParams.value = {
    ...initSearchParams,
    ...formSearchParams.value,
  };
}

const doDelete = async (record: API.AppVO) => {
  const res = await deleteAppUsingPost(record.id)
  if (res.data.code === 0) {
    await loadData();
  } else {
    message.error("删除数据失败" + res.data.message)
  }
}
// TODO更新
const doUpdate = async (record: API.AppVO) => {
  message.info("正在更新")
  const res = await updateAppUsingPost({
    ...record
  })
  if (res.data.code === 0) {
    await loadData();
  } else {
    message.error("更新数据失败" + res.data.message)
  }
  updateDrawerVisible.value = false;
}
watchEffect(() => {
  loadData();
})
const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page
  }
}

const columns = [
  {
    title: 'ID',
    dataIndex: 'id'
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
    title: '创建时间',
    dataIndex: '创建时间',
    slotName: 'createTime'
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    slotName: 'updateTime'
  },
  {
    title: '审核消息',
    dataIndex: 'reviewMessage'
  },
  {
    title: '审核状态',
    dataIndex: 'reviewStatus',
    slotName: 'reviewStatus',
    ellipsis: true
  },
  {
    title: '审核时间',
    dataIndex: 'reviewTime',
    slotName: 'reviewTime'
  },
  {
    title: '审核人ID',
    dataIndex: 'reviewerId'
  },
  {
    title: '评分策略',
    dataIndex: 'scoringStrategy',
    slotName: 'scoringStrategy'
  },
  {
    title: '操作',
    dataIndex: 'optional',
    slotName: 'optional',
    width: 250, // 设置固定列宽
    align: 'center' // 设置列内容居中
  }
]

</script>