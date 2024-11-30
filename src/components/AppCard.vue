<template>
  <a-card class="appCard" hoverable @click="doCardClick">
    <template #actions>
      <span class="icon-hover" @click="doThumb" v-if="!hasThumbed"> <IconThumbUp/><span>{{ thumbNum }}</span></span>
      <span class="icon-hover" @click="doThumb" v-if="hasThumbed"> <IconThumbUpFill :style="{color:'#0000FF'}"/><span>{{ thumbNum }}</span></span>
      <span class="icon-hover" @click="doShare"> <IconShareInternal/> </span>
    </template>
    <template #cover>
      <div
          :style="{
          height: '204px',
          overflow: 'hidden',
        }"
      >
        <img
            :style="{ width: '100%', transform: 'translateY(-20px)' }"
            :alt="app.appName"
            :src="app.appIcon"
        />
      </div>
    </template>
    <a-card-meta :title="app.appName" :description="app.appDesc">
      <template #avatar>
        <div
            :style="{ display: 'flex', alignItems: 'center', color: '#1D2129' }"
        >
          <a-avatar :size="24" :style="{ marginRight: '8px' }" :image-url="app.user.userAvatar" />

          <a-typography-text>{{ app.user?.userName ?? "无名"}}</a-typography-text>
        </div>
      </template>
    </a-card-meta>
  </a-card>

  <ShareModal :link="shareLink" title="应用分享" ref="shareModalRef"/>
</template>

<script setup lang="ts">
import {IconShareInternal, IconThumbUp,IconThumbUpFill} from '@arco-design/web-vue/es/icon';
import API from "@/api"
import {defineProps, ref, watchEffect, withDefaults} from "vue";
import {useRouter} from "vue-router";
import ShareModal from "@/components/ShareModal.vue";
import message from "@arco-design/web-vue/es/message";
import {doThumbUsingPost, hasThumbedUsingPost} from "@/api/appThumbController";
import {listAppVoByPageUsingPost} from "@/api/appController";

interface Props {
  app : API.AppVO;
}
const ThumbNum = ref(0);
const props = withDefaults(defineProps<Props>(),{
  app:()=>{
    return {};
  }
})

const router = useRouter();
const doCardClick = () => {
  router.push(`/app/detail/${props.app.id}`);
};

// 分享弹窗引用
const shareModalRef = ref();
// 分享链接
const shareLink = `${window.location.protocol}//${window.location.host}/app/detail/${props.app.id}`;
// 分享
const doShare = (e: Event) => {
  if (shareModalRef.value) {
    shareModalRef.value.openModal();
  }
  e.stopPropagation();
};

const hasThumbed = ref(false);
const thumbNum = ref(0);
const doThumb =async (e: Event) => {
  e.stopPropagation();
  await doThumbUsingPost({
    appId: props.app.id
  })
  message.info("点赞成功");
  await loadThumb();
}

const loadThumb = async () => {
  const res = await hasThumbedUsingPost({
    appId: props.app.id
  })
  if(res.data.code == 0){
    hasThumbed.value = res.data.data.hasThumbed;
    thumbNum.value = res.data.data.appThumbNum;
  }else {
    message.warning(res.data.message)
  }
}

watchEffect(() => {
  loadThumb();
})
</script>
<style scoped>
.appCard {
  cursor: pointer;
}

.icon-hover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.1s;
}

</style>
