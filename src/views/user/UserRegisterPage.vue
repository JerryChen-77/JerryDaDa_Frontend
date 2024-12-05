<template>
  <div class="register-page">
    <a-card class="register-card">
      <!-- 注册标题 -->
      <div class="register-header">
        <h1 class="register-title">创建账号</h1>
        <p class="register-subtitle">加入我们，开启你的测评之旅</p>
      </div>

      <!-- 注册表单 -->
      <a-form
          ref="formRef"
          class="register-form"
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
          <template #extra>
            <div class="form-tip">账号长度至少 4 位</div>
          </template>
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
            <div class="form-tip">密码长度至少 8 位</div>
          </template>
        </a-form-item>

        <!-- 确认密码 -->
        <a-form-item field="checkPassword" hide-label>
          <a-input-password
              v-model="form.checkPassword"
              placeholder="请确认密码"
              size="large"
              allow-clear
          >
            <template #prefix>
              <icon-check-circle />
            </template>
          </a-input-password>
        </a-form-item>

        <!-- 用户协议 -->
        <div class="agreement">
          <a-checkbox v-model="agreeTerms">
            我已阅读并同意
            <a-link>用户协议</a-link>
            和
            <a-link>隐私政策</a-link>
          </a-checkbox>
        </div>

        <!-- 注册按钮 -->
        <a-form-item hide-label>
          <a-button
              type="primary"
              html-type="submit"
              long
              size="large"
              :loading="loading"
              :disabled="!agreeTerms"
          >
            {{ loading ? '注册中...' : '立即注册' }}
          </a-button>
        </a-form-item>

        <!-- 登录链接 -->
        <div class="login-link">
          已有账号？<a-link href="/user/login">立即登录</a-link>
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
import { userRegisterUsingPost } from '@/api/userController';
import type { FormInstance } from '@arco-design/web-vue';
import {
  IconUser,
  IconLock,
  IconCheckCircle,
} from '@arco-design/web-vue/es/icon';

// 表单数据
const form = reactive({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
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
  checkPassword: [
    { required: true, message: '请确认密码' },
    {
      validator: (value: string) => {
        if (value !== form.userPassword) {
          return '两次输入的密码不一致';
        }
        return true;
      },
    },
  ],
};

const router = useRouter();
const loginUserStore = useLoginUserStore();
const formRef = ref<FormInstance>();
const loading = ref(false);
const agreeTerms = ref(false);

// 提交表单
const handleSubmit = async ({values, errors}) => {
  if (errors) {
    return;
  }

  if (!agreeTerms.value) {
    Message.warning('请先同意用户协议和隐私政策');
    return;
  }

  loading.value = true;
  try {
    const res = await userRegisterUsingPost(values);
    if (res.data.code === 0) {
      await loginUserStore.fetchLoginUser();
      Message.success('注册成功');
      await router.push({
        path: '/user/login',
        replace: true,
      });
    } else {
      Message.error(res.data.message || '注册失败');
    }
  } catch (error) {
    Message.error('注册失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 0 0 8px;
}

.register-subtitle {
  font-size: 16px;
  color: var(--color-text-3);
  margin: 0;
}

.register-form {
  width: 100%;
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-3);
}

.agreement {
  margin: 24px 0;
  font-size: 14px;
  color: var(--color-text-2);
}

.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--color-text-3);
}

/* 密码强度指示器 */
.password-strength {
  margin-top: 8px;
}

.strength-indicator {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--color-fill-3);
  transition: all 0.3s;
}

.strength-bar.active {
}

/* 响应式调整 */
@media screen and (max-width: 480px) {
  .register-card {
    box-shadow: none;
    background: transparent;
  }

  .register-title {
    font-size: 24px;
  }

  .register-subtitle {
    font-size: 14px;
  }
}
</style>