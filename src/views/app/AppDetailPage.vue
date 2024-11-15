<template>
  <div class="appDetailPage">
    <a-card>
      <a-row class="grid-demo" style="margin-bottom: 16px;">
        <a-col flex="auto" class="content-wrapper">
          <h2>{{ data?.appName }}</h2>
          <p>{{ data?.appDesc }}</p>
          <p>应用类型：{{ AppTypeMap[data?.appType] }}</p>
          <p>评分策略：{{ ScoringStrategyMap[data?.scoringStrategy] }}</p>
          <p>
            作者：
          <div
              :style="{ display: 'flex', alignItems: 'center', color: '#1D2129' }"
          >
            <a-avatar :size="24" :style="{ marginRight: '8px' }" :image-url="data?.user?.userAvatar"/>
            <a-typography-text>{{ data?.user?.userName ?? "无名" }}</a-typography-text>
          </div>
          </p>
          <p>创建时间： {{ dayjs(data?.createTime).format("YYYY-MM-DD HH:mm:ss") }}</p>
            <a-space size="medium">
              <a-button type="primary" :href="`/answer/do/${props.id}`">
                开始答题
              </a-button>
              <a-button>分享应用</a-button>
              <a-button v-if="isMy" :href="`/add/question/${id}`">
                设置题目
              </a-button>
              <a-button v-if="isMy" :href="`/add/scoring_result/${id}`">
                设置评分
              </a-button>
              <a-button v-if="isMy" :href="`/add/app/${id}`">
                修改应用
              </a-button>
            </a-space>

        </a-col>
        <a-col flex="320px">
          <a-image width="100%" :src="data?.appIcon"/>
        </a-col>
      </a-row>
    </a-card>
  </div>

</template>

<script setup lang="ts">
import {getAppVoByIdUsingGet} from "@/api/appController";
import message from "@arco-design/web-vue/es/message";
import {computed, ref, watchEffect} from "vue";
import dayjs from "dayjs";
import {useLoginUserStore} from "@/store/userStore";

const data = ref<API.AppVO>();

const AppTypeMap = {
  0:"测评类",
  1:"得分类"
}

const ScoringStrategyMap = {
  0:"自定义得分",
  1:"AI得分"
}
interface Props {
  id: string;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});

/**
 * 加载数据
 */
const loadData = async () => {
  if (!props.id) {
    return;
  }
  const res = await getAppVoByIdUsingGet({
    id: props.id as any,
  });
  if (res.data.code === 0 && res.data.data) {
    data.value = res.data.data;
  } else {
    message.error("获取数据失败，" + res.data.message);
  }
};

/**
 * 监听变量，改变时触发数据的重新加载
 */
watchEffect(() => {
  loadData();
});
const loginUserStore = useLoginUserStore();
const loginUserId = loginUserStore.loginUser.id;
const isMy = computed(() => {
  return loginUserId && loginUserId === data.value?.user?.id;
});

</script>

<style scoped>
#appDetailPage .content-wrapper > * {
  margin-bottom: 24px;
}
</style>