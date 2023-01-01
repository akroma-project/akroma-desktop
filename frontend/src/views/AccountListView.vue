<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>Accounts</span>
        <el-dropdown>
          <el-button type="primary">
            Actions
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goToCreateAccount()">Create Account</el-dropdown-item>
              <el-dropdown-item @click="importFromFileSystem()">Import Keystore File</el-dropdown-item>
              <el-dropdown-item @click="importFromAkromaFolder()" type="primary">Scan</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
import { displaySuccess } from "../utils/feedback.utilities";
const store = useStore<IState>();
const router = useRouter();

const state = computed<IAccountsState>(() => store.getters["accountsState"]);

const importFromFileSystem = () => {
  displaySuccess("Importing from file system is not implemented yet");
};

const importFromAkromaFolder = () => {
  store.dispatch("getAccounts");
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
