import { createStore } from "vuex";
import { ethers } from "ethers";
import { IAccount } from "../model/account";
import { ITransaction } from "../model/transaction";
import axios from "axios";
import { CreateAccount, GetAccounts, Send } from '../../wailsjs/go/main/App'
import { main } from '../../wailsjs/go/models'
import { displayError, displaySuccess } from "../utils/feedback.utilities";

export interface IState {
  accountsState: IAccountsState;
  settingsState: ISettingsState;
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
    }
  },
  getters: {
    accountsState: (state) => state.accountsState,
  },
  mutations: {
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
  },
  actions: {
    async createAccount({ commit }, payload: IAccount) {
      console.debug(`createAccount: ${JSON.stringify(payload)}`);
      commit("addAccount", payload);
      const account = await CreateAccount(payload?.name, payload?.password);
      console.debug(`account: ${JSON.stringify(account)}`);
      commit("accountCreated", account);
      // sendMessage(data);
    },
    async send({ commit }, payload: main.SendCommand) {
      console.debug(`sending: ${JSON.stringify(payload)}`);
      const result = await Send(payload);
      console.debug(`result: ${JSON.stringify(result)}`);
      if(result?.success) {
        displaySuccess('Transaction submitted');
        // commit("sentFunds", result);
      } else {
        displayError(result.message);
      }
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
    loadAccounts({ commit }) {
      // load = local storage
      const accounts = localStorage.getItem("accounts");
      const accountsJson: IAccount[] = JSON.parse(accounts ?? "[]");
      commit("setAccounts", accountsJson);
    },
    storeAccounts({ commit }) {
      // store = local storage
      console.debug('storing accounts to local storage');
      const accounts = this.state.accountsState.accounts.filter(x => x.address !== undefined);
      localStorage.setItem("accounts", JSON.stringify(accounts));
      commit("setAccounts", accounts);
    },
    loadSettings({ commit }) {
      // load = local storage
      const settings = localStorage.getItem("settings");
      const settingsJson: ISettingsState = JSON.parse(settings ?? "{}");
      console.debug(`settings loaded: ${JSON.stringify(settingsJson)}`);
      commit("setSettings", settingsJson);
    },
    storeSettings({ commit }, settings: ISettingsState) {
      // store = local storage
      console.debug('storing settings to local storage');
      localStorage.setItem("settings", JSON.stringify(settings));
      commit("setSettings", settings);

    },
    updateAccount({ commit }, payload: IAccount) {
      // update = local storage
      const accounts = localStorage.getItem("accounts");
      const accountsJson: IAccount[] = JSON.parse(accounts ?? "[]");
      const index = accountsJson.findIndex(x => x.address === payload.address);
      if (index >= 0) {
        const account = accountsJson[index];
        account.name = payload.name;
        account.description = payload.description;
        account.password = payload.password;
      }
      localStorage.setItem("accounts", JSON.stringify(accountsJson));
      commit("setAccounts", accountsJson);
    }
  },
  modules: {},
});
