<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>Settings</span>
      </div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      status-icon
      label-width="130px">
      <el-form-item label="Global Password" prop="pin">
        <el-input v-model="form.pin" autocomplete="off" />
      </el-form-item>
      <el-form-item>
        <el-button class="cancel-button" @click="cancel()">Cancel</el-button>
        <el-button class="primary-button" type="primary" @click="submit(formRef)">Submit</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useStore } from "vuex";
import { ISettingsState, IState } from "../store";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from 'element-plus'
const store = useStore<IState>();
const router = useRouter();
const formRef = ref<FormInstance>()

const settings = computed<ISettingsState>(() => store.state.settingsState);

const form = reactive({
  pin: settings?.value.pin,
});

const rules = reactive<FormRules>({
  pin: [
    { required: false, message: 'A pin ', trigger: 'blur' },
    { min: 3, max: 50, message: 'Length should be 3 to 50', trigger: 'blur' },
  ],
});

const cancel = () => {
  router.push("/");
};

const submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    console.warn('formEl is undefined');
    return
  }
  // console.debug(`saving settings: ${JSON.stringify(form)}`);
  // await formInstance.validate((valid, fields) => {
  //   if (valid) {
  //     store.dispatch('storeSettings', form);
  //   } else {
  //     console.log('form is not valid:', fields)
  //   }
  // })
}
</script>

<style>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
