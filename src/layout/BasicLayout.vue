<template>
  <div id="basicLayout">
    <a-layout style="height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        1
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a href="https://github.com/JerryChen-77" target="_blank">
          项目名称_BY_JERRY
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import GlobalHeader from "@/components/GlobalHeader.vue";

export default defineComponent({
  components: { GlobalHeader },
});
</script>

<style scoped>
#basicLayout {
  height: 100vh;
}
.header {
  box-shadow: #eee 1px 1px 5px;
  margin-bottom: 16px;
}
#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  padding: 20px;
  margin-bottom: 28px;
}
.footer {
  height: 50px;
  text-align: center;
  background: gray;
  padding: 16px;
  font-size: large;
}
</style>
