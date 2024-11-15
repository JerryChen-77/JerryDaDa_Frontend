<template>

  <a-form
      style="margin-bottom: 20px"
      label-align="left"
      auto-label-width
      :model="searchParams"
      layout="inline"
      @submit="doSearch"
  >
    <a-form-item field="userName" label="用户名">
      <a-input v-model="formSearchParams.userName" placeholder="请输入用户名" />
    </a-form-item>
    <a-form-item field="userProfile" label="用户简介">
      <a-input v-model="formSearchParams.userProfile" placeholder="请输入用户简介" />
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
  </a-table>

  <a-modal v-model:visible="visible" @ok="handleOk(currentUser)" @cancel="handleCancel">
    <template #title>
      删除用户
    </template>
    <div>您确认要删除用户吗，删除以后可能无法找回</div>
  </a-modal>



    <!-- 抽屉组件 -->
    <a-drawer
        v-model:visible="updateDrawerVisible"
        title="修改用户"
        placement="right"
        width="90%"
    ><!-- 抽屉中的表单组件 -->
      <a-form
          :model="currentUser"
          label-align="left"
          auto-label-width
          layout="vertical"
      >
        <a-form-item disabled field="id" label="ID">
          <a-input v-model="currentUser.id" placeholder="请输入ID" />
        </a-form-item>
        <a-form-item disabled field="userAccount" label="用户账号">
          <a-input v-model="currentUser.userAccount" placeholder="请输入用户账号" />
        </a-form-item>
        <a-form-item field="userName" label="用户名">
          <a-input v-model="currentUser.userName" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item field="userAvatar" label="用户头像">
          <a-input v-model="currentUser.userAvatar" placeholder="请输入用户头像" />
        </a-form-item>
        <a-form-item field="userProfile" label="用户简介" >
          <a-input type="text" v-model="currentUser.userProfile" placeholder="请输入用户简介" style="height: 96px"/>
        </a-form-item>
        <a-form-item field="userRole" label="用户角色">
          <a-select v-model="currentUser.userRole" placeholder="请选择用户角色">
            <a-option value="admin">admin</a-option>
            <a-option value="user">user</a-option>
          </a-select>
        </a-form-item>
        <a-form-item disabled field="createTime" label="创建时间">
          <a-input v-model="currentUser.createTime" placeholder="请输入创建时间" />
        </a-form-item>
        <a-form-item disabled field="updateTime" label="更新时间">
          <a-input v-model="currentUser.updateTime" placeholder="请输入更新时间" />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-button type="primary" @click="doUpdate(currentUser)">确认</a-button>
        <a-button style="background: white;color: black" type="primary" @click="()=>{
          updateDrawerVisible = false
        }">取消</a-button>
      </template>
    </a-drawer>

</template>

<script setup lang="ts">
// 表单数据
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

const dataList = ref<API.User[]>([]);
const total = ref<number>(0);

const formSearchParams  = ref<API.UserQueryRequest>({});
// 不能被修改
const initSearchParams = {
  current: 1,
  pageSize: 8,
}
const searchParams = ref<API.UserQueryRequest>({
  ...initSearchParams,
})

const visible = ref(false);

const currentUser = ref<API.User>({});
const handleDelete = (record: API.User) => {
  currentUser.value = record;
  visible.value = true;
};
// 抽屉显示状态
const updateDrawerVisible = ref(false);

// 显示抽屉的方法
const handleUpdate = (record : API.User) => {
  currentUser.value = record;
  updateDrawerVisible.value = true;
};
const handleOk = (record : API.User) => {
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
  const res = await listUserByPageUsingPost(searchParams.value)
  if(res.data.code === 0){
    dataList.value = res.data.data?.records || [];
    total.value = res.data.data?.total;
  }else {
    message.error("获取数据失败"+res.data.message)
  }
}

const doClean = ()=>{
    formSearchParams.value ={
      userName:"",
      userProfile:""
    }
}
const doSearch = ()=>{
  searchParams.value ={
    ...initSearchParams,
    ...formSearchParams.value,
  };
}

const doDelete = async (record: API.User)=>{
  const res = await deleteUserUsingPost(record.id)
  if(res.data.code === 0){
    await loadData();
  }else {
    message.error("删除数据失败"+res.data.message)
  }
}
// TODO更新
const doUpdate = async (record: API.User)=>{
  message.info("正在更新")
  const res = await updateUserUsingPost({
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

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '用户账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户头像',
    dataIndex: 'userAvatar',
    slotName: 'userAvatar',
  },
  {
    title: '用户简介',
    dataIndex: 'userProfile',
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    slotName: 'createTime',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    slotName: 'updateTime',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '操作',
    dataIndex: 'optional',
    slotName: 'optional',
  },
];

</script>