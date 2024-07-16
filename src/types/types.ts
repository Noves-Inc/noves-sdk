export interface ApiResponse {
    succeeded: boolean;
    response: any;
}

export interface Chain {
    ecosystem: string;
    evmChainId: number;
    name: string;
}
  
export interface Transaction {
    txTypeVersion: number;
    chain: string;
    accountAddress: string;
    classificationData: ClassificationData;
    rawTransactionData: RawTransactionData;
}
  
export interface ClassificationData {
    type: string;
    description: string;
    sent: SentReceived[];
    received: SentReceived[];
}
  
export interface SentReceived {
    action: string;
    amount: string;
    to: To;
    from: From;
    token?: Token;
    nft?: Nft;
}
  
export interface Token {
    symbol: string;
    name: string;
    decimals: number;
    address: string;
}
  
export interface Nft {
    name: string;
    id: number;
    symbol: string;
    address: string;
}
  
export interface From {
    name: string | null;
    address: string;
}
  
export interface To {
    name: string | null;
    address: string;
}
  
export interface RawTransactionData {
    transactionHash: string;
    fromAddress: string;
    toAddress: string;
    blockNumber: number;
    gas: number;
    gasPrice: number;
    transactionFee: number;
    timestamp: number;
}