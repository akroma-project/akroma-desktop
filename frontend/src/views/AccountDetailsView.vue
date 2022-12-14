<template>
  <AccountDetails :account="account" @sendPressed="toggleSendHidden" />
  <SendCard :account="account" :hidden="sendHidden" @close="toggleSendHidden" />
  <el-card class="card-margin">
    <template #header>
      <div class="card-header">
        <span>Transactions</span>
      </div>
    </template>
    <el-table border :data="account?.transactions" style="width: 100%">
      <el-table-column prop="hash" sortable label="Hash" />
      <el-table-column prop="blockNumber" sortable label="Block" />
      <el-table-column prop="to" sortable label="To" />
      <el-table-column prop="from" sortable label="From" />
      <el-table-column prop="value" sortable label="Value">
        <template #default="scope">
          {{ convertToAka(scope.row) }} AKA
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { IState } from "../store";
import { useRoute } from "vue-router";
import { IAccount } from "../model/account";
import AccountDetails from "../components/AccountDetails.vue";
import SendCard from "../components/SendCard.vue";
import { ethers } from "ethers";
import { ITransaction } from "../model/transaction";
const store = useStore<IState>();
const route = useRoute();

const { address } = route.params;

onMounted(() => {
  store.dispatch('getTransactionsForAccount', address);
  store.dispatch('getBalanceForAddress', address);

  setTimeout(() => {
    store.dispatch("storeAccounts");
  }, 3000);
})

const account = computed<IAccount | undefined>(() => store.state.accountsState.accounts.find((p) => p.address === address));
const sendHidden = ref(true);

const toggleSendHidden = () => {
  sendHidden.value = !sendHidden.value;
}

const convertToAka = (transaction: ITransaction): string => {
  if(transaction) {
    return ethers.utils.formatEther(transaction.value);
  }
  return '0';
}
</script>

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-margin {
  margin-top: 20px;
}
</style>
