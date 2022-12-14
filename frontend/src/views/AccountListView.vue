<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>Accounts</span>
        <span>
          <el-button class="button" v-on:click="goToCreateAccount()" text>Create</el-button>
          <el-button class="button" v-on:click="importFromFileSystem()" text>Import</el-button>
          <el-button class="button" v-on:click="importFromAkromaFolder()" text>Import (.akroma)</el-button>
          <el-button class="button" v-on:click="storeAccounts()" text>Save All</el-button>
        </span>
      </div>
    </template>
    <el-table border
      :data="state?.accounts"
      style="width: 100%"
      @current-change="handleCurrentChange"
      table-layout="auto">
      <el-table-column prop="name" sortable label="Name" />
      <el-table-column prop="address" sortable label="Address">
        <template #default="scope">
          <code>{{ scope.row.address }}</code>
        </template>
      </el-table-column>
      <el-table-column prop="balance" sortable label="Balance">
        <template #default="scope">
          <span>{{ scope.row.balance }} AKA</span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { IAccountsState, IState } from "../store";
import { IAccount } from "../model/account";
import { useRouter } from "vue-router";
const store = useStore<IState>();
const router = useRouter();

const state = computed<IAccountsState>(() => store.getters["accountsState"]);

const importFromFileSystem = () => {
  console.warn("this feature is not implemented yet");
};

const importFromAkromaFolder = () => {
  store.dispatch("getAccounts");
};

const storeAccounts = () => {
  console.debug(`putting accounts in local storage`);
  store.dispatch("storeAccounts");
};

const goToCreateAccount = () => {
  router.push("/account/create");
};

const handleCurrentChange = (row: IAccount) => {
  router.push(`/account/details/${row.address}`);
}

</script>

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}
</style>
