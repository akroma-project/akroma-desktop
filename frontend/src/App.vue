<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <h1>Akroma Desktop</h1>
      </el-header>
      <el-container>
        <el-aside width="105px">
          <AkromaSide />
        </el-aside>
        <el-container>
          <el-main>
            <router-view />
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import { IState } from "./store";
import AkromaSide from "./components/AkromaSide.vue";
import "./assets/main.css";
import { useRouter } from "vue-router";


export default defineComponent({
  name: "App",
  components: {
    AkromaSide,
  },
  setup() {
    const store = useStore<IState>();
    store.commit("init");
    
    const router = useRouter();
    router.push("/account");

    // see what accounts are stored in local stroage
    // store.dispatch('loadAccounts');
    store.subscribe((mutation, state) => {
      localStorage.setItem("store", JSON.stringify(state));
    });

    return {};
  },
});
</script>

<style>
body {
  margin: 0 auto;
  padding: 0;
}

.aside {
  padding: 0px;
}

.header {
  text-align: left;
  /* background-image: url('../public/bg-header.png'); */
  color: #fff;
  background-size: cover;
  min-height: 50px;
}

.header h1 {
  color: #fff;
  font-size: 1.5em;
}

.noselect {
  -webkit-touch-callout: none;
  /* iOS Safari */
  -webkit-user-select: none;
  /* Safari */
  -khtml-user-select: none;
  /* Konqueror HTML */
  -moz-user-select: none;
  /* Old versions of Firefox */
  -ms-user-select: none;
  /* Internet Explorer/Edge */
  user-select: none;
  /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}

.cancel-button {
  margin-left: 0px !important;
}

.primary-button {
  margin-left: 10px !important;
}
</style>
