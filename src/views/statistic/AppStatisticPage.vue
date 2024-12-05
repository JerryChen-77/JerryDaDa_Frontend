<template>
  <div class="statistics-container">
    <!-- 顶部概览卡片 -->
    <div class="overview-cards">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card class="stat-card">
            <template #title>
              <icon-apps /> 总应用数
            </template>
            <div class="stat-value">{{ totalApps }}</div>
            <div class="stat-trend">
              <icon-rise /> 较上周增长 17%
            </div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <template #title>
              <icon-user-group /> 总用户数
            </template>
            <div class="stat-value">{{ totalUsers }}</div>
            <div class="stat-trend">
              <icon-rise /> 较上周增长 33%
            </div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <template #title>
              <icon-interaction /> 总互动数
            </template>
            <div class="stat-value">{{ totalInteractions }}</div>
            <div class="stat-trend">
              <icon-rise /> 较上周增长 20%
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 热门应用统计 -->
    <a-card class="chart-card">
      <template #title>
        <div class="card-title">
          <icon-fire /> 热门应用统计
          <a-tooltip content="展示最受欢迎的8个应用使用情况">
            <icon-question-circle class="help-icon" />
          </a-tooltip>
        </div>
      </template>
      <v-chart
          class="chart"
          :option="appAnswerCountOptions"
          :loading="loading.countChart"
          autoresize
      />
    </a-card>

    <!-- 应用结果统计 -->
    <a-card class="chart-card">
      <template #title>
        <div class="card-title">
          <icon-pie-chart /> 应用结果统计
          <a-tooltip content="展示特定应用的使用结果分布">
            <icon-question-circle class="help-icon" />
          </a-tooltip>
        </div>
      </template>
      <template #extra>
        <a-input-search
            class="search-input"
            placeholder="请输入应用ID"
            button-text="搜索"
            search-button
            allow-clear
            @search="handleSearch"
        />
      </template>
      <div class="empty-tip" v-if="!currentAppId">
        <icon-info-circle />
        <span>请输入应用ID查看详细统计</span>
      </div>
      <v-chart
          v-else
          class="chart"
          :option="appAnswerResultCountOptions"
          :loading="loading.resultChart"
          autoresize
      />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { Message } from '@arco-design/web-vue';
import VChart from "vue-echarts";
import "echarts";
import {
  IconApps,
  IconUserGroup,
  IconInteraction,
  IconFire,
  IconPieChart,
  IconQuestionCircle,
  IconInfoCircle,
  IconRise,
} from '@arco-design/web-vue/es/icon';
import {
  answerResultCountUsingGet,
  top8AnswerCountUsingGet
} from "@/api/statisticController";
import type API from "@/api";

// 数据状态
const appAnswerCountList = ref<API.AppAnswerCountDTO[]>([]);
const appAnswerResultCountList = ref<API.AppAnswerResultDTO[]>([]);
const currentAppId = ref('');
const loading = ref({
  countChart: false,
  resultChart: false,
});

// 模拟数据
const totalApps = ref(7);
const totalUsers = ref(3);
const totalInteractions = ref(20);

// 加载热门应用数据
const loadAppAnswerCountData = async () => {
  loading.value.countChart = true;
  try {
    const res = await top8AnswerCountUsingGet();
    if (res.data.code === 0) {
      appAnswerCountList.value = res.data.data || [];
    } else {
      Message.error(`获取数据失败: ${res.data.message}`);
    }
  } catch (error) {
    Message.error('网络请求失败，请稍后重试');
  } finally {
    loading.value.countChart = false;
  }
};

// 加载应用结果数据
const loadAppAnswerResultData = async (appId: string) => {
  if (!appId) return;

  loading.value.resultChart = true;
  try {
    const res = await answerResultCountUsingGet({
      appId: appId as any
    });
    if (res.data.code === 0) {
      appAnswerResultCountList.value = res.data.data || [];
    } else {
      Message.error(`获取数据失败: ${res.data.message}`);
    }
  } catch (error) {
    Message.error('网络请求失败，请稍后重试');
  } finally {
    loading.value.resultChart = false;
  }
};

// 搜索处理
const handleSearch = (value: string) => {
  currentAppId.value = value;
  loadAppAnswerResultData(value);
};

// 图表配置
const appAnswerCountOptions = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: appAnswerCountList.value.map((item) => item.appId),
    name: '应用ID',
    axisLabel: {
      rotate: 45
    }
  },
  yAxis: {
    type: 'value',
    name: '使用次数'
  },
  series: [{
    data: appAnswerCountList.value.map((item) => item.answerCount),
    type: 'bar',
    barWidth: '60%',
    itemStyle: {
      color: '#1890ff'
    }
  }]
}));

const appAnswerResultCountOptions = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 'left',
    padding: 20
  },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 10,
      borderColor: '#fff',
      borderWidth: 2
    },
    label: {
      show: true,
      position: 'outside'
    },
    emphasis: {
      label: {
        show: true,
        fontSize: '16',
        fontWeight: 'bold'
      }
    },
    data: appAnswerResultCountList.value.map((item) => ({
      value: item.resultCount,
      name: item.resultName
    }))
  }]
}));

// 初始化数据
watchEffect(() => {
  loadAppAnswerCountData();
});
</script>

<style scoped>
.statistics-container {
  padding: 24px;
  background: var(--color-fill-2);
  min-height: 100vh;
}

.overview-cards {
  margin-bottom: 24px;
}

.stat-card {
  height: 160px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: var(--color-text-1);
  margin: 16px 0;
}

.stat-trend {
  color: #52c41a;
  font-size: 14px;
}

.chart-card {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.help-icon {
  color: var(--color-text-3);
  font-size: 14px;
  cursor: help;
}

.search-input {
  width: 320px;
}

.chart {
  height: 400px;
  margin-top: 16px;
}

.empty-tip {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-3);
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .statistics-container {
    padding: 16px;
  }

  .search-input {
    width: 100%;
  }

  .chart {
    height: 300px;
  }
}
</style>