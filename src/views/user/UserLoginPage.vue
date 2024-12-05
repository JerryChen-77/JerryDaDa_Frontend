<template>
  <div class="login-page">
    <a-card class="login-card">
      <!-- 登录标题 -->
      <div class="login-header">
        <h1 class="login-title">欢迎登录</h1>
        <p class="login-subtitle">登录后开启你的测评之旅</p>
      </div>

      <!-- 登录表单 -->
      <a-form
          ref="formRef"
          class="login-form"
          :model="form"
          :rules="rules"
          @submit="handleSubmit"
      >
        <!-- 账号输入 -->
        <a-form-item field="userAccount" hide-label>
          <a-input
              v-model="form.userAccount"
              placeholder="请输入账号"
              size="large"
              allow-clear
          >
            <template #prefix>
              <icon-user />
            </template>
          </a-input>
        </a-form-item>

        <!-- 密码输入 -->
        <a-form-item field="userPassword" hide-label>
          <a-input-password
              v-model="form.userPassword"
              placeholder="请输入密码"
              size="large"
              allow-clear
          >
            <template #prefix>
              <icon-lock />
            </template>
          </a-input-password>
          <template #extra>
            <div class="password-tip">密码不少于 8 位</div>
          </template>
        </a-form-item>

        <!-- 记住密码和忘记密码 -->
        <div class="login-options">
          <a-checkbox v-model="rememberMe">记住我</a-checkbox>
          <a-link>忘记密码？</a-link>
        </div>

        <!-- 登录按钮 -->
        <a-form-item hide-label>
          <a-button
              type="primary"
              html-type="submit"
              long
              size="large"
              :loading="loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </a-button>
        </a-form-item>

        <!-- 其他登录方式 -->
        <div class="other-login">
          <div class="divider">
            <span>其他登录方式</span>
          </div>
          <div class="social-login">
            <a-space size="large">
              <a-button shape="circle">
                <template #icon><icon-wechat /></template>
              </a-button>
              <a-button shape="circle">
                <template #icon><icon-github /></template>
              </a-button>
              <a-button shape="circle">
                <template #icon><icon-google /></template>
              </a-button>
            </a-space>
          </div>
        </div>

        <!-- 注册链接 -->
        <div class="register-link">
          还没有账号？<a-link href="/user/register">立即注册</a-link>
        </div>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';
import { useLoginUserStore } from '@/store/userStore';
import { userLoginUsingPost } from '@/api/userController';
import type { FormInstance } from '@arco-design/web-vue';
import {
  IconUser,
  IconLock,
  IconWechat,
  IconGithub,
  IconGoogle,
} from '@arco-design/web-vue/es/icon';

// 表单数据
const form = reactive({
  userAccount: '',
  userPassword: '',
});

// 表单校验规则
const rules = {
  userAccount: [
    { required: true, message: '请输入账号' },
    { minLength: 4, message: '账号长度不能小于 4 位' },
  ],
  userPassword: [
    { required: true, message: '请输入密码' },
    { minLength: 8, message: '密码长度不能小于 8 位' },
  ],
};

const router = useRouter();
const loginUserStore = useLoginUserStore();
const formRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);

// 提交表单
const handleSubmit = async ({values, errors}) => {
  if (errors) {
    return;
  }

  loading.value = true;
  try {
    const res = await userLoginUsingPost(values);
    if (res.data.code === 0) {
      await loginUserStore.fetchLoginUser();
      Message.success('登录成功');
      await router.push({
        path: '/',
        replace: true,
      });
    } else {
      Message.error(res.data.message || '登录失败');
    }
  } catch (error) {
    Message.error('登录失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0 0 8px;
}

.login-subtitle {
  font-size: 16px;
  color: var(--color-text-3);
  margin: 0;
}

.login-form {
  width: 100%;
}

.password-tip {
  font-size: 12px;
  color: var(--color-text-3);
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.other-login {
  margin-top: 32px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 80px);
  height: 1px;
  background: var(--color-neutral-3);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: var(--color-bg-2);
  padding: 0 16px;
  color: var(--color-text-3);
  font-size: 14px;
}

.social-login {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.register-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--color-text-3);
}

/* 响应式调整 */
@media screen and (max-width: 480px) {
  .login-card {
    box-shadow: none;
    background: transparent;
  }

  .login-title {
    font-size: 24px;
  }

  .login-subtitle {
    font-size: 14px;
  }
}
</style>