import { Pricing } from "../../../src";
import { MOVEPricingChain, MOVEPricingPoolResponse } from "../../../src/types/move";

/**
 * Example demonstrating the usage of the Move Pricing API
 */
async function movePricingExample() {
  // Initialize the Move pricing client
  const movePricing = Pricing.move("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported chains...");
    const chains: MOVEPricingChain[] = await movePricing.getChains();
    console.log("Supported chains:", chains);

    // Find Sui chain from the list
    const suiChain = chains.find(chain => chain.name.toLowerCase() === 'sui');
    if (suiChain) {
      console.log("\nSui chain details:");
      console.log(`   Name: ${suiChain.name}`);
      console.log(`   Ecosystem: ${suiChain.ecosystem}`);
      console.log(`   Native Coin: ${suiChain.nativeCoin.name} (${suiChain.nativeCoin.symbol})`);
      console.log(`   Decimals: ${suiChain.nativeCoin.decimals}`);
    }

    // 2. Get price from specific pool
    console.log("\nFetching price from specific pool...");
    const poolAddress = "0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026"; // SUI-BUCK Aftermath Finance pool
    const tokenAddress = "0x2::sui::SUI"; // SUI token
    const priceFromPool: MOVEPricingPoolResponse = await movePricing.getPriceFromPool("sui", poolAddress, tokenAddress);
    console.log("Price from pool:", priceFromPool);

    // Example response (based on actual API call):
    // {
    //   "chain": "sui",
    //   "exchange": {
    //     "name": "Aftermath Finance"
    //   },
    //   "poolAddress": "0xdeacf7ab460385d4bcb567f183f916367f7d43666a2c72323013822eb3c57026",
    //   "baseToken": {
    //     "address": "0x2::sui::SUI",
    //     "symbol": "SUI",
    //     "name": "Sui",
    //     "decimals": 9
    //   },
    //   "quoteToken": {
    //     "address": "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK",
    //     "symbol": "BUCK",
    //     "name": "Bucket USD",
    //     "decimals": 9
    //   },
    //   "price": {
    //     "amount": "2.911229208"
    //   }
    // }

    // 3. Process the price data
    console.log("\nProcessing price data...");
    console.log(`Chain: ${priceFromPool.chain}`);
    console.log(`Exchange: ${priceFromPool.exchange.name}`);
    console.log(`Pool Address: ${priceFromPool.poolAddress}`);
    console.log(`Base Token: ${priceFromPool.baseToken.name} (${priceFromPool.baseToken.symbol})`);
    console.log(`Quote Token: ${priceFromPool.quoteToken.name} (${priceFromPool.quoteToken.symbol})`);
    console.log(`Price: ${priceFromPool.price.amount} ${priceFromPool.quoteToken.symbol} per ${priceFromPool.baseToken.symbol}`);

    // 4. Calculate price with proper decimals
    console.log("\nCalculating normalized price...");
    const rawPrice = parseFloat(priceFromPool.price.amount);
    const baseDecimals = priceFromPool.baseToken.decimals;
    const quoteDecimals = priceFromPool.quoteToken.decimals;
    
    console.log(`Raw price: ${rawPrice}`);
    console.log(`Base token decimals: ${baseDecimals}`);
    console.log(`Quote token decimals: ${quoteDecimals}`);
    
    // For this example, the price is already normalized, but this shows how to work with decimals
    const adjustedPrice = rawPrice * Math.pow(10, baseDecimals - quoteDecimals);
    console.log(`Adjusted price: ${adjustedPrice}`);

  } catch (error) {
    console.error("An error occurred:", error);
    
    // Handle specific error scenarios
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        console.error("Pool or token address not found");
      } else if (error.message.includes('rate limit')) {
        console.error("API rate limit exceeded");
      } else if (error.message.includes('API key')) {
        console.error("Invalid API key provided");
      }
    }
  }
}

export default movePricingExample; 