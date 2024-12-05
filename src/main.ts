import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";
import ArcoVue from "@arco-design/web-vue";
import "@arco-design/web-vue/dist/arco.css";
import {createPinia} from "pinia";
import "@/access";

const pinia = createPinia();
createApp(App).use(ArcoVue).use(pinia).use(router).mount("#app");

const debounce = (fn: Function, delay: number) => {
    let timeoutId: number;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
};

window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
        const resizeObserverErr = e;
        resizeObserverErr.stopImmediatePropagation();
    }
});