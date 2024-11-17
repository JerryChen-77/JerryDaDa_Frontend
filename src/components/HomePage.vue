<template>
  <div id="home">
    <div class="searchBar">
      <a-input-search :style="{width:'320px'}" placeholder="快速发现你的应用" search-button size="large"/>
    </div>

    <div class="list" style="margin-top: 36px;">
      <a-list
          :grid-props="{ gutter: [20, 20], sm: 24, md: 12, lg: 8, xl: 6 }"
          class="list-demo-action-layout"
          :bordered="false"
          :data="dataList"
          :pagination-props="{
            pageSize:searchParams.pageSize,
            current:searchParams.current,
            total:total,
          }"
          @page-change="onPageChange"
      >
        <template #item="{ item }">
         <AppCard :app="item"/>
        </template>
      </a-list>

    </div>

  </div>


</template>

<script setup lang="ts">

import AppCard from "@/components/AppCard.vue";
import API from "@/api";
import {
  deleteAppUsingPost,
  doAppReviewUsingPost,
  listAppVoByPageUsingPost,
  updateAppUsingPost
} from "@/api/appController";
import message from "@arco-design/web-vue/es/message";
import {ref, watchEffect} from "vue";
import ShareModal from "@/components/ShareModal.vue";

const dataList = ref<API.AppVO[]>([]);
const total = ref<number>(0);


// 不能被修改
const initSearchParams = {
  current: 1,
  pageSize: 8,

}
const searchParams = ref<API.AppQueryRequest>({
  ...initSearchParams,
})

const loadData = async () => {
  const params = {
    reviewStatus: 1,
    ...searchParams.value,
  }
  const res = await listAppVoByPageUsingPost(params)
  if (res.data.code === 0) {
    dataList.value = res.data.data?.records || [];
    total.value = res.data.data?.total;
  } else {
    message.error("获取数据失败" + res.data.message)
  }
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

const paginationProps = ref({
  defaultPageSize: 3,
  total: dataList.length
})
</script>

<style scoped>
.list-demo-action-layout .image-area {
  width: 183px;
  height: 119px;
  border-radius: 2px;
  overflow: hidden;
}

.list-demo-action-layout .list-demo-item {
  padding: 20px 0;
  border-bottom: 1px solid var(--color-fill-3);
}

.list-demo-action-layout .image-area img {
  width: 100%;
}

.list-demo-action-layout .arco-list-item-action .arco-icon {
  margin: 0 4px;
}
.searchBar{
  text-align: center;
}
</style>