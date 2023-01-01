<template>
  <CreateContactModal @close="toggleCreateModel" ref="createContactRef" />
  <el-card>
    <template #header>
      <div class="card-header">
        <span>Contacts</span>
        <el-button type="primary" @click="openDialogSend()" class="button" :icon="Upload">Create</el-button>
        <!-- <el-button type="primary" @click="clear()" class="button" :icon="Upload">Clear</el-button> -->
      </div>
    </template>
    <el-table border
      :data="state?.contacts"
      style="width: 100%"
      table-layout="auto">
      <!-- <el-table-column prop="id" sortable label="Id" /> -->
      <el-table-column prop="name" sortable label="Name" />
      <el-table-column prop="address" sortable label="Address">
        <template #default="scope">
          <code>{{ scope.row.address }}</code>
        </template>
      </el-table-column>
      <el-table-column label="Actions">
        <template #default="scope">
          <el-button class="primary-button" type="primary" @click="edit(scope.row)">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
<script lang="ts" setup>
import CreateContactModal from "../components/CreateContactModal.vue";
import { Upload, Edit } from '@element-plus/icons-vue'
import { defineProps, defineEmits, computed, ref } from "vue";
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { Contact, IContactsState, IState } from '../store';
const router = useRouter();
const store = useStore<IState>();
const state = computed<IContactsState>(() => store.getters["contactsState"]);

const createContactRef = ref();
const openDialogSend = () => {
  createContactRef.value.openDialog();
};

const sendHidden = ref(true);
const toggleCreateModel = () => {
  sendHidden.value = !sendHidden.value;
}

const edit = (contact: Contact) => {
  router.push({ name: 'contact-edit', params: { id: contact.id } });
}

const clear = () => {
  store.commit('clearContacts');
}
</script>