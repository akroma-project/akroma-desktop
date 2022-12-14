<template>
  <el-card>
    <el-descriptions border title="Account Details">
      <template #extra>
        <div class="card-header">
          <el-button class="button" :icon="Edit" @click="handleEdit(account?.address || '')">Edit</el-button>
          <el-button class="button" type="primary" :icon="Upload" @click="sendPressed">Send</el-button>
        </div>
      </template>
      <el-descriptions-item label="Name">{{ account?.name }}</el-descriptions-item>
      <el-descriptions-item label="Address">
        <code>{{ account?.address }}</code>
      </el-descriptions-item>
      <el-descriptions-item label="Balance">
        {{ account?.balance }} AKA
      </el-descriptions-item>
      <el-descriptions-item span="3" label="Description">
        {{ account?.description }}
      </el-descriptions-item>
      <el-descriptions-item label="Keystore">
        <code>{{ account?.keyStorePath }}</code>
      </el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<script lang="ts" setup>
import { Upload, Edit } from '@element-plus/icons-vue'
import { IAccount } from "../model/account";
import { defineProps, defineEmits } from "vue";
import { useRouter } from 'vue-router';
const router = useRouter();

defineProps<{ account: IAccount | undefined }>();

const handleEdit = (address: string) => {
  router.push(`/account/edit/${address}`);
};

const emit = defineEmits<{ (event: 'sendPressed'): void }>();
const sendPressed = () => {
  console.debug('sendPressed');
  emit('sendPressed');
};
</script>

<style scoped>

</style>
