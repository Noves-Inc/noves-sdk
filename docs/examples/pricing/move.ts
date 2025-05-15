import { Pricing } from "../../../src";
import { ChainNotFoundError } from "../../../src/errors/ChainNotFoundError";

/**
 * Example demonstrating the usage of the Move Pricing API
 */
async function movePricingExample() {
  // Initialize the Move pricing client
  const movePricing = Pricing.move("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported chains...");
    const chains = await movePricing.getChains();
    console.log("Supported chains:", chains);

    // 2. Get specific chain information
    console.log("\nFetching specific chain information...");
    const suiChain = await movePricing.getChain("sui");
    console.log("Sui chain info:", suiChain);

    // 3. Get price from specific pool
    console.log("\nFetching price from specific pool...");
    const poolAddress = "0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026"; // SUI-BUCK Aftermath Finance pool
    const tokenAddress = "0x2::sui::SUI"; // SUI token
    const priceFromPool = await movePricing.getPriceFromPool("sui", poolAddress, tokenAddress);
    console.log("Price from pool:", priceFromPool);
    // Example response:
    // {
    //   chain: "sui",
    //   exchange: {
    //     name: "Aftermath Finance"
    //   },
    //   poolAddress: "0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026",
    //   baseToken: {
    //     address: "0x2::sui::SUI",
    //     symbol: "SUI",
    //     name: "Sui",
    //     decimals: 9
    //   },
    //   quoteToken: {
    //     address: "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK",
    //     symbol: "BUCK",
    //     name: "Bucket USD",
    //     decimals: 9
    //   },
    //   price: {
    //     amount: "3.857618395"
    //   }
    // }
  } catch (error) {
    if (error instanceof ChainNotFoundError) {
      console.error("Chain not found:", error.message);
    } else {
      console.error("An error occurred:", error);
    }
  }
}

export default movePricingExample; 