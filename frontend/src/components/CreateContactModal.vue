<template>
  <el-dialog
    v-model="isShowDialog"
    :close-on-click-modal="false"
    :destroy-on-close="true">
    <el-form
      ref="formRef"
      :model="form"
      label-width="75px">
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" autocomplete="off">
        </el-input>
      </el-form-item>
      <el-form-item label="Address" prop="address">
        <el-input v-model="form.address" autocomplete="off">
        </el-input>
      </el-form-item>
      <el-form-item label="Owned" prop="owned">
        <el-checkbox v-model="form.owned" />
      </el-form-item>
      <el-form-item>
        <el-button class="cancel-button" @click="cancel()">Cancel</el-button>
        <el-button class="primary-button" type="primary" @click="submit(formRef)">Create</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

</template>


<script lang="ts" setup>
import { Contact, IState } from "../store";
import { ref } from "vue";
import { useStore } from "vuex";
import type { FormInstance } from 'element-plus'
import { displayError } from "../utils/feedback.utilities";
import { ethers } from "ethers";

const store = useStore<IState>();

const isShowDialog = ref(false);
const openDialog = () => {
  isShowDialog.value = true;
};

defineExpose({
  openDialog,
});

const formRef = ref<FormInstance>();
const form = ref(new Contact());

const cancel = () => {
  isShowDialog.value = false;
};

const submit = async (formInstance: FormInstance | undefined) => {
  const isValidAddress = ethers.utils.isAddress(form.value.address);
  if(!isValidAddress) {
    displayError('Invalid address');
    return;
  }
  const created = await store.dispatch("createContact", form.value);
  if (created !== true) {
    displayError(created as unknown as string);
  } else {
    form.value = new Contact();
    isShowDialog.value = false;
  }
}
</script>
<style scoped>
.small {
  color: #8d8d8d;
}
</style>