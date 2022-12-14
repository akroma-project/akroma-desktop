<template>
  <el-card class="card-margin" :hidden="props.hidden">
    <template #header>
      <div class="card-header">
        <span>Send</span>
      </div>
    </template>
    <el-form
      ref="formRef"
      :model="form"
      label-width="150px">
      <el-form-item label="Amount" prop="amount">
        <el-input v-model="form.amount" autocomplete="off" />
        <small class="small">{{ amountInWei() }} Wei</small>
      </el-form-item>
      <el-form-item label="To" prop="to">
        <el-autocomplete
          v-model="form.toAddress"
          :fetch-suggestions="toSearch"
          class="el-input"
          placeholder="Please Input"
          @select="handleToSelect">
        </el-autocomplete>
      </el-form-item>

      <el-form-item label="Password" prop="password">
        <el-input v-model="form.password" autocomplete="off" type="password" />
      </el-form-item>
      <el-form-item label="Note" prop="description">
        <el-input
          v-model="form.description"
          :rows="2"
          type="textarea"
          placeholder="Send 10 AKA to by best friend for the coffee" />
      </el-form-item>
      <el-form-item label="Nonce" prop="nonce">
        <el-input v-model="form.nonce" autocomplete="off" type="text" />
      </el-form-item>
      <el-form-item>
        <el-button class="cancel-button" @click="cancel()">Cancel</el-button>
        <el-button class="primary-button" type="primary" @click="submit(formRef)">Submit</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>


<script lang="ts" setup>
import { BigNumber, ethers } from "ethers";
import { computed } from "@vue/reactivity";
import { IAccount } from "../model/account";
import { InternalRuleItem } from "async-validator";
import { IState } from "../store";
import { ITransaction } from "../model/transaction";
import { reactive, ref, defineProps } from "vue";
import { uniqBy } from "lodash";
import { useStore } from "vuex";
import type { FormInstance, FormRules } from 'element-plus'
import { main } from "../../wailsjs/go/models";

const store = useStore<IState>();

const props = defineProps<{ account: IAccount | undefined, hidden: boolean }>();
console.debug(`account: ${JSON.stringify(props.account?.address)}`);

const formRef = ref<FormInstance>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toSearch = (queryString: string, cb: any) => {
  const results = queryString
    ? props?.account?.transactions?.filter((p) => p?.to?.toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
    : props?.account?.transactions;
  const unique = uniqBy(results, 'to');
  const mapped = unique.map((p: ITransaction) => {
    return {
      value: p.to
    }
  })
  cb(mapped)
}

const handleToSelect = (item: ITransaction) => {
  console.log(item)
  console.debug(`sendForm.to: ${JSON.stringify(form)}`);
}


const form = ref({
  amount: 0,
  description: '',
  toAddress: '',
  password: props.account?.password,
  nonce: '',
});

const amountInWei = () => {
  const amount = form.value.amount;
  console.debug(`amount: ${amount}`);
  return BigNumber.from(ethers.utils.parseEther(amount.toString()));
}
console.debug(`amountInWei: ${amountInWei()}`);

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
  form.value.toAddress = '';
  form.value.password = '';
};

const submit = async (formInstance: FormInstance | undefined) => {
  if (!formInstance) {
    console.warn('formEl is undefined');
    return
  }
  const sendRequest: main.SendCommand = {
    path: props?.account?.keyStorePath || '',
    fromAddress: props?.account?.address || '',
    toAddress: form.value.toAddress,
    password: form.value.password || '',
    amount: amountInWei().toString(),
    nonce: form.value.nonce,
  };
  // console.debug(`sendRequest: ${JSON.stringify(sendRequest)}`);
  await store.dispatch('send', sendRequest);
  // cancel();
}
</script>