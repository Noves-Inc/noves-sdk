export interface ApiResponse {
    succeeded: boolean;
    response: any;
}

export interface Chain {
    ecosystem: string;
    evmChainId: number;
    name: string;
}