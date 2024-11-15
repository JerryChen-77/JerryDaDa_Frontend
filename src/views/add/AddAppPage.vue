<template>
  <div id="AddAppPage">
    <h2 style="margin-bottom: 32px" v-if="props.id === `:id`">创建应用</h2>
    <h2 style="margin-bottom: 32px" v-else>更新应用</h2>
    <a-form
        style="max-width: 480px; margin: 0 auto"
        label-align="left"
        auto-label-width
        :model="form"
        @submit="handleSubmit"
    >
      <a-form-item field="appName" label="应用名称">
        <a-input v-model="form.appName" placeholder="请输入应用名称"/>
      </a-form-item>
      <a-form-item field="appDesc" label="应用描述">
        <a-input v-model="form.appDesc" placeholder="请输入应用描述"/>
      </a-form-item>

      <a-form-item field="appIcon" label="应用图标">
        <a-input v-model="form.appIcon" placeholder="请输入应用图标"/>
      </a-form-item>
      <!--      <a-form-item field="appIcon" label="应用图标">-->
      <!--        <PictureUploader-->
      <!--            biz="app_icon"-->
      <!--            :value="form.appIcon"-->
      <!--            :onChange="(url) => (form.appIcon = url)"-->
      <!--        />-->
      <!--      </a-form-item>-->
      <a-form-item field="appType" label="应用类型">
        <a-select v-model="form.appType">
          <a-option v-for="(value ,key) of APP_TYPE_MAP" :value="Number(key)" :label="value"/>
        </a-select>
      </a-form-item>

      <a-form-item field="appType" label="应用类型">
        <a-select v-model="form.scoringStrategy">
          <a-option v-for="(value ,key) of APP_SCORING_STRATEGY" :value="Number(key)" :label="value"/>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 120px">
          提交
        </a-button>
      </a-form-item>
    </a-form>

  </div>
</template>

<script setup lang="ts">
import {reactive, ref, watchEffect} from "vue";
import message from "@arco-design/web-vue/es/message";
import {useRouter} from "vue-router";
import {useLoginUserStore} from "@/store/userStore";
import API from "@/api";
import {addAppUsingPost, editAppUsingPost, getAppVoByIdUsingGet, updateAppUsingPost} from "@/api/appController";


interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});

const oldApp = ref<API.AppVO>();

/**
 * 加载数据
 */
const loadData = async () => {
  if (props.id === ":id") {
    return;
  }
  const res = await getAppVoByIdUsingGet({
    id: props.id as any,
  });
  if (res.data.code === 0 && res.data.data) {
    oldApp.value = res.data.data;
    form.value = res.data.data;
  } else {
    message.error("获取数据失败，" + res.data.message);
  }
};
// 获取旧应用的数据
watchEffect(()=>{
  loadData();
})
/**
 * 表单信息
 */
const form = ref({
  appName: "",
  appDesc: "",
  appIcon: "",
  appType: 0,
  scoringStrategy: 0,
} as API.AppAddRequest);

const APP_TYPE_MAP = {
  0: "测试类",
  1: "评分类",
}

const APP_SCORING_STRATEGY = {
  0: "自定义",
  1: "AI评分",
}
const router = useRouter();

/**
 * 提交表单
 * @param data
 */
const handleSubmit = async () => {
  let res : any;
  if (props.id) {
    res = await editAppUsingPost({
      id:props.id as any,
      ... form.value,
    });
  }else {
    res = await addAppUsingPost(form.value);
  }
  // 登录成功，跳转到主页
  if (res.data.code === 0) {
    message.success("操作成功,即将跳转到应用详情页");
    setTimeout(()=>{
     router.push(`/app/detail/${props.id ?? res.data.data}`)}
        ,2000);
  } else {
    message.error("操作失败" + res.data.message);
  }
};
</script>
