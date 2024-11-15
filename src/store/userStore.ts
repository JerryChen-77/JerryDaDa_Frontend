import {defineStore} from "pinia";
import {ref} from "vue";
import {getLoginUserUsingGet} from "@/api/userController";
import ACCESS_ENUM from "@/access/accessEnum";
import {Message} from "@arco-design/web-vue";

export const useLoginUserStore = defineStore("loginUser", () => {
    const loginUser = ref<API.LoginUserVO>({
        userName: "未登录",
    });

    async function fetchLoginUser() {
        const res = await getLoginUserUsingGet();
        if (res.data.code === 0 && res.data.data) {
            loginUser.value = res.data.data;
        } else {
            Message.error("获取登录用户信息失败");

        }
    }

    function setLoginUser(newLoginUser: API.LoginUserVO) {
        loginUser.value = newLoginUser;
    }

    return {loginUser, setLoginUser, fetchLoginUser};
});
