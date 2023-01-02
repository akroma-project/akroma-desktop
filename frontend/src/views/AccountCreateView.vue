<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>Create</span>
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
      <el-form-item label="Password" prop="password">
        <el-input v-model="form.password" autocomplete="off" type="password" />
      </el-form-item>
      <el-form-item label="Description" prop="description">
        <el-input
          v-model="form.description"
          :rows="2"
          type="textarea"
          placeholder="Description" />
      </el-form-item>
      <el-form-item>
        <el-button class="cancel-button" @click="cancel()">Cancel</el-button>
        <el-button class="primary-button" type="primary" @click="submit(formRef)">Submit</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { useStore } from "vuex";
import { IState } from "../store";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from 'element-plus'
const store = useStore<IState>();
const router = useRouter();
const formRef = ref<FormInstance>()
const form = reactive({
  name: "",
  description: "",
  password: "",
});

const rules = reactive<FormRules>({
  name: [
    { required: true, message: 'Name is required', trigger: 'blur' },
    { min: 3, max: 20, message: 'Length should be 3 to 20', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 3, max: 50, message: 'Length should be 3 to 50', trigger: 'blur' },
  ],
  description: [
    { required: false, message: 'Please input activity form', trigger: 'blur' },
  ],
})

const cancel = () => {
  console.debug('close');
  router.push("/account");
};

const submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    console.warn('formEl is undefined');
    return
  }
  console.debug(`formEl: ${JSON.stringify(form)}`);
  await formInstance.validate(async (valid, fields) => {
    if (valid) {
      await store.dispatch('createAccount', form);
      await store.dispatch('getAccounts');
      router.push("/account");
    } else {
      console.log('form is not valid:', fields)
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
</style>
