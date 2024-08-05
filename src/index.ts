import { TranslateEVM } from './translate/translateEVM';
import { TranslateUTXO } from './translate/translateUTXO';
import { TranslateSVM } from './translate/translateSVM';

/**
 * Translate object provides access to different blockchain translation services.
 */
export const Translate = {
    /**
     * Creates a new instance of TranslateEVM for Ethereum Virtual Machine (EVM) based blockchains.
     * @param apiKey - The API key for authentication.
     * @returns A new TranslateEVM instance.
     */
    evm: (apiKey: string) => new TranslateEVM(apiKey),

    /**
     * Creates a new instance of TranslateSVM for Solana Virtual Machine (SVM) based blockchain.
     * @param apiKey - The API key for authentication.
     * @returns A new TranslateSVM instance.
     */
    svm: (apiKey: string) => new TranslateSVM(apiKey),

    /**
     * Creates a new instance of TranslateUTXO for Unspent Transaction Output (UTXO) based blockchains.
     * @param apiKey - The API key for authentication.
     * @returns A new TranslateUTXO instance.
     */
    utxo: (apiKey: string) => new TranslateUTXO(apiKey),
};

export * from "./types/types"