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
              <el-dropdown-item @click="importFromAkromaFolder()" type="primary">Scan `.akroma` Dir</el-dropdown-item>
              <el-dropdown-item @click="removeBugs()" type="primary">RemoveBugs</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </template>
    <el-table border
      :data="state?.accounts"
      style="width: 100%"
      table-layout="auto">
      <el-table-column prop="name" sortable label="Name" />
      <el-table-column prop="address" sortable label="Address">
        <template #default="scope">
          <Address v-if="scope.row.address" :address="scope.row.address" :contact=undefined :me="''" />
        </template>
      </el-table-column>
      <el-table-column prop="balance" sortable label="Balance">
        <template #default="scope">
          <span>{{ scope.row.balance }} AKA</span>
        </template>
      </el-table-column>
      <el-table-column label="Actions">
        <template #default="scope">
          <el-button class="primary-button" type="primary" @click="handleCurrentChange(scope.row)">Details</el-button>
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
import Address from "../components/Address.vue";
const store = useStore<IState>();
const router = useRouter();

const state = computed<IAccountsState>(() => store.getters["accountsState"]);

const importFromFileSystem = () => {
  displaySuccess("Importing from file system is not implemented yet");
};


const removeBugs = () => {
  console.debug("call action or mutation to fix database, if required");
  store.commit("chore");
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
