import { Pricing } from "../../../src";
import { PriceType } from "../../../src/pricing/pricingSVM";

/**
 * Example demonstrating the usage of the SVM Pricing API
 */
async function svmPricingExample() {
  // Initialize the SVM pricing client
  const svmPricing = Pricing.svm("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported chains...");
    const chains = await svmPricing.getChains();
    console.log("Supported chains:", chains);

    // 2. Get token price
    console.log("\nFetching token price...");
    const usdcAddress = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC on Solana
    const usdcPrice = await svmPricing.getPrice("solana", usdcAddress);
    console.log("USDC price:", usdcPrice);

    // 3. Get token price with options
    console.log("\nFetching token price with options...");
    const usdcPriceWithOptions = await svmPricing.getPrice("solana", usdcAddress, {
      priceType: PriceType.DEX_HIGHEST_LIQUIDITY,
      timestamp: Math.floor(Date.now() / 1000) - 86400 // 24 hours ago
    });
    console.log("USDC price with options:", usdcPriceWithOptions);

    // 4. Get token price using weighted volume average strategy
    console.log("\nFetching token price with weighted volume average strategy...");
    const solAddress = "So11111111111111111111111111111111111111112"; // Wrapped SOL on Solana
    const solPriceWithWeightedAvg = await svmPricing.getPrice("solana", solAddress, {
      priceType: PriceType.WEIGHTED_VOLUME_AVERAGE
    });
    console.log("SOL price with weighted volume average:", solPriceWithWeightedAvg);

  } catch (error) {
    console.error('Pricing API error:', error);
  }
}

// Run the example
svmPricingExample().catch(console.error); 