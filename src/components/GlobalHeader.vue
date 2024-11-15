<template>
  <div class="globalHeader">
    <a-row id="globalHeader" :wrap="false" align="center">
      <a-col flex="auto">
        <a-menu
            :selected-keys="selectedKeys"
            mode="horizontal"
            @menu-item-click="doMenuClick"
        >
          <a-menu-item
              key="0"
              :style="{ padding: 0, marginRight: '38px' }"
              disabled
          >
            <div class="title-bar">
              <img class="logo" src="../assets/ai.png"/>
              <div class="title">Jerry DA</div>
            </div>
          </a-menu-item>
          <a-menu-item v-for="item in visibleRoutes" :key="item.path" >{{
              item.name
            }}
          </a-menu-item>
        </a-menu>
      </a-col>
      <a-col flex="100px" style="margin-left: 36px">
        <a-dropdown  :popup-max-height="false" @select="doSelectClick">
          <a-button :disabled="loginUserStore.loginUser.userRole!==ACCESS_ENUM.ADMIN">管理中心<icon-down/></a-button>
          <template #content>
            <a-doption v-for="item in adminRoutes" :key="item.path" :value="item.path">
              {{ item.name }}
            </a-doption>
          </template>
        </a-dropdown>

      </a-col>
      <a-col flex="100px" style="margin-right: 36px">
        <a-dropdown  :popup-max-height="false">
          <a-button>个人中心<icon-down/></a-button>
          <template #content>
            <a-doption @click="showPersonInfo" :disabled="!loginUserStore.loginUser.id">个人资料</a-doption>
            <a-doption @click="logout" :disabled="!loginUserStore.loginUser.id">退出登录</a-doption>
          </template>
        </a-dropdown>
      </a-col>
      <a-col flex="100px">

        <div v-if="loginUserStore.loginUser.id">
          {{ loginUserStore.loginUser.userName ?? "无名" }}
        </div>
        <div v-else>
          <a-button href="/user/login" type="primary">登录</a-button>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import {routes} from "@/router/routes";
import {useRouter} from "vue-router";
import {computed, ref} from "vue";
import {useLoginUserStore} from "@/store/userStore";
import checkAccess from "@/access/checkAccess";
import {userLogoutUsingPost} from "@/api/userController";
import message from "@arco-design/web-vue/es/message";
import ACCESS_ENUM from "@/access/accessEnum";

const router = useRouter();

const loginUserStore = useLoginUserStore();

const showPersonInfo = () => {
  router.push({
    path: "/person/info",
  });
  message.info("查看个人资料");
}

const doSelectClick = (path: string) => {
  router.push({
    path: path,
  });
}
const logout = async ()=>{
  message.warning("退出登录");
  await userLogoutUsingPost();
  // 跳转到登录页面或其他页面
  window.location.href = '/user/login';
  // 修改历史记录，防止用户通过返回按钮返回
  history.pushState(null, null, '/user/login');
}
// 路由跳转事件
const doMenuClick = (key: string) => {
  router.push({
    path: key,
  });
};

// Tab 栏选中菜单项
const selectedKeys = ref(["/"]);
// 路由跳转后，更新选中的菜单项
router.afterEach((to, from, failure) => {
  selectedKeys.value = [to.path];
});

// 展示在菜单的路由数组
const visibleRoutes = computed(() => {
  return routes.filter((item) => {
    if (item.meta?.hideInMenu) {
      return false;
    }
    // 根据权限过滤菜单
    if (!checkAccess(loginUserStore.loginUser, item.meta?.access as string)) {
      return false;
    }
    return true;
  });
});

// 展示在菜单的管理数组
const adminRoutes = computed(() => {
  return routes.filter((item) => {
    if (item.path.includes("/admin/")) {
      return true;
    }
    return false;
  })
});
</script>
<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  margin-left: 16px;
}

.logo {
  height: 36px;
  width: 36px;
}
</style>
