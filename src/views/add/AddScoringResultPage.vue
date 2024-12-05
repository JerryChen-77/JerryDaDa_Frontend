<template>
  <div id="addScoringResultPage">
    <a-row :gutter="16">
      <!-- 表单部分 -->
      <a-col :span="16">
        <div style="margin-bottom: 32px">
          <h2 v-if="!updateId">创建评分结果</h2>
          <h2 v-else>修改评分结果</h2>
          <a-form
              :model="form"
              :style="{ width: '100%' }"
              label-align="left"
              auto-label-width
              @submit="handleSubmit"
          >
            <a-form-item field="appName" label="应用id" disabled>
              {{ appId }}
            </a-form-item>
            <a-form-item field="appName" label="修改评分id" v-if="updateId">
              {{ updateId }}
            </a-form-item>
            <a-form-item field="resultName" label="结果名称">
              <a-input v-model="form.resultName" placeholder="请输入结果名称" />
            </a-form-item>
            <a-form-item field="resultDesc" label="结果描述">
              <a-input v-model="form.resultDesc" placeholder="请输入结果描述" />
            </a-form-item>
            <a-form-item field="resultPicture" label="结果图片">
              <div class="icon-upload-wrapper">
                <PictureUploader
                    biz="scoring_result_picture"
                    :value="Pic_url"
                    :onChange="handlePicChange"
                />
                <div class="icon-tips">
                  建议尺寸：200x200px，支持 jpg、png 格式
                </div>
              </div>
            </a-form-item>
            <a-form-item field="resultProp" label="结果集">
              <a-input-tag
                  v-model="form.resultProp"
                  :style="{ width: '320px' }"
                  placeholder="输入结果集"
                  allow-clear
              />
            </a-form-item>
            <a-form-item field="resultScoreRange" label="结果得分范围">
              <a-input-number
                  v-model="form.resultScoreRange"
                  placeholder="请输入结果得分范围"
              />
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button type="primary" html-type="submit" style="width: 120px">
                  提交
                </a-button>
                <a-button type="primary" style="width: 120px" @click="doClear">
                  重置
                </a-button>
                <a-button type="primary" style="width: 120px" @click="aiGenerateScoreResult" :disabled="submitting">
                  {{ submitting ? "正在加载" : "AI一下" }}
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>
      </a-col>

      <!-- 展示后端返回数据部分 -->
      <a-col :span="8">
        <h2> 您可以使用AI给您一些思路 </h2>
        <div style="display: flex; flex-wrap: wrap; gap: 16px;">
          <a-empty v-if="aiRecommand.length===0"></a-empty>
          <a-list v-if="aiRecommand.length!==0">
            <a-list-item  v-for="data in aiRecommand">
              <a-list-item-meta
                  :title="data.resultName"
                  :description="data.resultDesc"
              >
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </div>
      </a-col>
    </a-row>

    <ScoringResultTable :appId="appId" :doUpdate="doUpdate" ref="tableRef" />
  </div>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import API from "@/api";
import message from "@arco-design/web-vue/es/message";
import {
  addScoringResultUsingPost,
  aiGenerateScoringResultUsingPost,
  updateScoringResultUsingPost
} from "@/api/scoringResultController";
import { defineProps, withDefaults } from "vue/dist/vue";
import ScoringResultTable from "@/views/add/components/ScoringResultTable.vue";
import {update} from "lodash-es";
import PictureUploader from "@/components/PictureUploader.vue";

const submitting = ref(false);
interface Props {
  appId: string;
}

const props = withDefaults(defineProps<Props>(), {
  appId: () => "",
});

const Pic_url = ref<string>("");
const form = reactive({
  resultDesc: "",
  resultName: "",
  // resultPicture: "",
} as API.ScoringResultAddRequest);


/**
 * 提交
 */

// 声明 ref
const tableRef = ref();


// 用于判断是否更新
let updateId = ref();

/**
 * 修改
 * @param scoringResult
 */
const doUpdate = (scoringResult: API.ScoringResultVO) => {
  updateId.value = scoringResult.id;
  form.resultDesc = scoringResult.resultDesc;
  form.resultName = scoringResult.resultName;
  // form.resultPicture = scoringResult.resultPicture;
  form.resultProp = scoringResult.resultProp;
  form.resultScoreRange = scoringResult.resultScoreRange;
  Pic_url.value =  scoringResult.resultPicture;
};

const handlePicChange = (url: string) => {
  Pic_url.value = url;
};

const doClear = ()=>{
  updateId.value = undefined;
  form.resultDesc = "";
  form.resultName = "";
  // form.resultPicture = "";
  form.resultProp = [];
  form.resultScoreRange = undefined;
  Pic_url.value = "";
}
const aiRecommand = ref([]);
const aiGenerateScoreResult= async ()=>{
  message.info("AI生成中，请稍后...");
  submitting.value = true;
  const res = await aiGenerateScoringResultUsingPost({
    appId: props.appId as any
  });
  if (res.data.code === 0) {
    aiRecommand.value = res.data.data;
  }else {
    message.error("ai生成失败，" + res.data.message);
  }
  submitting.value=false;
}
/**
 * 提交
 */
const handleSubmit = async () => {
  if (!props.appId) {
    return;
  }
  let res;
  // 区分创建和修改
  if (updateId.value) {
    res = await updateScoringResultUsingPost({
      id: updateId.value,
      resultPicture:Pic_url.value,
      ...form,
    });
  } else {
    res = await addScoringResultUsingPost({
      appId: props.appId as any,
      resultPicture:Pic_url.value,
      ...form,
    });
  }
  if (res.data.code === 0) {
    message.success("操作成功");
  } else {
    message.error("操作失败，" + res.data.message);
  }
  if (tableRef.value) {
    updateId.value = undefined;
    await tableRef.value.loadData();
  }
};

</script>

<style scoped>
.icon-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}


.icon-tips {
  color: var(--color-text-3);
  font-size: 12px;
}

</style>