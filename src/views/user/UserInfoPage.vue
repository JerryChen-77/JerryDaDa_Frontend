<template>
  <div class="user-info-container">
    <a-space direction="vertical" size="large" fill>
      <div class="info-card">
        <!-- 头部区域 -->
        <div class="card-header">
          <h2 class="title">个人详情</h2>
          <a-button type="outline" size="small" @click="handleEdit">
            <template #icon>
              <icon-edit/>
            </template>
            编辑资料
          </a-button>
        </div>

        <!-- 用户基本信息区域 -->
        <div class="user-basic-info">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img
                  :src="getUserAvatar()"
                  alt="用户头像"
                  class="user-avatar"
              >

              <div class="avatar-overlay">
                <icon-camera/>
              </div>
            </div>
            <h3 class="username">{{ getUserName() }}</h3>
            <div class="user-role">
              <a-tag :color="getRoleColor(getUserRole())">
                {{ getUserRole() }}
              </a-tag>
            </div>
          </div>
        </div>

        <!-- 详细信息描述列表 -->
        <a-descriptions
            :column="{ xs: 1, md: 2, lg: 3 }"
            class="info-descriptions"
            :bordered="true"
        >
          <a-descriptions-item
              v-for="item in filteredUserInfo"
              :key="item.label"
              :label="item.labelZh"
              :span="item.span ?? 1"
          >
            <template v-if="item.label === 'userProfile'">
              <div class="profile-content">
                {{ item.value || '这个人很懒，还没有填写个人简介' }}
              </div>
            </template>
            <template v-else-if="item.label === 'createTime'">
              <a-tag color="arcoblue">
                <template #icon>
                  <icon-clock-circle/>
                </template>
                {{ formatDate(item.value) }}
              </a-tag>
            </template>
            <template v-else-if="item.label !== 'userAvatar' && item.label !== 'userName' && item.label !== 'userRole'">
              <a-tag>{{ item.value }}</a-tag>
            </template>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-space>

    <!-- 修改个人信息的弹窗 -->
    <a-modal v-model:visible="editVisible" title="修改个人信息" @cancel="handleEditCancel" @ok="handleEditSave">
      <!-- 新增：头像展示与修改部分 -->
      <a-form-item label="头像">
        <div class="avatar-upload-section">
          <PictureUploader
              biz="user_avatar"
              :value="editUserInfo.userAvatar"
              :onChange="handleAvatarChange"
          />
        </div>
      </a-form-item>
      <a-form :model="editUserInfo">
        <a-form-item label="用户名" :rules="[{ required: true, message: '请填写用户名' }]">
          <a-input v-model="editUserInfo.userName"></a-input>
        </a-form-item>
        <a-form-item label="个人简介" :rules="[{ required: true, message: '请填写个人简介' }]">
          <a-input v-model="editUserInfo.userProfile" type="textarea"></a-input>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {useLoginUserStore} from "@/store/userStore";
import {IconCamera, IconClockCircle, IconEdit} from '@arco-design/web-vue/es/icon';
import {Message} from '@arco-design/web-vue';
import PictureUploader from "@/components/PictureUploader.vue";
import {updateMyUserUsingPost, updateUserUsingPost} from "@/api/userController";

// 格式化时间
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 获取角色对应的颜色
const getRoleColor = (role: string) => {
  const roleColors = {
    'admin': 'red',
    'user': 'green',
    'default': 'blue'
  };
  return roleColors[role.toLowerCase()] || roleColors.default;
};

const transformDataFormat = (originalData: any) => {
  const labelMap = {
    id: {zh: '用户编号', span: 1},
    userName: {zh: '用户名称', span: 1},
    userAvatar: {zh: '头像', span: 1},
    userProfile: {zh: '个人简介', span: 3},
    userRole: {zh: '用户角色', span: 1},
    createTime: {zh: '注册时间', span: 1},
  };

  return Object.keys(originalData)
      .filter(key => key !== 'updateTime')
      .map(key => ({
        label: key,
        labelZh: labelMap[key]?.zh || key,
        span: labelMap[key]?.span || 1,
        value: originalData[key]
      }));
};

const loginUserStore = useLoginUserStore();
const userInfo = ref(transformDataFormat(loginUserStore.loginUser));

// 计算属性：过滤后的用户信息
const filteredUserInfo = computed(() => {
  return userInfo.value.filter(item =>
      !['userAvatar', 'userName', 'userRole','id'].includes(item.label)
  );
});

// 获取用户头像
const getUserAvatar = () => {
  const avatar = userInfo.value.find(item => item.label === 'userAvatar')?.value;
  return avatar || '/default-avatar.png'; // 设置默认头像
};

const getUserId = () => {
  if (userInfo.value) {
    const item = userInfo.value.find(item => item.label === 'id');
    if (item) {
      return item.value;
    }
  }
  return undefined;
}
// 获取用户名
const getUserName = () => {
  return userInfo.value.find(item => item.label === 'userName')?.value || '未设置用户名';
};

// 获取用户角色
const getUserRole = () => {
  return userInfo.value.find(item => item.label === 'userRole')?.value || 'User';
};


// 控制编辑弹窗显示隐藏的变量
const editVisible = ref(false);
// 用于在弹窗中编辑的用户信息副本（避免直接修改原数据）
const editUserInfo = ref({
  userName: getUserName(),
  userProfile: userInfo.value.find(item => item.label === 'userProfile')?.value || '',
  userAvatar: getUserAvatar() // 新增：初始化头像路径
});

// 新增：用于获取文件输入框的引用
const avatarInput = ref<HTMLInputElement | null>(null);

// 编辑处理函数，改为打开编辑弹窗
const handleEdit = () => {
  editVisible.value = true;
  // 初始化编辑弹窗中的数据
  editUserInfo.value.userName = getUserName();
  editUserInfo.value.userProfile = userInfo.value.find(item => item.label === 'userProfile')?.value || '';
  editUserInfo.value.userAvatar = getUserAvatar(); // 初始化头像路径
};

const handleAvatarChange = (url: string) => {
  Message.info("图片上传成功")
  editUserInfo.value.userAvatar = url;
};

// 取消编辑时的处理函数
const handleEditCancel = () => {
  editVisible.value = false;
};

// 保存编辑信息时的处理函数，完善为能处理头像上传及其他信息更新
const handleEditSave = async () => {
  try {
    // 构造要发送到后端的数据对象，包含需要更新的字段
    const params = {
      userName: editUserInfo.value.userName,
      userProfile: editUserInfo.value.userProfile,
      userAvatar: editUserInfo.value.userAvatar
    };
    // 发送POST请求到后端接口（这里假设接口地址是 /api/user/update，实际根据你后端真实接口调整）
    const res = await updateMyUserUsingPost({
      userName:params.userName,
      userAvatar:params.userAvatar,
      userProfile:params.userProfile
    })
    if (res.data.code === 0) {
      const updatedInfo = userInfo.value.map(item => {
        if (item.label === 'userName') {
          return {...item, value: editUserInfo.value.userName };
        } else if (item.label === 'userProfile') {
          return {...item, value: editUserInfo.value.userProfile };
        } else if (item.label === 'userAvatar') {
          return {...item, value: editUserInfo.value.userAvatar };
        }
        return item;
      });
      userInfo.value = updatedInfo;
      editVisible.value = false;
      Message.success('信息修改成功');
      location.reload();
    } else {
      // 如果后端返回的不是成功状态码，提示用户保存失败，并可以根据后端返回的错误信息进行更详细的提示
      Message.error('信息保存失败，请稍后再试');
    }
  } catch (error) {
    // 如果请求过程中出现网络错误等异常情况，提示用户保存出现问题
    Message.error('保存信息时出现异常，请检查网络或联系管理员');
    console.error('保存信息出错:', error);
  }
};

</script>

<style scoped>
.user-info-container {
  padding: 20px;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
}

.user-basic-info {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.avatar-section {
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
  cursor: pointer;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-primary-light-4);
  transition: all 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-overlay :deep(svg) {
  color: white;
  font-size: 24px;
}

.avatar-wrapper:hover {

.avatar-overlay {
  opacity: 1;
}

}

.username {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-1);
}

.user-role {
  margin-bottom: 16px;
}

.info-descriptions {
  margin-top: 24px;
}

.profile-content {
  color: var(--color-text-2);
  font-size: 14px;
  line-height: 1.6;
}

:deep(.arco-descriptions-item) {
  padding: 12px 16px;
}

:deep(.arco-descriptions-item-label) {
  font-weight: 500;
  color: var(--color-text-2);
}

:deep(.arco-tag) {
  margin: 0 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-info-container {
    padding: 12px;
  }

  .info-card {
    padding: 16px;
  }

  .avatar-wrapper {
    width: 100px;
    height: 100px;
  }

  .username {
    font-size: 16px;
  }
}

/* 调整修改个人信息弹窗的宽度等样式 */
.a-modal {
  width: 400px;
}
/* 新增：弹窗内头像展示相关样式 */
.avatar-upload-section {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}
.edit-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-primary-light-4);
}
input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
</style>