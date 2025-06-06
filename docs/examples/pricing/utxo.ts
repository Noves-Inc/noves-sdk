import { Pricing, PriceType } from "../../../src";

/**
 * Example demonstrating the usage of the UTXO Pricing API
 */
async function utxoPricingExample() {
  // Initialize the UTXO pricing client
  const utxoPricing = Pricing.utxo("YOUR_API_KEY");

  try {
    // 1. Get supported chains
    console.log("Fetching supported UTXO chains...");
    const chains = await utxoPricing.getChains();
    console.log("Supported UTXO chains:", chains);

    // Display chain information
    chains.forEach((chain, index) => {
      console.log(`\nChain ${index + 1}:`);
      console.log(`  Name: ${chain.name}`);
      console.log(`  Ecosystem: ${chain.ecosystem}`);
      console.log(`  Native Coin: ${chain.nativeCoin.name} (${chain.nativeCoin.symbol})`);
      console.log(`  Decimals: ${chain.nativeCoin.decimals}`);
    });

    // 2. Get current Bitcoin price with default settings
    console.log("\n=== Getting Bitcoin Price (Default) ===");
    const btcPrice = await utxoPricing.getPrice("btc", "bitcoin");
    console.log("Bitcoin price:", btcPrice);
    console.log(`  Price: ${btcPrice.price.amount} ${btcPrice.price.currency}`);
    console.log(`  Status: ${btcPrice.price.status}`);
    console.log(`  Price Type: ${btcPrice.priceType}`);

    // 3. Get Bitcoin price with specific price type
    console.log("\n=== Getting Bitcoin Price (Coingecko) ===");
    const btcPriceCoingecko = await utxoPricing.getPrice("btc", "bitcoin", {
      priceType: PriceType.COINGECKO
    });
    console.log("Bitcoin price (Coingecko):", btcPriceCoingecko);
    console.log(`  Price: ${btcPriceCoingecko.price.amount} ${btcPriceCoingecko.price.currency}`);
    console.log(`  Price Type: ${btcPriceCoingecko.priceType}`);

    // 4. Get Bitcoin price with timestamp (historical)
    console.log("\n=== Getting Bitcoin Price (Historical) ===");
    const historicalTimestamp = Math.floor(Date.now() / 1000) - (24 * 60 * 60); // 24 hours ago
    const btcPriceHistorical = await utxoPricing.getPrice("btc", "bitcoin", {
      timestamp: historicalTimestamp
    });
    console.log("Bitcoin price (24h ago):", btcPriceHistorical);
    console.log(`  Price: ${btcPriceHistorical.price.amount} ${btcPriceHistorical.price.currency}`);
    console.log(`  Timestamp: ${historicalTimestamp}`);

    // 5. Get Bitcoin price with custom price type and timestamp
    console.log("\n=== Getting Bitcoin Price (Custom Settings) ===");
    const btcPriceCustom = await utxoPricing.getPrice("btc", "bitcoin", {
      priceType: PriceType.DEX_HIGHEST_LIQUIDITY,
      timestamp: historicalTimestamp
    });
    console.log("Bitcoin price (Custom):", btcPriceCustom);
    console.log(`  Price: ${btcPriceCustom.price.amount} ${btcPriceCustom.price.currency}`);
    console.log(`  Price Type: ${btcPriceCustom.priceType}`);

    // 6. Example with chain name variant
    console.log("\n=== Getting Bitcoin Price (Chain Name Variant) ===");
    const btcPriceVariant = await utxoPricing.getPrice("bitcoin", "bitcoin");
    console.log("Bitcoin price (using 'bitcoin' chain name):", btcPriceVariant);
    console.log(`  Resolved Chain: ${btcPriceVariant.chain}`);

    // 7. Example with custom price type string
    console.log("\n=== Getting Bitcoin Price (Custom String) ===");
    const btcPriceCustomString = await utxoPricing.getPrice("btc", "bitcoin", {
      priceType: "custom"
    });
    console.log("Bitcoin price (custom string):", btcPriceCustomString);

  } catch (error) {
    console.error('UTXO Pricing API error:', error);
  }
}

// Run the example
utxoPricingExample().catch(console.error); 