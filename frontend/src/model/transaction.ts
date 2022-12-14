
export interface ITransaction {
    amount: number;
    // from api
    id: number;
    hash: string;
    blockHash: string;
    blockNumber: number;
    from: string;
    gas: number;
    gasPrice: string;
    input: string;
    nonce: number | undefined;
    to: string;
    transactionIndex: number;
    value: string;
    ts: number;
    // block: Block;
    contractAddress: string;
    cumulativeGasUsed: number;
    effectiveGasPrice: number;
    logsBloom: string;
    status: boolean;
    // logs: TransactionLog[];
}
