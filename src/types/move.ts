/**
 * Move ecosystem specific types for the Noves SDK
 */

// ===== MOVE PRICING TYPES =====

/**
 * Native coin information for Move chains (pricing API)
 */
export interface MOVEPricingNativeCoin {
    name: string;
    symbol: string;
    address: string;
    decimals: number;
}

/**
 * Move chain information as returned by the /move/chains endpoint
 */
export interface MOVEPricingChain {
    name: string;
    ecosystem: string;
    nativeCoin: MOVEPricingNativeCoin;
}

/**
 * Exchange information for Move pool pricing
 */
export interface MOVEPricingExchange {
    name: string;
}

/**
 * Token information for Move pool pricing
 */
export interface MOVEPricingToken {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
}

/**
 * Price information for Move pool pricing
 */
export interface MOVEPricingPrice {
    amount: string;
}

/**
 * Pool pricing response structure for Move chains
 * Based on actual API response structure from the Move Pricing API
 */
export interface MOVEPricingPoolResponse {
    chain: string;
    exchange: MOVEPricingExchange;
    poolAddress: string;
    baseToken: MOVEPricingToken;
    quoteToken: MOVEPricingToken;
    price: MOVEPricingPrice;
} 