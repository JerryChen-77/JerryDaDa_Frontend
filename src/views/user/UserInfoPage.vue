<template>
  <div class="userInfo">
    <a-space direction="vertical" size="large" fill>

      <a-descriptions title="个人详情" :column="{xs:1, md:3, lg:4}">
        <a-descriptions-item v-for="item of me" :label="item.labelZh" :span="item.span?? 1" v-if=" label !== 'updateTime'">
          <!-- 当label为userAvatar时，展示图片，否则展示普通文本 -->
          <template v-if="item.label === 'userAvatar'">
            <img :src="item.value" alt="用户头像" style="width: 100px; height: 100px; border-radius: 50%;">
          </template>
          <template v-else-if="item.label === 'createTime'" >
            <a-tag>{{ formatDate(item.value) }}</a-tag>
          </template>

          <template v-else>
            <a-tag>{{ item.value }}</a-tag>
          </template>
        </a-descriptions-item>
      </a-descriptions>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import {useLoginUserStore} from "@/store/userStore";
import {ref} from "vue";

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

const transformDataFormat = (originalData: any) => {
  const targetData = Object.keys(originalData).map(key => {

    const item = {
      label: key,
      labelZh: '', // 新增中文label属性
      value: originalData[key]
    };

    // 根据具体需求设置span的值，这里先统一设置为1，你可以根据实际情况修改
    if (key === 'userName') {
      item.span = 3;
    } else {
      item.span = 1;
    }

    // 设置中文label
    if (key === 'id') {
      item.labelZh = '编号';
    } else if (key === 'userName') {
      item.labelZh = '用户名';
    } else if (key === 'userAvatar') {
      item.labelZh = '头像';
    } else if (key === 'userProfile') {
      item.labelZh = '个人简介';
    } else if (key === 'userRole') {
      item.labelZh = '您的权限';
    } else if (key === 'createTime') {
      item.labelZh = '创建时间';
    } else if (key === 'updateTime') {
      item.labelZh = '更新时间';
    }

    return item;
  });

  return targetData.filter(item => item.label!== "updateTime");
}

const loginUserStore = useLoginUserStore();
const me = ref({});
me.value = transformDataFormat(loginUserStore.loginUser);

</script>

<style scoped>

</style>