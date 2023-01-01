import { ITransaction } from "./transaction";

export interface IAccount {
    name: string;
    description: string;
    password: string;
    address: string;
    keyStorePath?: string;
    balance?: number;
    transactions?: ITransaction[];
  }
