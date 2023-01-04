<template>
  <el-dialog
    v-model="isShowDialog"
    :close-on-click-modal="false"
    :destroy-on-close="true">
    <el-form
      ref="formRef"
      :model="form"
      :disabled="isDisabled"
      label-width="150px">
      <el-form-item label="Amount" prop="amount">
        <el-input v-model="form.amount" autocomplete="off">
        </el-input>
        <small class="small">{{ amountInWei() }} Wei</small>
      </el-form-item>
      <el-form-item label="To" prop="to">
        <el-autocomplete
          v-model="form.toDisplay"
          :fetch-suggestions="toSearch"
          class="el-input"
          placeholder="Select"
          value-key="display"
          clearable
          @change="handleToCleared"
          @select="handleToSelect">
          <template #append>
            <el-button :icon="User" />
          </template>
        </el-autocomplete>
      </el-form-item>

      <el-form-item label="Password" prop="password">
        <el-input show-password v-model="form.password" autocomplete="off" type="password" />
      </el-form-item>
      <el-form-item label="Note" prop="description">
        <el-input
          v-model="form.description"
          :rows="2"
          type="textarea"
          placeholder="Send 10 AKA to my best friend for the coffee" />
      </el-form-item>

      <!-- <el-form-item label="Nonce" prop="nonce">
        <el-input v-model="form.nonce" autocomplete="off" type="text" />
      </el-form-item> -->
      <el-form-item>
        <el-button class="cancel-button" @click="cancel()">Cancel</el-button>
        <el-button class="primary-button" type="primary" :loading="isDisabled" @click="submit(formRef)">Submit</el-button>
        <!-- <div>advanced options</div> -->
      </el-form-item>
    </el-form>
  </el-dialog>

</template>


<script lang="ts" setup>
import { BigNumber, ethers } from "ethers";
import { IAccount } from "../model/account";
import { InternalRuleItem } from "async-validator";
import { Contact, IState } from "../store";
import { main } from "../../wailsjs/go/models";
import { reactive, ref, defineProps } from "vue";
import { User } from '@element-plus/icons-vue'
import { useStore } from "vuex";
import type { FormInstance, FormRules } from 'element-plus'
import { displayError, displaySuccess } from "../utils/feedback.utilities";

const store = useStore<IState>();

const props = defineProps<{
  account: IAccount | undefined,
  title: string,
}>();


const isShowDialog = ref(false);
const openDialog = () => {
  isShowDialog.value = true;
};
const closeDialog = (): void => {
  isShowDialog.value = false;
}

defineExpose({
  openDialog,
});

const formRef = ref<FormInstance>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toSearch = (queryString: string, cb: any) => {
  return queryString
    ? store.state.contactsState.contacts.filter((p) => p?.name?.toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
    : store.state.contactsState.contacts;
}

const handleToSelect = (item: Contact) => {
  form.value.toContact = item;
}

const handleToCleared = () => {
  form.value.toContact = {} as Contact;
  form.value.toDisplay = '';
}

const form = ref({
  amount: 0,
  description: '',
  toDisplay: '',
  toContact: {} as Contact,
  password: props.account?.password,
  nonce: '',
});

const isDisabled = ref(false);

const amountInWei = () => {
  const amount = form.value.amount;
  console.debug(`amount: ${amount}`);
  return BigNumber.from(ethers.utils.parseEther(amount.toString()));
}

const validateAmount = (rule: InternalRuleItem, value: number, callback: (error: string | Error | undefined) => void) => {
  const balance = props?.account?.balance || 0;
  const bigBalance = BigNumber.from(ethers.utils.parseEther(balance.toString()));
  const bigValue = BigNumber.from(ethers.utils.parseEther(value.toString()));
  console.debug(`bigBalance: ${bigBalance}, bigValue: ${bigValue}`);

  if (value === 0) {
    callback(new Error('Please enter an amount greater than 0'));
  } else if (bigBalance.lt(bigValue)) {
    callback(new Error("Amount is greater than balance"));
  } else {
    callback(undefined)
  }
}

const validateTo = (rule: InternalRuleItem, address: string, callback: (error: string | Error | undefined) => void) => {
  if (!address) {
    callback(new Error('Please enter a valid address'));
  } else if (!ethers.utils.isAddress(address)) {
    callback(new Error(`${address} is not a valid address`));
  } else {
    callback(undefined)
  }
}

const sendRules = reactive<FormRules>({
  password: [
    { required: true, message: 'Password is required to send AKA', trigger: 'blur' },
  ],
  description: [
    { required: false, message: 'Please input activity form', trigger: 'blur' },
    { min: 0, max: 500, message: 'Note can not be longer than 500 chars', trigger: 'blur' },
  ],
  amount: [
    { required: true, message: 'Please enter an amount', trigger: 'blur' },
    { validator: validateAmount, trigger: 'blur' }
  ],
  to: [
    { required: true, message: 'Please enter an address', trigger: 'blur' },
    { validator: validateTo, trigger: 'blur' }
  ],
});

const cancel = () => {
  form.value.amount = 0;
  form.value.description = '';
  form.value.toDisplay = '';
  form.value.toContact = {} as Contact;
  form.value.password = '';
  form.value.nonce = '';
  closeDialog();
};

const submit = async (formInstance: FormInstance | undefined) => {
  isDisabled.value = true;
  if (!formInstance) {
    console.warn('formEl is undefined');
    return
  }
  const toAddress = getToAddress(form);
  const sendRequest: main.SendCommand = {
    path: props?.account?.keyStorePath || 'missing-path',
    fromAddress: props?.account?.address || 'missing-from',
    toAddress: toAddress,
    password: form.value.password || 'missing-password',
    amount: amountInWei().toString(),
    nonce: form.value.nonce,
  };
  // console.debug(`sendRequest: ${JSON.stringify(sendRequest)}`);
  const result = await store.dispatch('send', sendRequest);
  console.debug(`result: ${JSON.stringify(result)}`);
  if (result?.success) {
    displaySuccess('Transaction submitted');
    closeDialog();
  } else {
    displayError(result.message);
  }
  isDisabled.value = true;
}

const getToAddress = (form: any) => {
  if (form.value.toContact?.address) {
    return form.value.toContact.address;
  }
  return form.value.toDisplay;
}

</script>
<style scoped>
.small {
  color: #8d8d8d;
}
</style>