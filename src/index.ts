import { TranslateEVM } from './translate/translateEVM';
import { TranslateUTXO } from './translate/translateUTXO';
import { TranslateSVM } from './translate/translateSVM';
import { TranslateCOSMOS } from './translate/translateCOSMOS';
import { TranslateTVM } from './translate/translateTVM';
import { TranslatePOLKADOT } from './translate/translatePOLKADOT';

import { PricingEVM, PriceType } from './pricing/pricingEVM';
import { PricingSVM } from './pricing/pricingSVM';
import { PricingMove } from './pricing/pricingMove';
import { PricingCosmos } from './pricing/pricingCosmos';

export { Foresight } from './foresight/foresight';

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

    /**
     * Creates a new instance of TranslateCOSMOS for Cosmos based blockchain.
     * @param apiKey - The API key for authentication.
     * @returns A new TranslateCOSMOS instance.
     */
    cosmos: (apiKey: string) => new TranslateCOSMOS(apiKey),

    /**
     * Creates a new instance of TranslateTVM for TVM based blockchain.
     * @param apiKey - The API key for authentication.
     * @returns A new TranslateTVM instance.
     */
    tvm: (apiKey: string) => new TranslateTVM(apiKey),

    /**
     * Creates a new instance of TranslatePOLKADOT for Polkadot based blockchain.
     * @param apiKey - The API key for authentication.
     * @returns A new TranslatePOLKADOT instance.
     */
    polkadot: (apiKey: string) => new TranslatePOLKADOT(apiKey),
};

/**
 * Pricing object provides access to different blockchain pricing services.
 */
export const Pricing = {
    /**
     * Creates a new instance of PricingEVM for Ethereum Virtual Machine (EVM) based blockchains.
     * @param apiKey - The API key for authentication.
     * @returns A new PricingEVM instance.
     */
    evm: (apiKey: string) => new PricingEVM(apiKey),

    /**
     * Creates a new instance of PricingMove for Move based blockchain.
     * @param apiKey - The API key for authentication.
     * @returns A new PricingMove instance.
     */
    move: (apiKey: string) => new PricingMove(apiKey),

    /**
     * Creates a new instance of PricingCosmos for Cosmos based blockchain.
     * @param apiKey - The API key for authentication.
     * @returns A new PricingCosmos instance.
     */
    cosmos: (apiKey: string) => new PricingCosmos(apiKey),

    /**
     * Creates a new instance of PricingSVM for Solana Virtual Machine (SVM) based blockchain.
     * @param apiKey - The API key for authentication.
     * @returns A new PricingSVM instance.
     */
    svm: (apiKey: string) => new PricingSVM(apiKey),
};

export * from "./types/types"
export { PriceType }
export { shortenAddress } from './utils/addressUtils';