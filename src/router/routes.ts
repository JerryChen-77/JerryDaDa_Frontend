import { RouteRecordRaw } from "vue-router";
import HelloWorld from "@/components/HelloWorld.vue";
import UserLayOut from "@/layout/UserLayOut.vue";
import AccessEnum from "@/access/accessEnum";
import NoAuthPage from "@/views/NoAuthPage.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HelloWorld,
  },
  {
    path: "/noAuth",
    name: "无权限",
    component: NoAuthPage,
    meta: {
      access: AccessEnum.NOT_LOGIN,
    },
  },
  {
    path: "/admin",
    name: "管理页面",
    component: HelloWorld,
    meta: {
      access: AccessEnum.ADMIN,
    },
  },
  {
    path: "/hide",
    name: "隐藏页面",
    component: HelloWorld,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: "/user",
    name: "用户",
    component: UserLayOut,
    children: [
      {
        path: "/user/login",
        name: "用户登录",
        component: HelloWorld, //UserLoginView,
      },
      {
        path: "/user/register",
        name: "用户注册",
        component: HelloWorld, //UserRegisterView,
      },
    ],
  },
];
