<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>Edit Contact</span>
      </div>
    </template>
    <el-form
      :model="form"
      status-icon
      label-width="120px">
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>

      <el-form-item label="Address" prop="address">
        <el-input v-model="form.address" autocomplete="off" aria-readonly="true" :readonly=true disabled="disabled" />
      </el-form-item>
      <el-form-item label="Owned" prop="owned">
        <el-checkbox v-model="form.owned" />
      </el-form-item>
      <!-- <el-form-item label="Description" prop="description">
        <el-input
          v-model="form.description"
          :rows="2"
          type="textarea"
          placeholder="Description" />
      </el-form-item> -->
      <el-form-item class="form-actions">
        <el-col :span="12">
          <el-button @click="cancel()">Cancel</el-button>
          <el-button type="primary" @click="submit()">Submit</el-button>
        </el-col>
        <el-col class="form-actions-right" :span="12">
          <el-button type="danger" @click="onDelete()">Delete</el-button>
        </el-col>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { useStore } from "vuex";
import { Contact, IState } from "../store";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox } from 'element-plus'
import { displayError, displaySuccess } from "../utils/feedback.utilities";
import { ethers } from "ethers";
const store = useStore<IState>();
const route = useRoute();
const router = useRouter();
const { id } = route.params;
console.debug(`id: ${id}`);
const contact = computed<Contact | undefined>(() => store.state.contactsState.contacts.find((p) => p.id === id));
const form = reactive({
  id: contact.value?.id || 0,
  name: contact.value?.name || '',
  address: contact.value?.address || '',
  owned: contact.value?.owned || false,
  // description: contact.value?.description,
});

const onDelete = async () => {
  try {
    const result = await ElMessageBox.confirm(
      "Are you sure you want to delete this contact?",
      "Warning",
      {
        confirmButtonText: "Yes - Delete",
        cancelButtonText: "Cancel",
        type: "warning",
        dangerouslyUseHTMLString: true,
      }
    );
    if (result === 'confirm') {
      displaySuccess('deleted');
      store.commit("deleteContact", form.id);
      router.push(`/contacts`);
    } else {
      displayError(result);
    }
    console.debug(`result: ${JSON.stringify(result)}`);
  } catch (error) {
    if (error !== 'cancel') {
      throw error;
    }
  }
}

const cancel = () => {
  router.push(`/contacts`);
};

const submit = async () => {
  const isValidAddress = ethers.utils.isAddress(form.address);
  if (!isValidAddress) {
    displayError('Invalid address');
    return;
  }
  store.commit('updateContact', form);
  router.push(`/contacts`);
  displaySuccess('updated contact');
}
</script>

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-actions {
  text-align: left;
  display: flex;
  justify-content: space-between;
}

.form-actions-right {
  text-align: right;
}
</style>
