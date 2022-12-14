import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import AccountCreateView from "../views/AccountCreateView.vue";
import AccountDetailsView from "../views/AccountDetailsView.vue";
import AccountEditView from "../views/AccountEditView.vue";
import AccountListView from "../views/AccountListView.vue";
import ContactsView from "../views/ContactsView.vue";
import ReceiveView from "../views/ReceiveView.vue";
import SettingsView from "../views/SettingsView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: AccountListView,
  },
  {
    path: "/account",
    component: AccountListView,
    name: "account",
  },
  {
    path: "/account/create",
    component: AccountCreateView,
    name: "account-create",
  },
  {
    path: "/account/edit/:address",
    component: AccountEditView,
    name: "account-edit",
  },
  {
    path: "/account/details/:address",
    component: AccountDetailsView,
    name: "account-details",
  },
  {
    path: "/contacts",
    component: ContactsView,
    name: "contacts",
  },
  {
    path: "/settings",
    component: SettingsView,
    name: "settings",
  },
  {
    path: "/receive",
    component: ReceiveView,
    name: "receive",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
