<template>

<!--  搜索条-->
  <a-form
      style="margin-bottom: 20px"
      label-align="left"
      auto-label-width
      :model="searchParams"
      layout="inline"
      @submit="doSearch"
  >
    <a-form-item field="questionId" label="题目Id">
      <a-input v-model="formSearchParams.id" placeholder="请输入题目ID" />
    </a-form-item>
    <a-form-item field="userId" label="用户Id">
      <a-input v-model="formSearchParams.userId" placeholder="请输入用户ID" />
    </a-form-item>
    <a-form-item field="appId" label="应用Id">
      <a-input v-model="formSearchParams.appId" placeholder="请输入应用ID" />
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
<!--  表格内容-->
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
        <a-button type="primary" @click="handleUpdate(record)">修改</a-button>
        <a-button status="danger" @click="handleDelete(record)">删除</a-button>
      </a-space>
    </template>

    <template #createTime="{ record }">
      {{ formatDate(record.createTime) }}
    </template>

    <template #updateTime="{ record }">
      {{ formatDate(record.updateTime) }}
    </template>

    <template #questionContent="{ record }">
      {{ record.questionContent}}
    </template>
  </a-table>

  <a-modal v-model:visible="visible" @ok="handleOk(currentQuestion)" @cancel="handleCancel">
    <template #title>
      删除题目
    </template>
    <div>您确认要删除题目吗，删除以后可能无法找回</div>
  </a-modal>

    <!-- 抽屉组件 -->
    <a-drawer
        v-model:visible="updateDrawerVisible"
        title="修改题目"
        placement="right"
        width="90%"
    ><!-- 抽屉中的表单组件 -->
      <a-form
          :model="currentQuestion"
          label-align="left"
          auto-label-width
          layout="vertical"
      >
        <a-form-item disabled field="id" label="问题ID">
          <a-input v-model="currentQuestion.id" placeholder="请输入问题ID" />
        </a-form-item>
        <a-form-item disabled field="createTime" label="创建时间">
          <a-input v-model="currentQuestion.createTime" placeholder="请输入创建时间" disabled />
        </a-form-item>
        <a-form-item disabled field="updateTime" label="更新时间" >
          <a-input v-model="currentQuestion.updateTime" placeholder="请输入更新时间" disabled />
        </a-form-item>
        <a-form-item field="questionContent" label="问题内容">
          <!-- 这里假设QuestionContentDTO有title和options等属性，你可以根据实际情况进一步细化渲染 -->
          <a-input type="textarea" v-model="stringQuestionContent" placeholder="请输入问题内容" style="height: 96px" class="textarea-auto-wrap"/>
        </a-form-item>
        <a-form-item field="userId" label="用户ID">
          <a-input v-model="currentQuestion.userId" placeholder="请输入用户ID" disabled />
        </a-form-item>

        <a-form-item field="userName" label="用户名">
          <a-input v-model="currentQuestionUser.userName" placeholder="请输入用户名" disabled />
        </a-form-item>
        <a-form-item field="appId" label="应用ID">
          <a-input v-model="currentQuestion.appId" placeholder="请输入应用ID" disabled />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-button type="primary" @click="doUpdate(currentQuestion)">确认</a-button>
        <a-button style="background: white;color: black" type="primary" @click="()=>{
          updateDrawerVisible = false
        }">取消</a-button>
      </template>
    </a-drawer>

</template>

<script setup lang="ts">


import {ref, watchEffect} from "vue";
import API from "@/api"
import message from "@arco-design/web-vue/es/message";
import {contains} from "@arco-design/web-vue/es/_utils/dom";
import {
  deleteQuestionUsingPost,
  listQuestionVoByPageUsingPost,
  updateQuestionUsingPost
} from "@/api/questionController";
import {options} from "axios";

const dataList = ref<API.QuestionVO[]>([]);
const total = ref<number>(0);

const formSearchParams  = ref<API.QuestionQueryRequest>({});
// 不能被修改
const initSearchParams = {
  current: 1,
  pageSize: 8,
}
const searchParams = ref<API.QuestionQueryRequest>({
  ...initSearchParams,
})

const visible = ref(false);

const currentQuestion = ref<API.QuestionVO>({});
const currentQuestionUser = ref<API.UserVO>({});
const currentQuesionContent = ref<API.QuestionContentDTO>({});
let stringQuestionContent = ref<string>("");
const handleDelete = (record: API.QuestionVO) => {
  currentQuestion.value = record;
  visible.value = true;
};
// 抽屉显示状态
const updateDrawerVisible = ref(false);

// 显示抽屉的方法
const handleUpdate = (record : API.QuestionVO) => {
  currentQuestion.value = record;
  currentQuestionUser.value = record.userVO;
  currentQuesionContent.value =record.questionContent;
  stringQuestionContent = JSON.stringify(record.questionContent);
  updateDrawerVisible.value = true;
};
const handleOk = (record : API.QuestionVO) => {
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
  const res = await listQuestionVoByPageUsingPost(searchParams.value)
  if(res.data.code === 0){
    dataList.value = res.data.data?.records || [];
    total.value = res.data.data?.total;
  }else {
    message.error("获取数据失败"+res.data.message)
  }
}

const doClean = ()=>{
    formSearchParams.value ={
      userId:"",
      appId:"",
      id:""
    }
}
const doSearch = ()=>{
  searchParams.value ={
    ...initSearchParams,
    ...formSearchParams.value,
  };
}

const doDelete = async (record: API.QuestionVO)=>{
  const res = await deleteQuestionUsingPost(record.id)
  if(res.data.code === 0){
    await loadData();
  }else {
    message.error("删除数据失败"+res.data.message)
  }
}
// TODO更新
const doUpdate = async (record: API.QuestionVO)=>{
  message.info("正在更新")
  const res = await updateQuestionUsingPost({
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

// 定义处理questionContent列渲染的函数

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: '应用ID',
    dataIndex: 'appId',
  },
  {
    title: '问题内容',
    dataIndex: 'questionContent',
    slotName: 'questionContent',
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime'
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    slotName: 'updateTime'
  },
  {
    title: '创建用户ID',
    dataIndex: 'userId',
  },
  {
    title: '操作',
    dataIndex: 'optional',
    slotName: 'optional',
  },
];

</script>

<style scoped>
.textarea-auto-wrap {
  white-space: normal;
  word-wrap: break-word;
}
</style>