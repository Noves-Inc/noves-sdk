import { Pricing } from "../../../src";
import { COSMOSPricingChainsResponse, COSMOSPricingPoolPricing } from "../../../src/types/cosmos";

/**
 * Example demonstrating the usage of the Cosmos Pricing API
 */
async function cosmosPricingExample() {
  // Initialize the Cosmos pricing client
  const cosmosPricing = Pricing.cosmos("YOUR_API_KEY");

  try {
    // 1. Get supported chains with proper typing
    console.log("Fetching supported chains...");
    const chains: COSMOSPricingChainsResponse = await cosmosPricing.getChains();
    console.log("Supported chains:", chains);
    
    // Example response structure:
    // [
    //   {
    //     name: "secret",
    //     ecosystem: "cosmos", 
    //     nativeCoin: {
    //       name: "SCRT",
    //       symbol: "SCRT",
    //       address: "SCRT",
    //       decimals: 6
    //     }
    //   }
    // ]

    if (chains.length === 0) {
      console.log("No chains available");
      return;
    }

    // 2. Find specific chain information from the chains array
    console.log("\nFetching specific chain information...");
    const secretChain = chains.find(chain => chain.name === "secret");
    if (secretChain) {
      console.log("Secret chain info:", secretChain);
      
      // Access typed properties
      console.log(`Chain name: ${secretChain.name}`);
      console.log(`Native coin symbol: ${secretChain.nativeCoin.symbol}`);
      console.log(`Native coin decimals: ${secretChain.nativeCoin.decimals}`);
    } else {
      console.log("Secret chain not found");
      return;
    }

    // 3. Get price from specific pool with proper typing
    console.log("\nFetching price from specific pool...");
    const poolAddress = "secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj"; // Example pool
    const tokenAddress = "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm"; // Example token
    
    const priceFromPool: COSMOSPricingPoolPricing = await cosmosPricing.getPriceFromPool(
      "secret", 
      poolAddress, 
      tokenAddress
    );
    console.log("Price from pool:", priceFromPool);
    
    // Example response structure:
    // {
    //   chain: "secret",
    //   exchange: {
    //     name: null
    //   },
    //   poolAddress: "secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj",
    //   baseToken: {
    //     address: "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
    //     symbol: "SHD",
    //     name: "Shade",
    //     decimals: 8
    //   },
    //   quoteToken: {
    //     address: "secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
    //     symbol: "SILK",
    //     name: "Silk Stablecoin",
    //     decimals: 6
    //   },
    //   price: {
    //     amount: "0.613678"
    //   }
    // }

    // Access typed properties safely
    console.log(`Base token: ${priceFromPool.baseToken.symbol}`);
    console.log(`Quote token: ${priceFromPool.quoteToken.symbol}`);
    console.log(`Price: ${priceFromPool.price.amount}`);
    
    // No need for null checks since these fields are guaranteed to be present
    console.log(`Pool address: ${priceFromPool.poolAddress}`);
    console.log(`Chain: ${priceFromPool.chain}`);
    
    // Only exchange name can be null
    if (priceFromPool.exchange.name) {
      console.log(`Exchange: ${priceFromPool.exchange.name}`);
    } else {
      console.log("Exchange name not available");
    }

  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Run the example
cosmosPricingExample().catch(console.error); 