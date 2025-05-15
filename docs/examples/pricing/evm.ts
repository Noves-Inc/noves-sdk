import { Pricing, PriceType } from "../../../src";
import { ChainNotFoundError } from "../../../src/errors/ChainNotFoundError";

/**
 * Example demonstrating the usage of the EVM Pricing API
 */
async function evmPricingExample() {
  // Initialize the EVM pricing client
  const evmPricing = Pricing.evm("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported chains...");
    const chains = await evmPricing.getChains();
    console.log("Supported chains:", chains);

    // 2. Get specific chain information
    console.log("\nFetching specific chain information...");
    const ethChain = await evmPricing.getChain("eth");
    console.log("Ethereum chain info:", ethChain);

    // 3. Get token price
    console.log("\nFetching token price...");
    const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // USDC
    const usdcPrice = await evmPricing.getPrice("eth", usdcAddress);
    console.log("USDC price:", usdcPrice);

    // 4. Get token price with options
    console.log("\nFetching token price with options...");
    const usdcPriceWithOptions = await evmPricing.getPrice("eth", usdcAddress, {
      priceType: PriceType.DEX_HIGHEST_LIQUIDITY,
      timestamp: Math.floor(Date.now() / 1000) - 86400 // 24 hours ago
    });
    console.log("USDC price with options:", usdcPriceWithOptions);

    // 5. Get price from specific pool
    console.log("\nFetching price from specific pool...");
    const poolAddress = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"; // ETH-USDC Uniswap V3 pool
    const ethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH
    const priceFromPool = await evmPricing.getPriceFromPool("eth", poolAddress, ethAddress);
    console.log("Price from pool:", priceFromPool);

    // 6. Pre-fetch prices for multiple tokens
    console.log("\nPre-fetching prices for multiple tokens...");
    const tokens = [
      {
        tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
        chain: "eth",
        priceType: PriceType.DEX_HIGHEST_LIQUIDITY
      },
      {
        tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
        chain: "eth",
        priceType: PriceType.DEX_HIGHEST_LIQUIDITY,
        // Optional: Add timestamp or blockNumber for historical data
        // timestamp: Math.floor(Date.now() / 1000) - 86400 // 24 hours ago
      }
    ];
    const preFetchResult = await evmPricing.preFetchPrice(tokens);
    console.log("Pre-fetch results:", preFetchResult);

  } catch (error) {
    if (error instanceof ChainNotFoundError) {
      console.error('Chain not found:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Run the example
evmPricingExample().catch(console.error); 