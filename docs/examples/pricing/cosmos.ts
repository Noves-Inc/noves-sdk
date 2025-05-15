import { Pricing, PriceType } from "../../../src";
import { ChainNotFoundError } from "../../../src/errors/ChainNotFoundError";

/**
 * Example demonstrating the usage of the Cosmos Pricing API
 */
async function cosmosPricingExample() {
  // Initialize the Cosmos pricing client
  const cosmosPricing = Pricing.cosmos("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported chains...");
    const chains = await cosmosPricing.getChains();
    console.log("Supported chains:", chains);

    // 2. Get specific chain information
    console.log("\nFetching specific chain information...");
    const secretChain = await cosmosPricing.getChain("secret");
    console.log("Secret chain info:", secretChain);

    // 3. Get token price
    console.log("\nFetching token price...");
    const scrtAddress = "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8qzek"; // SCRT
    const scrtPrice = await cosmosPricing.getPrice("secret", scrtAddress);
    console.log("SCRT price:", scrtPrice);

    // 4. Get token price with options
    console.log("\nFetching token price with options...");
    const scrtPriceWithOptions = await cosmosPricing.getPrice("secret", scrtAddress, {
      priceType: PriceType.DEX_HIGHEST_LIQUIDITY,
      timestamp: Math.floor(Date.now() / 1000) - 86400 // 24 hours ago
    });
    console.log("SCRT price with options:", scrtPriceWithOptions);

    // 5. Get price from specific pool
    console.log("\nFetching price from specific pool...");
    const poolAddress = "secret1l34fyc9g23fnlk896693nw57phevnyha7pt6gj"; // SHD-SILK pool
    const tokenAddress = "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm"; // SHD token
    const priceFromPool = await cosmosPricing.getPriceFromPool("secret", poolAddress, tokenAddress);
    console.log("Price from pool:", priceFromPool);
    // Example response:
    // {
    //   chain: "secret",
    //   exchange: {
    //     name: "Shade Protocol"
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
    //     amount: "0.742376"
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

// Run the example
cosmosPricingExample().catch(console.error); 