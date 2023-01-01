<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>Edit</span>
      </div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      status-icon
      label-width="120px">
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Balance" prop="address">
        <el-input v-model="form.balance" autocomplete="off" aria-readonly="true" :readonly=true disabled="disabled" />
      </el-form-item>
      <el-form-item label="Address" prop="address">
        <el-input v-model="form.address" autocomplete="off" aria-readonly="true" :readonly=true disabled="disabled" />
      </el-form-item>
      <el-form-item label="File" prop="address">
        <el-input v-model="form.file" autocomplete="off" aria-readonly="true" :readonly=true disabled="disabled" />
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input v-model="form.password" autocomplete="off" type="password" show-password/>
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input
          v-model="form.description"
          :rows="2"
          type="textarea"
          placeholder="Description" />
      </el-form-item>
      <el-form-item class="form-actions">
        <el-col :span="12">
          <el-button @click="cancel()">Cancel</el-button>
          <el-button type="primary" @click="submit(formRef)">Submit</el-button>
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
import { IState } from "../store";
import { useRoute, useRouter } from "vue-router";
import { ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { IAccount } from "../model/account";
import { displayError } from "../utils/feedback.utilities";
const store = useStore<IState>();
const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>()

const onDelete = async () => {
  try {
    const result = await ElMessageBox.confirm(
      "Are you sure you want to delete this account?<ul><li>This action cannot be undone.</li><li>You will lose access to this account.</li><li>You will lose access to any funds in this account.</li><li>The keystore file will be deleted.</li><li>The keystore file cannot be recovered.</li></ul>",
      "Warning",
      {
        confirmButtonText: "Yes - Delete",
        cancelButtonText: "Cancel",
        type: "warning",
        dangerouslyUseHTMLString: true,
      }
    );
    if (result === 'confirm') {
      const account = store.state.accountsState.accounts.find((p) => p.address === form.address);
      store.dispatch("deleteAccount", account);
      router.push(`/account`);
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

const { address } = route.params;
const account = computed<IAccount | undefined>(() => store.state.accountsState.accounts.find((p) => p.address === address));

const form = reactive({
  name: account.value?.name || '',
  description: account.value?.description || '',
  address: account.value?.address || '',
  password: account.value?.password || '',
  file: account.value?.keyStorePath || '',
  balance: account.value?.balance || 0,
});

const rules = reactive<FormRules>({
  name: [
    { required: true, message: 'Please input name', trigger: 'blur' },
    { min: 3, max: 50, message: 'Length should be 3 to 50', trigger: 'blur' },
  ],
  description: [
    { required: false, message: 'Please input activity form', trigger: 'blur' },
  ],
});

const cancel = () => {
  router.push(`/account/details/${address}`);
};

const submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    displayError('form is not defined');
    return
  }
  console.debug(`formEl: ${JSON.stringify(form)}`);
  await formInstance.validate((valid, fields) => {
    if (valid) {
      store.commit('updateAccount', form);
      router.push(`/account/details/${address}`);
    } else {
      displayError('Form is not valid');
    }
  })
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
