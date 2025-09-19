import { TranslateEVM } from './translate/translateEVM';
import { TranslateUTXO } from './translate/translateUTXO';
import { TranslateSVM } from './translate/translateSVM';
import { TranslateCOSMOS } from './translate/translateCOSMOS';
import { TranslateTVM } from './translate/translateTVM';
import { TranslatePOLKADOT } from './translate/translatePOLKADOT';
import { TranslateXRPL } from './translate/translateXRPL';
import { TranslateExchange } from './translate/translateExchange';

import { PricingEVM, PriceType } from './pricing/pricingEVM';
import { PricingSVM, PriceType as SVMPriceType } from './pricing/pricingSVM';
import { PricingUTXO, PriceType as UTXOPriceType } from './pricing/pricingUTXO';
import { PricingMove } from './pricing/pricingMove';
import { PricingCosmos } from './pricing/pricingCosmos';

import { RetryConfig, SDKOptions } from './types/common';
import { RetryPresets, RetryRecommendations } from './utils/retryPresets';

export { Foresight } from './foresight/foresight';

/**
 * Utility functions for configuration normalization
 */
function normalizeOptions(options: string | SDKOptions): {
  apiKey: string;
  retryConfig?: RetryConfig;
} {
  if (typeof options === 'string') {
    return { apiKey: options };
  }

  let retryConfig: RetryConfig | undefined;
  
  if (options.retryConfig) {
    if (typeof options.retryConfig === 'string') {
      // Use preset
      retryConfig = (RetryPresets as any)[options.retryConfig];
      if (!retryConfig) {
        throw new Error(`Unknown retry preset: ${options.retryConfig}`);
      }
    } else {
      retryConfig = options.retryConfig;
    }
  } else if (options.environment) {
    // Auto-recommend based on environment
    retryConfig = RetryRecommendations.recommendStrategy({
      environment: options.environment,
      usage: 'general',
      errorTolerance: 'medium',
      performanceRequirement: 'balanced'
    });
  }

  return {
    apiKey: options.apiKey,
    retryConfig
  };
}

/**
 * Enhanced Translate factory with rich configuration options
 */
export const Translate = {
  /**
   * Create TranslateEVM with enhanced options
   */
  evm: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new TranslateEVM(config.apiKey, config.retryConfig);
  },

  svm: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new TranslateSVM(config.apiKey, config.retryConfig);
  },

  utxo: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new TranslateUTXO(config.apiKey, config.retryConfig);
  },

  cosmos: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new TranslateCOSMOS(config.apiKey, config.retryConfig);
  },

  tvm: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new TranslateTVM(config.apiKey, config.retryConfig);
  },

  polkadot: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new TranslatePOLKADOT(config.apiKey, config.retryConfig);
  },

  xrpl: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new TranslateXRPL(config.apiKey, config.retryConfig);
  },

  exchange: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new TranslateExchange(config.apiKey, config.retryConfig);
  }
};

/**
 * Enhanced Pricing factory with rich configuration options
 */
export const Pricing = {
  evm: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new PricingEVM(config.apiKey, config.retryConfig);
  },

  move: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new PricingMove(config.apiKey, config.retryConfig);
  },

  cosmos: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new PricingCosmos(config.apiKey, config.retryConfig);
  },

  svm: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new PricingSVM(config.apiKey, config.retryConfig);
  },

  utxo: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new PricingUTXO(config.apiKey, config.retryConfig);
  }
};

/**
 * Enhanced Foresight factory
 */
export const ForesightFactory = {
  evm: (options: string | SDKOptions) => {
    const config = normalizeOptions(options);
    return new (require('./foresight/foresight').Foresight)(config.apiKey, config.retryConfig);
  }
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
export { TranslateExchange } from './translate/translateExchange';

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

// Export retry mechanism types and constants
export type { RetryConfig, RetryContext, RetryEngine, SDKOptions } from './types/common';
export { DEFAULT_RETRY_CONFIG, RETRY_PRESETS, mergeRetryConfig } from './utils/apiUtils';

// Export enhanced retry functionality
export { RetryPresets, RetryConfigBuilder, RetryRecommendations } from './utils/retryPresets';

/**
 * Convenience functions for common configurations
 */
export namespace RetryHelpers {
  
  /**
   * Create a production-ready configuration
   */
  export function forProduction(customizations?: Partial<RetryConfig>): RetryConfig {
    return { ...RetryPresets.PRODUCTION, ...customizations };
  }

  /**
   * Create a development configuration
   */
  export function forDevelopment(customizations?: Partial<RetryConfig>): RetryConfig {
    return { ...RetryPresets.DEVELOPMENT, ...customizations };
  }

  /**
   * Create a configuration for batch processing
   */
  export function forBatchProcessing(customizations?: Partial<RetryConfig>): RetryConfig {
    return { ...RetryPresets.BATCH_PROCESSING, ...customizations };
  }

  /**
   * Create a real-time optimized configuration
   */
  export function forRealTime(customizations?: Partial<RetryConfig>): RetryConfig {
    return { ...RetryPresets.REAL_TIME, ...customizations };
  }

  /**
   * Disable retries completely
   */
  export function disabled(): RetryConfig {
    return RetryPresets.DISABLED;
  }
}