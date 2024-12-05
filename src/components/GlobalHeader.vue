<template>
  <div class="global-header">
    <a-row class="header-container" :wrap="false" align="center">
      <!-- Logo 区域 -->
      <a-col flex="auto">
        <a-menu
            class="main-menu"
            :selected-keys="selectedKeys"
            mode="horizontal"
            @menu-item-click="doMenuClick"
        >
          <a-menu-item key="0" class="logo-item" disabled>
            <div class="title-bar">
              <div class="logo-wrapper">
                <img class="logo" src="../assets/ai.png" alt="logo"/>
              </div>
              <div class="title">Jerry DA</div>
            </div>
          </a-menu-item>
          <a-menu-item
              v-for="item in visibleRoutes"
              :key="item.path"
              class="menu-item"
          >
            {{ item.name }}
          </a-menu-item>
        </a-menu>
      </a-col>

      <!-- 管理中心 -->
      <a-col flex="100px" class="action-col">
        <a-dropdown trigger="hover" :popup-max-height="false" @select="doSelectClick">
          <a-button class="action-button" :disabled="loginUserStore.loginUser.userRole!==ACCESS_ENUM.ADMIN">
            <icon-settings class="button-icon" />
            管理中心
            <icon-down class="dropdown-icon" />
          </a-button>
          <template #content>
            <div class="dropdown-menu">
              <a-doption
                  v-for="item in adminRoutes"
                  :key="item.path"
                  :value="item.path"
                  class="dropdown-item"
              >
                {{ item.name }}
              </a-doption>
            </div>
          </template>
        </a-dropdown>
      </a-col>

      <!-- 个人中心 -->
      <a-col flex="100px" class="action-col">
        <a-dropdown trigger="hover" :popup-max-height="false">
          <a-button class="action-button">
            <icon-user class="button-icon" />
            个人中心
            <icon-down class="dropdown-icon" />
          </a-button>
          <template #content>
            <div class="dropdown-menu">
              <a-doption
                  class="dropdown-item"
                  @click="showPersonInfo"
                  :disabled="!loginUserStore.loginUser.id"
              >
                个人资料
              </a-doption>
              <a-doption
                  class="dropdown-item"
                  @click="logout"
                  :disabled="!loginUserStore.loginUser.id"
              >
                退出登录
              </a-doption>
            </div>
          </template>
        </a-dropdown>
      </a-col>

      <!-- 用户信息/登录按钮 -->
      <a-col flex="100px" class="user-col">
        <transition name="fade">
          <div v-if="loginUserStore.loginUser.id" class="user-info">
            <a-avatar :size="32" :image-url="loginUserStore.loginUser.userAvatar" />
            <span class="user-name">{{ loginUserStore.loginUser.userName ?? "无名" }}</span>
          </div>
          <a-button v-else type="primary" class="login-button" href="/user/login">
            登录
          </a-button>
        </transition>
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
.global-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-container {
  padding: 0 24px;
  height: 64px;
}

.main-menu {
  background: transparent;
  border: none;
}

.logo-item {
  padding: 0 !important;
  margin-right: 48px !important;
}

.title-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 36px;
  width: 36px;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.1);
}

.title {
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(45deg, #2994ff, #7045ff);
  -webkit-background-clip: text;
  color: transparent;
}

.menu-item {
  position: relative;
  padding: 0 20px !important;
  font-size: 15px;
  transition: all 0.3s ease;
}

.menu-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #2994ff;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.menu-item:hover::after {
  width: 100%;
}

.action-col {
  margin: 0 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 36px;
  border-radius: 18px;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: #f5f6f7;
  transform: translateY(-2px);
}

.button-icon {
  font-size: 16px;
}

.dropdown-icon {
  font-size: 12px;
  margin-left: 4px;
  transition: transform 0.3s ease;
}

.action-button:hover .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  padding: 4px;
  border-radius: 8px;
  min-width: 120px;
}

.dropdown-item {
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #f5f6f7;
}

.user-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 20px;
  background: #f5f6f7;
}

.user-name {
  font-size: 14px;
  color: #333;
}

.login-button {
  border-radius: 20px;
  padding: 0 24px;
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-container {
    padding: 0 12px;
  }

  .title {
    display: none;
  }

  .action-button {
    padding: 0 12px;
  }

  .user-name {
    display: none;
  }
}
</style>
