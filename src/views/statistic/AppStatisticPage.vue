<template>
  <div id="appStatisticPage">
    <h2>热门应用统计</h2>
    <v-chart :option="appAnswerCountOptions" style="height: 300px" />
    <h2>应用结果统计</h2>
    <div class="searchBar">
      <a-input-search
          :style="{ width: '320px' }"
          placeholder="输入 appId"
          button-text="搜索"
          search-button
          @search="(value) => loadAppAnswerResultData(value)"
      />
    </div>
    <div style="margin-bottom: 16px" />

    <v-chart :option="appAnswerResultCountOptions" style="height: 300px" />
  </div>

</template>

<script setup lang="ts">
import API from "@/api";
import message from "@arco-design/web-vue/es/message";
import {computed, ref, watchEffect} from "vue";
import {answerResultCountUsingGet, top8AnswerCountUsingGet} from "@/api/statisticController";
import VChart from "vue-echarts";
import "echarts";

const appAnswerCountList = ref<API.AppAnswerCountDTO[]>([])
const appAnswerResultCountList = ref<API.AppAnswerResultDTO[]>([])



const loadAppAnswerCountData = async () => {
  const res = await top8AnswerCountUsingGet()
  if (res.data.code === 0) {
      appAnswerCountList.value = res.data.data || []
  } else {
    message.error("获取数据失败" + res.data.message)
  }
}

const loadAppAnswerResultData = async (appId:string) => {
  if(!appId){
    return;
  }
  const res = await answerResultCountUsingGet({
    appId: appId as any
  })
  if (res.data.code === 0) {
    appAnswerResultCountList.value = res.data.data || []
  } else {
    message.error("获取数据失败" + res.data.message)
  }
}

const appAnswerCountOptions = computed(() => {
  return {
    xAxis: {
      type: "category",
      data: appAnswerCountList.value.map((item) => item.appId),
      name: "应用 id",
    },
    yAxis: {
      type: "value",
      name: "做题用户数",
    },
    series: [
      {
        data: appAnswerCountList.value.map((item) => item.answerCount),
        type: "bar",
      },
    ],
  };
});

const appAnswerResultCountOptions = computed(() => {
  return {
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        type: "pie",
        radius: "50%",
        data: appAnswerResultCountList.value.map((item) => {
          return {
            value: item.resultCount,
            name: item.resultName,
          };
        }),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
});


watchEffect(() => {
  loadAppAnswerCountData();
  loadAppAnswerResultData("")
})


</script>

<style scoped>

</style>