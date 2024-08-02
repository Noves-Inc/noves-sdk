import { TranslateEVM } from './translate/translateEVM';
import { TranslateUTXO } from './translate/translateUTXO';
import { TranslateSVM } from './translate/translateSVM';

export const Translate = {
    evm: (apiKey: string) => new TranslateEVM(apiKey),
    utxo: (apiKey: string) => new TranslateUTXO(apiKey),
    svm: (apiKey: string) => new TranslateSVM(apiKey),
};

export * from "./types/types"