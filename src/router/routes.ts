import {RouteRecordRaw} from "vue-router";
import HelloWorld from "@/components/HomePage.vue";
import UserLayOut from "@/layout/UserLayOut.vue";
import ACCESS_ENUM from "@/access/accessEnum";
import AdminUserPage from "@/views/admin/AdminUserPage.vue";
import UserLoginPage from "@/views/user/UserLoginPage.vue";
import UserRegisterPage from "@/views/user/UserRegisterPage.vue";
import AdminAppPage from "@/views/admin/AdminAppPage.vue";
import AdminQuestionsPage from "@/views/admin/AdminQuestionsPage.vue";
import AdminScoringResultPage from "@/views/admin/AdminScoringResultPage.vue";
import AdminUserAnswerPage from "@/views/admin/AdminUserAnswerPage.vue";
import UserInfoPage from "@/views/user/UserInfoPage.vue";
import HomePage from "@/components/HomePage.vue";
import AppDetailPage from "@/views/app/AppDetailPage.vue";
import AddQuestionPage from "@/views/add/AddQuestionPage.vue";
import AddAppPage from "@/views/add/AddAppPage.vue";
import AddScoringResultPage from "@/views/add/AddScoringResultPage.vue";
import MyAnswerPage from "@/views/answer/MyAnswerPage.vue";
import DoAnswerPage from "@/views/answer/DoAnswerPage.vue";
import AnswerResultPage from "@/views/app/AnswerResultPage.vue";
import AppStatisticPage from "@/views/statistic/AppStatisticPage.vue";

export const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "主页",
        component: HomePage,
    },
    {
        path: "/person/info",
        name: "用户详情",
        component: UserInfoPage,
        meta:{
            hideInMenu: true
        }
    },
    {
        path: "/admin/user",
        name: "用户管理",
        component: AdminUserPage,
        meta: {
            access: ACCESS_ENUM.ADMIN,
            hideInMenu: true,
        },
    },
    {
        path: "/admin/app",
        name: "应用管理",
        component: AdminAppPage,
        meta: {
            access: ACCESS_ENUM.ADMIN,
            hideInMenu: true,
        },
    },
    {
        path: "/admin/questions",
        name: "题目管理",
        component: AdminQuestionsPage,
        meta: {
            access: ACCESS_ENUM.ADMIN,
            hideInMenu: true,
        },
    },
    {
        path: "/admin/scoringResult",
        name: "评分结果管理",
        component: AdminScoringResultPage,
        meta: {
            access: ACCESS_ENUM.ADMIN,
            hideInMenu: true,
        },
    },
    {
        path: "/admin/userAnswer",
        name: "回答管理",
        component: AdminUserAnswerPage,
        meta: {
            access: ACCESS_ENUM.ADMIN,
            hideInMenu: true,
        },
    },
    {
        path: "/app_statistic",
        name: "应用统计",
        component: AppStatisticPage,
        meta: {
            access: ACCESS_ENUM.ADMIN,
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
                component: UserLoginPage,
            },
            {
                path: "/user/register",
                name: "用户注册",
                component: UserRegisterPage,
            },
        ],
        meta: {
            hideInMenu: true,
        },
    },
    {
        path: "/app/detail/:id",
        name: "应用详情",
        component: AppDetailPage,
        props: true,
        meta: {
            hideInMenu: true,
        },
    },
    {
        path: "/add/app/:id",
        name: "创建应用",
        component: AddAppPage,
        props: true,
    },
    {
        path: "/add/question/:appId",
        name: "创建题目",
        component: AddQuestionPage,
        props: true,
        meta: {
            hideInMenu: true,
        },
    },
    {
        path: "/add/scoring_result/:appId",
        name: "创建评分",
        component: AddScoringResultPage,
        props: true,
        meta: {
            hideInMenu: true,
        },
    },
    {
        path: "/answer/do/:appId",
        name: "答题",
        component: DoAnswerPage,
        props: true,
        meta: {
            hideInMenu: true,
            access: ACCESS_ENUM.USER,
        },
    },
    {
        path: "/answer/result/:id",
        name: "答题结果",
        component: AnswerResultPage,
        props: true,
        meta: {
            hideInMenu: true,
            access: ACCESS_ENUM.USER,
        },
    },
    {
        path: "/answer/my",
        name: "我的答题",
        component: MyAnswerPage,
        meta: {
            access: ACCESS_ENUM.USER,
        },
    },
];
