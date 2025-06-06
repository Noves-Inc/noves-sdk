import { Pricing, PriceType } from "../../../src";

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

    // 2. Find specific chain information from the chains list
    console.log("\nFinding specific chain information...");
    const ethChain = chains.find(chain => chain.name === "eth");
    if (ethChain) {
      console.log("Ethereum chain info:", ethChain);
    } else {
      console.log("ETH chain not found in supported chains");
    }

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
    const poolAddress = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"; // ETH-USDC Uniswap V3 pool
    const ethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH
    const priceFromPool = await evmPricing.getPriceFromPool("eth", poolAddress, ethAddress);
    console.log("Price from pool:", priceFromPool);

    // 6. Pre-fetch prices for multiple tokens
    console.log("\nPre-fetching prices for multiple tokens...");
    // Each token uses EVMPricingTokenPrefetchRequest type
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
    // Returns Array<EVMPricingTokenPrefetchResult>
    const preFetchResult = await evmPricing.preFetchPrice(tokens);
    console.log("Pre-fetch results:", preFetchResult);
    
    // Each result in the array contains request, result, and error fields
    preFetchResult.forEach((item, index) => {
      console.log(`\nToken ${index + 1}:`);
      console.log(`  Request: ${JSON.stringify(item.request, null, 2)}`);
      console.log(`  Status: ${item.result?.priceStatus || 'error'}`);
      console.log(`  Price: ${item.result?.price || 'N/A'}`);
      if (item.error) {
        console.log(`  Error: ${item.error}`);
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the example
evmPricingExample().catch(console.error); 