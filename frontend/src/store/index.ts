import { createStore } from "vuex";
import { ethers } from "ethers";
import { IAccount } from "../model/account";
import { ITransaction } from "../model/transaction";
import axios from "axios";
import _ from "lodash";
import uniqid from 'uniqid';
import { CreateAccount, DeleteAccount, GetAccounts, Send } from '../../wailsjs/go/main/App'
import { main } from '../../wailsjs/go/models'
import { displayError, displaySuccess } from "../utils/feedback.utilities";

export interface IState {
  accountsState: IAccountsState;
  settingsState: ISettingsState;
  contactsState: IContactsState;
  // addresses is not currently used, set is not init when deserializing from local storage
  addresses: Set<string>;

}

export interface IContactsState {
  contacts: Contact[];
}

export class Contact {
  id = uniqid();
  name = "";
  address = "";
  transactions = [] as ITransaction[];
  display = '';
  owned = false;
}

export interface IAccountsState {
  accounts: IAccount[];
}

export interface ISettingsState {
  pin: string;
  apiBaseUrl: string;
  nodeUrl: string;
}

export default createStore<IState>({
  state: {
    accountsState: {
      accounts: [],
    },
    settingsState: {
      pin: "",
      apiBaseUrl: 'https://api.akroma.org',
      nodeUrl: 'https://boot2.akroma.org',
    },
    contactsState: {
      contacts: []
    },
    addresses: new Set<string>(),
  },
  getters: {
    accountsState: (state) => state.accountsState,
    contactsState: (state) => state.contactsState,
  },
  mutations: {
    init(state) {
      const store = localStorage.getItem("store");
      if (store !== null) {
        this.replaceState(Object.assign(state, JSON.parse(store)));
      }
    },
    chore: (state) => {
      // remove contact with name stex
      state.contactsState.contacts = state.contactsState.contacts.filter(x => x.name !== 'stex');
    },
    updateContact: (state, payload: Contact) => {
      if (payload) {
        const existing = state.contactsState.contacts.find(x => x.id === payload.id);
        if (existing) {
          existing.name = payload.name;
          existing.address = payload.address;
          existing.owned = payload.owned;
          if(existing.owned == false) {
            existing.display = `EXTERNAL: ${existing.name} (${existing.address})`;
          } else {
            existing.display = `${existing.name} (${existing.address})`;
          }
          
          displaySuccess('Contact updated');
        }
      }
    },
    deleteContact: (state, payload: string) => {
      state.contactsState.contacts = state.contactsState.contacts.filter(x => x.id !== payload);
      displaySuccess('Contact removed from contacts list');
    },
    clearContacts: (state) => {
      state.contactsState.contacts = [];
    },
    addContact: (state, payload: Contact) => {
      if (payload) {
        if(payload.owned == false) {
          payload.display = `EXTERNAL: ${payload.name} (${payload.address})`;
        } else {
          payload.display = `${payload.name} (${payload.address})`;
        }
        state.contactsState.contacts = state.contactsState.contacts.concat(payload);
        displaySuccess('Contact added to contacts list');
      }
    },
    buildAddressIndex: (state) => {
      state.addresses = new Set<string>();
      state.accountsState.accounts.forEach(account => {
        state.addresses.add(account.address);
      });
    },
    mergeExistingKeyStores: (state, payload: main.AccountResult[]) => {
      // get address from keystore
      // then merge with existing accounts
      if (payload?.length > 0) {
        const existing = state.accountsState.accounts;
        payload.forEach(element => {
          const account = element;
          if (existing.find(x => x.address === account.address)) {
            const match = existing.find(x => x.address === account.address);
            if (match) {
              match.address = account.address;
              match.keyStorePath = element.path;
            }
          } else {
            existing.push({
              name: account.name,
              description: "",
              password: "unknown",
              address: account.address,
              keyStorePath: element.path,
              transactions: [],
            });
          }
        });
        state.accountsState = {
          accounts: existing,
        };
      }
    },
    accountCreated: (state, payload: main.AccountResult) => {
      // accounts are loaded from local storage.
      if (payload) {
        const existing = state.accountsState.accounts.find(x => x.name === payload.name);
        if (existing) {
          existing.address = payload.address;
          existing.keyStorePath = payload.path;
        }
      }
    },
    removeAccount: (state, payload: IAccount) => {
      // accounts are loaded from local storage.
      if (payload) {
        const existing = state.accountsState.accounts.find(x => x.address === payload.address);
        if (existing) {
          state.accountsState.accounts = state.accountsState.accounts.filter(x => x.address !== payload.address);
          displaySuccess('Account removed from accounts list');
        }
      }
    },
    sentFunds: (state, payload: any) => {
      if (payload) {
        console.debug(`sendFunds: ${payload}`);
      }
    },
    setAccounts: (state, payload: IAccount[]) => {
      // accounts are loaded from local storage.
      if (payload?.length > 0) {
        state.accountsState = {
          accounts: payload
        };
      }
    },
    setSettings: (state, payload: ISettingsState) => {
      // accounts are loaded from local storage.
      console.debug("setSettings", payload);
      if (payload) {
        state.settingsState = payload;
      }
    },
    setTransactionsForAccount: (state, payload: { address: string, transactions: ITransaction[] }) => {
      const existing = state.accountsState.accounts.find(x => x.address === payload.address);
      if (existing) {
        existing.transactions = payload.transactions;
        // if (state.addresses) {
        //   console.debug(`addresses: ${typeof(state.addresses)}`);
        //   console.debug(`addresses: ${JSON.stringify(state.addresses)}`);
        //   //  state.addresses.add(payload.transactions.map(x => x.to).join());
        // }
      }
    },
    setBalanceForAccount: (state, payload: { address: string, balance: number }) => {
      // accounts are loaded from local storage.
      if (payload) {
        const existing = state.accountsState.accounts.find(x => x.address === payload.address);
        if (existing) {
          existing.balance = payload.balance;
        }
      }
    },
    addAccount: (state, payload: IAccount) => {
      // accounts are loaded from local storage.
      if (payload) {
        state.accountsState = {
          accounts: state.accountsState.accounts.concat(payload)
        };
      }
    },
    updateAccount: (state, payload: IAccount) => {
      if (payload) {
        const existing = state.accountsState.accounts.find(x => x.address === payload.address);
        if (existing) {
          existing.name = payload.name;
          existing.description = payload.description;
          existing.password = payload.password;
          displaySuccess('Account updated');
        } else {
          displayError('Account not found');
        }
      }
    },
  },
  actions: {
    async createContact({ commit, state }, payload: Contact): Promise<string | boolean> {
      const exists = state.contactsState.contacts.find(x => x.address === payload.address)
      if (exists) {
        return "Contact already exists";
      }
      commit("addContact", payload);
      return true;
    },
    async createAccount({ commit }, payload: IAccount) {
      console.debug(`createAccount: ${JSON.stringify(payload)}`);
      commit("addAccount", payload);
      const account = await CreateAccount(payload?.name, payload?.password);
      console.debug(`account: ${JSON.stringify(account)}`);
      commit("accountCreated", account);
    },
    async deleteAccount({ commit }, payload: IAccount) {
      const path = payload?.keyStorePath;
      if (!path) {
        displayError('Unable to delete account, missing path');
        return;
      }
      const deleted = await DeleteAccount(path);
      if (deleted) {
        commit("removeAccount", payload);
        displaySuccess('Account keystore file deleted or could not be found');
      } else {
        displayError('Unable to delete account');
      }
    },
    async send({ commit }, payload: main.SendCommand) : Promise<main.SendResult> {
      console.debug(`sending: ${JSON.stringify(payload)}`);
      const result = await Send(payload);
      return result;
    },
    async getAccounts({ commit }) {
      const accounts = await GetAccounts();
      console.debug(`account: ${JSON.stringify(accounts)}`);
      commit("mergeExistingKeyStores", accounts);
    },
    getBalanceForAddress({ commit }, address: string) {
      const provider = new ethers.providers.JsonRpcProvider(this.state.settingsState.nodeUrl);
      provider.getBalance(address)
        .then((balance) => {
          const etherString = ethers.utils.formatEther(balance);
          console.debug(`balance for address: ${address} is ${etherString}`);
          commit("setBalanceForAccount", { address, balance: etherString });
        });
    },
    getTransactionsForAccount({ commit }, address: string) {
      const checkSum = ethers.utils.getAddress(address);
      console.debug(`getting transactions for address: ${checkSum}`);
      axios
        .get(`${this.state.settingsState.apiBaseUrl}/addresses/${checkSum}/transactions/0`)
        .then((response) => response.data)
        .then((items) => {
          console.log(items);
          commit("setTransactionsForAccount", { address, transactions: items });
        });
    },
  },
  modules: {},
});
