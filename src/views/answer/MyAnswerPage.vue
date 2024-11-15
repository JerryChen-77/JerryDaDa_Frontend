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
      <a-image :src="record.userAvatar" width="64px" height="50" />
    </template>

    <template #optional="{ record }">
      <a-space>
        <a-button :href="`/answer/result/${record.id}`">查看结果</a-button>
        <a-button status="danger" @click="doDelete(record)">删除</a-button>
      </a-space>
    </template>


    <template #appType="{record}">
      <a-tag color="blue" v-if="record.appType === 0">测评类</a-tag>
      <a-tag color="green" v-if="record.appType === 1">得分类</a-tag>
    </template>

    <template #scoringStrategy="{record}">
      <a-tag color="purple" v-if="record.scoringStrategy === 0">自定义</a-tag>
      <a-tag color="orange" v-if="record.scoringStrategy === 1">AI</a-tag>
    </template>

    <template #createTime="{ record }">
      {{ dayjs(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
    </template>

  </a-table>

  <a-modal v-model:visible="visible" @ok="handleOk(currentSUserAnswer)" @cancel="handleCancel">
    <template #title>
      删除用户回答
    </template>
    <div>您确认要删除此条用户回答吗，删除以后可能无法找回</div>
  </a-modal>



  <!-- 抽屉组件 -->
  <a-drawer
      v-model:visible="updateDrawerVisible"
      title="修改用户"
      placement="right"
      width="90%"
  ><!-- 抽屉中的表单组件 -->
    <a-form
        :model="currentSUserAnswer"
        label-align="left"
        auto-label-width
        layout="vertical"
    >
      <a-form-item disabled field="id" label="ID">
        <a-input v-model="currentSUserAnswer.id" placeholder="请输入ID" />
      </a-form-item>
      <a-form-item disabled field="userAccount" label="用户账号">
        <a-input v-model="currentSUserAnswer.userAccount" placeholder="请输入用户账号" />
      </a-form-item>
      <a-form-item field="userName" label="用户名">
        <a-input v-model="currentSUserAnswer.userName" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item field="userAvatar" label="用户头像">
        <a-input v-model="currentSUserAnswer.userAvatar" placeholder="请输入用户头像" />
      </a-form-item>
      <a-form-item field="userProfile" label="用户简介" >
        <a-input type="text" v-model="currentSUserAnswer.userProfile" placeholder="请输入用户简介" style="height: 96px"/>
      </a-form-item>
      <a-form-item field="userRole" label="用户角色">
        <a-select v-model="currentSUserAnswer.userRole" placeholder="请选择用户角色">
          <a-option value="admin">admin</a-option>
          <a-option value="user">user</a-option>
        </a-select>
      </a-form-item>
      <a-form-item disabled field="createTime" label="创建时间">
        <a-input v-model="currentSUserAnswer.createTime" placeholder="请输入创建时间" />
      </a-form-item>
      <a-form-item disabled field="updateTime" label="更新时间">
        <a-input v-model="currentSUserAnswer.updateTime" placeholder="请输入更新时间" />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-button type="primary" @click="doUpdate(currentSUserAnswer)">确认</a-button>
      <a-button style="background: white;color: black" type="primary" @click="()=>{
          updateDrawerVisible = false
        }">取消</a-button>
    </template>
  </a-drawer>

</template>

<script setup lang="ts">
// 表单数据
import dayjs from "dayjs";

const form = ref({
  name: '',
  email: '',
  // 其他表单字段
});


import {ref, watchEffect} from "vue";
import API from "@/api"
import {deleteUserUsingPost, listUserByPageUsingPost, updateUserUsingPost} from "@/api/userController";
import message from "@arco-design/web-vue/es/message";
import {contains} from "@arco-design/web-vue/es/_utils/dom";
import {
  deleteUserAnswerUsingPost, listMyUserAnswerVoByPageUsingPost,
  listUserAnswerVoByPageUsingPost,
  updateUserAnswerUsingPost
} from "@/api/userAnswerController";

const dataList = ref<API.UserAnswerVO[]>([]);
const total = ref<number>(0);

const formSearchParams  = ref<API.UserAnswerQueryRequest>({});
// 不能被修改
const initSearchParams = {
  current: 1,
  pageSize: 8,
}
const searchParams = ref<API.UserAnswerQueryRequest>({
  ...initSearchParams,
})

const visible = ref(false);

const currentSUserAnswer = ref<API.UserAnswerVO>({});
const handleDelete = (record: API.UserAnswerVO) => {
  currentSUserAnswer.value = record;
  visible.value = true;
};
// 抽屉显示状态
const updateDrawerVisible = ref(false);

// 显示抽屉的方法
const handleUpdate = (record : API.UserAnswerVO) => {
  currentSUserAnswer.value = record;
  updateDrawerVisible.value = true;
};
const handleOk = (record : API.UserAnswerVO) => {
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

const loadData = async ()=>{
  const res = await listMyUserAnswerVoByPageUsingPost(searchParams.value)
  if(res.data.code === 0){
    dataList.value = res.data.data?.records || [];
    total.value = res.data.data?.total;
  }else {
    message.error("获取数据失败"+res.data.message)
  }
}


const doSearch = ()=>{
  searchParams.value ={
    ...initSearchParams,
    ...formSearchParams.value,
  };
}

const doDelete = async (record: API.UserAnswerVO)=>{
  const res = await deleteUserAnswerUsingPost(record.id)
  if(res.data.code === 0){
    await loadData();
  }else {
    message.error("删除数据失败"+res.data.message)
  }
}
// TODO更新
const doUpdate = async (record: API.UserAnswerVO)=>{
  message.info("正在更新")
  const res = await updateUserAnswerUsingPost({
    ...record
  })
  if(res.data.code === 0){
    await loadData();
  }else {
    message.error("更新数据失败"+res.data.message)
  }
  updateDrawerVisible.value = false;
}
watchEffect(()=>{
  loadData();
})
const onPageChange = (page: number)=>{
  searchParams.value = {
    ...searchParams.value,
    current: page
  }
}

// 表格列配置
const columns = [
  {
    title: "应用 id",
    dataIndex: "appId",
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
    title: "选项",
    dataIndex: "choices",
  },
  {
    title: "图片",
    dataIndex: "resultPicture",
    slotName: "resultPicture",
  },
  {
    title: "得分",
    dataIndex: "resultScore",
  },
  {
    title: "应用类型",
    dataIndex: "appType",
    slotName: "appType",
  },
  {
    title: "评分策略",
    dataIndex: "scoringStrategy",
    slotName: "scoringStrategy",
  },
  {
    title: "创建时间",
    dataIndex: "createTime",
    slotName: "createTime",
  },
  {
    title: "操作",
    slotName: "optional",
  },
];

</script>