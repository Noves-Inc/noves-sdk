import { TranslateEVM } from './translate/translateEVM';
import { TranslateUTXO } from './translate/translateUTXO';
import { TranslateSVM } from './translate/translateSVM';
import { TranslateCOSMOS } from './translate/translateCOSMOS';
import { TranslateTVM } from './translate/translateTVM';
import { TranslatePOLKADOT } from './translate/translatePOLKADOT';
import { TranslateXRPL } from './translate/translateXRPL';

import { PricingEVM, PriceType } from './pricing/pricingEVM';
import { PricingSVM, PriceType as SVMPriceType } from './pricing/pricingSVM';
import { PricingUTXO, PriceType as UTXOPriceType } from './pricing/pricingUTXO';
import { PricingMove } from './pricing/pricingMove';
import { PricingCosmos } from './pricing/pricingCosmos';

export { Foresight } from './foresight/foresight';

/**
 * Foresight object provides access to transaction pre-sign insights.
 */
export const ForesightFactory = {
    /**
     * Creates a new instance of Foresight for EVM-based blockchains.
     * @param apiKey - The API key for authentication.
     * @returns A new Foresight instance.
     */
    evm: (apiKey: string) => new (require('./foresight/foresight').Foresight)(apiKey),
};

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

    /**
     * Creates a new instance of TranslateXRPL for XRP Ledger based blockchain.
     * @param apiKey - The API key for authentication.
     * @returns A new TranslateXRPL instance.
     */
    xrpl: (apiKey: string) => new TranslateXRPL(apiKey),
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

    /**
     * Creates a new instance of PricingUTXO for Unspent Transaction Output (UTXO) based blockchains.
     * @param apiKey - The API key for authentication.
     * @returns A new PricingUTXO instance.
     */
    utxo: (apiKey: string) => new PricingUTXO(apiKey),
};

// Export all types for backward compatibility
export * from "./types"

// Export individual translate classes
export { TranslateEVM } from './translate/translateEVM';
export { TranslateUTXO } from './translate/translateUTXO';
export { TranslateSVM } from './translate/translateSVM';
export { TranslateCOSMOS } from './translate/translateCOSMOS';
export { TranslateTVM } from './translate/translateTVM';
export { TranslatePOLKADOT } from './translate/translatePOLKADOT';
export { TranslateXRPL } from './translate/translateXRPL';

// Export pricing classes
export { PricingEVM } from './pricing/pricingEVM';
export { PricingSVM } from './pricing/pricingSVM';
export { PricingUTXO } from './pricing/pricingUTXO';
export { PricingMove } from './pricing/pricingMove';
export { PricingCosmos } from './pricing/pricingCosmos';

export { PriceType, SVMPriceType, UTXOPriceType }
export { shortenAddress } from './utils/addressUtils';

// Export pagination classes
export { TransactionsPage } from './translate/transactionsPage';

// Export error types and enums
export { ErrorType, ERROR_MESSAGES, ERROR_STATUS_CODES } from './errors/ErrorTypes';
export { TransactionError } from './errors/TransactionError';