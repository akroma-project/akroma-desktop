<template>
  <code>{{ display() }}</code>
</template>


<script lang="ts" setup>
import { Contact, IState } from "../store";
import { ref } from "vue";
import { useStore } from "vuex";

const store = useStore<IState>();
const props = defineProps<{
  address: string | null | undefined,
  contact: Contact | null | undefined,
  me: string,
}>();

const display = ref(() => {
  if (!props.address && !props.contact) {
    return 'Unknown';
  }
  if (props.me === props.address) {
    return 'Me';
  }
  return props.contact?.name || props.address;
});

</script>
<style scoped>
.small {
  color: #8d8d8d;
}
</style>