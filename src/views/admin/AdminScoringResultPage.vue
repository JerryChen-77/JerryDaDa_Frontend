<template>

  <a-form
      style="margin-bottom: 20px"
      label-align="left"
      auto-label-width
      :model="searchParams"
      layout="inline"
      @submit="doSearch"
  >
    <a-form-item field="resultName" label="结果名称">
      <a-input v-model="formSearchParams.resultName" placeholder="请输入结果名称"/>
    </a-form-item>
    <a-form-item field="userProfile" label="结果描述">
      <a-input v-model="formSearchParams.resultDesc" placeholder="请输入结果描述"/>
    </a-form-item>
    <a-form-item field="userId" label="创建人Id">
      <a-input v-model="formSearchParams.userId" placeholder="请输入创建人Id"/>
    </a-form-item>
    <a-form-item field="appId" label="应用Id">
      <a-input v-model="formSearchParams.appId" placeholder="请输入应用Id"/>
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
        <a-button type="primary" @click="handleUpdate(record)">修改</a-button>
        <a-button status="danger" @click="handleDelete(record)">删除</a-button>
      </a-space>
    </template>

    <template #resultPicture="{ record }">
      <a-image width="64" :src="record.resultPicture"/>
    </template>
    <template #createTime="{ record }">
      {{ dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
    </template>
    <template #updateTime="{ record }">
      {{ dayjs(record.updateTime).format("YYYY-MM-DD HH:mm:ss") }}
    </template>
  </a-table>

  <a-modal v-model:visible="visible" @ok="handleOk(currentScoringResult)" @cancel="handleCancel">
    <template #title>
      删除评分结果
    </template>
    <div>您确认要删除此条评分结果吗，删除以后可能无法找回</div>
  </a-modal>


  <!-- 抽屉组件 -->
  <a-drawer
      v-model:visible="updateDrawerVisible"
      title="修改用户"
      placement="right"
      width="90%"
  ><!-- 抽屉中的表单组件 -->
    <a-form
        :model="currentScoringResult"
        label-align="left"
        auto-label-width
        layout="vertical"
    >
      <a-form-item disabled field="id" label="id">
        <a-input v-model="currentScoringResult.id" placeholder="请输入id" disabled />
      </a-form-item>
      <a-form-item field="resultName" label="名称">
        <a-input v-model="currentScoringResult.resultName" placeholder="请输入名称" />
      </a-form-item>
      <a-form-item field="resultDesc" label="描述">
        <a-input v-model="currentScoringResult.resultDesc" placeholder="请输入描述"/>
      </a-form-item>
      <a-form-item field="resultProp" label="结果属性">
        <a-input v-model="currentScoringResult.resultProp" placeholder="请输入结果属性"/>
      </a-form-item>
      <a-form-item field="resultScoreRange" label="评分范围">
        <a-input v-model="currentScoringResult.resultScoreRange" placeholder="请输入评分范围"/>
      </a-form-item>
      <a-form-item field="appId" label="应用id">
        <a-input v-model="currentScoringResult.appId" placeholder="请输入应用id" disabled/>
      </a-form-item>
      <a-form-item field="userId" label="用户id">
        <a-input v-model="currentScoringResult.userId" placeholder="请输入用户id" disabled/>
      </a-form-item>
      <a-form-item disabled field="createTime" label="创建时间">
        <a-input v-model="currentScoringResult.createTime" placeholder="请输入创建时间" disabled/>
      </a-form-item>

    </a-form>
    <template #footer>
      <a-button type="primary" @click="doUpdate(currentScoringResult)">确认</a-button>
      <a-button style="background: white;color: black" type="primary" @click="()=>{
          updateDrawerVisible = false
        }">取消
      </a-button>
    </template>
  </a-drawer>

</template>

<script setup lang="ts">
// 表单数据
import {
  deleteScoringResultUsingPost,
  listScoringResultVoByPageUsingPost,
  updateScoringResultUsingPost
} from "@/api/scoringResultController";
import {ref, watchEffect} from "vue";
import API from "@/api"
import message from "@arco-design/web-vue/es/message";
import dayjs from "dayjs";




const dataList = ref<API.ScoringResultVO[]>([]);
const total = ref<number>(0);

const formSearchParams = ref<API.ScoringResultQueryRequest>({});
// 不能被修改
const initSearchParams = {
  current: 1,
  pageSize: 8,
}
const searchParams = ref<API.ScoringResultQueryRequest>({
  ...initSearchParams,
})

const visible = ref(false);

const currentScoringResult = ref<API.ScoringResultVO>({});
const handleDelete = (record: API.ScoringResultVO) => {
  currentScoringResult.value = record;
  visible.value = true;
};
// 抽屉显示状态
const updateDrawerVisible = ref(false);

// 显示抽屉的方法
const handleUpdate = (record: API.ScoringResultVO) => {
  currentScoringResult.value = record;
  updateDrawerVisible.value = true;
};
const handleOk = (record: API.ScoringResultVO) => {
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
  const res = await listScoringResultVoByPageUsingPost(searchParams.value)
  if (res.data.code === 0) {
    dataList.value = res.data.data?.records || [];
    total.value = res.data.data?.total;
  } else {
    message.error("获取数据失败" + res.data.message)
  }
}

const doClean = () => {
  formSearchParams.value = {
    resultName: "",
    resultDesc: "",
    userId:"",
    appId:"",
  }
}
const doSearch = () => {
  searchParams.value = {
    ...initSearchParams,
    ...formSearchParams.value,
  };
}

const doDelete = async (record: API.ScoringResultVO) => {
  const res = await deleteScoringResultUsingPost(record.id)
  if (res.data.code === 0) {
    await loadData();
  } else {
    message.error("删除数据失败" + res.data.message)
  }
}
// TODO更新
const doUpdate = async (record: API.ScoringResultVO) => {
  message.info("正在更新")
  const res = await updateScoringResultUsingPost({
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

// 表格列配置
const columns = [
  {
    title: "id",
    dataIndex: "id",
  },
  {
    title: "名称",
    dataIndex: "resultName",
  },
  {
    title: "描述",
    dataIndex: "resultDesc",
  },
  {
    title: "图片",
    dataIndex: "resultPicture",
    slotName: "resultPicture",
  },
  {
    title: "结果属性",
    dataIndex: "resultProp",
  },
  {
    title: "评分范围",
    dataIndex: "resultScoreRange",
  },
  {
    title: "应用 id",
    dataIndex: "appId",
  },
  {
    title: "用户 id",
    dataIndex: "userId",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    slotName: "createTime",
  },
  {
    title: "更新时间",
    dataIndex: "updateTime",
    slotName: "updateTime",
  },
  {
    title: "操作",
    slotName: "optional",
  },
];

</script>