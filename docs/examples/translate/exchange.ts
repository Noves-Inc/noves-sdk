import { Translate } from "../../../src/index";
import { TransactionError } from "../../../src/errors/TransactionError";
import { 
  ExchangeTranslateAuthRequest,
  ExchangeTranslatePageOptions
} from "../../../src/types/exchange";

/**
 * Example demonstrating the usage of the Exchange Translate API
 */
async function exchangeTranslateExample() {
  // Initialize the Exchange translator using the factory pattern
  const exchangeTranslate = Translate.exchange("YOUR_API_KEY");

  try {
    // 1. Get supported exchanges
    console.log("Fetching supported exchanges...");
    const exchanges = await exchangeTranslate.getExchanges();
    console.log("Supported exchanges:");
    exchanges.forEach((exchange) => {
      console.log(`  ${exchange.name} (Ecosystem: ${exchange.ecosystem}, Tier: ${exchange.tier})`);
    });
    // Example output:
    // [
    //   {
    //     name: "hyperliquid",
    //     ecosystem: "exchange",
    //     tier: 2
    //   }
    // ]

    // 2. Set up authentication for exchange API calls
    // Note: Replace these with your actual exchange credentials
    const authRequest: ExchangeTranslateAuthRequest = {
      auth: {
        apiKey: "YOUR_EXCHANGE_API_KEY", // Replace with your exchange API key
        walletAddress: "0x1234567890123456789012345678901234567890", // Replace with your wallet address
        testnet: false // Set to true for testnet
      }
    };

    // 3. Get accounts for a specific exchange
    console.log("\nFetching accounts for HyperLiquid...");
    const accounts = await exchangeTranslate.getAccounts("hyperliquid", authRequest);
    console.log("Available accounts:", accounts);
    // Example output:
    // {
    //   accounts: [
    //     {
    //       id: "0x1234567890123456789012345678901234567890",
    //       type: "spot",
    //       name: "HyperLiquid Account (0x1234567890123456789012345678901234567890)",
    //       code: "USDC"
    //     }
    //   ]
    // }

    // 4. Get balances for the exchange account
    console.log("\nFetching balances for HyperLiquid...");
    const balances = await exchangeTranslate.getBalances("hyperliquid", authRequest);
    console.log("Account balances:");
    balances.balances.forEach((balance) => {
      console.log(`  ${balance.token.symbol}: ${balance.balance} (${balance.token.name})`);
      console.log(`    Decimals: ${balance.token.decimals}`);
    });
    // Example output:
    // {
    //   balances: [
    //     {
    //       balance: "0.000280",
    //       token: {
    //         symbol: "BTC-PERP",
    //         name: "BTC-PERP",
    //         decimals: "8"
    //       }
    //     },
    //     {
    //       balance: "13.740014",
    //       token: {
    //         symbol: "USDC",
    //         name: "USD Coin",
    //         decimals: "6"
    //       }
    //     }
    //   ]
    // }

    // 5. Get all transactions (basic usage)
    console.log("\nFetching all transactions...");
    const allTransactions = await exchangeTranslate.getTransactions("hyperliquid", authRequest);
    console.log("All transactions:", allTransactions);
    console.log(`Found ${allTransactions.items.length} transactions`);
    console.log(`Has next page: ${allTransactions.hasNextPage}`);

    // Display transaction details
    if (allTransactions.items.length > 0) {
      const firstTransaction = allTransactions.items[0];
      console.log("\nFirst transaction details:");
      console.log(`  Type: ${firstTransaction.classificationData.type}`);
      console.log(`  Chain: ${firstTransaction.chain}`);
      console.log(`  Timestamp: ${new Date(firstTransaction.timestamp).toISOString()}`);
      console.log(`  Source: ${firstTransaction.source.type}`);
      console.log(`  Version: ${firstTransaction.txTypeVersion}`);
      console.log(`  Status: ${firstTransaction.rawTransactionData.status}`);
      console.log(`  Transfers: ${firstTransaction.transfers.length}`);
      
      // Display transfer details
      firstTransaction.transfers.forEach((transfer, index) => {
        console.log(`    Transfer ${index + 1}:`);
        console.log(`      Action: ${transfer.action}`);
        console.log(`      From: ${transfer.from.name || transfer.from.address || 'Unknown'}`);
        console.log(`      To: ${transfer.to.name || transfer.to.address || 'Unknown'}`);
        console.log(`      Amount: ${transfer.amount}`);
        console.log(`      Asset: ${transfer.asset.symbol}`);
      });
    }

    // 6. Get transactions with pagination and filtering
    console.log("\nFetching transactions with pagination and time filtering...");
    const pageOptions: ExchangeTranslatePageOptions = {
      startTimestamp: Date.now() - (30 * 24 * 60 * 60 * 1000), // Last 30 days
      endTimestamp: Date.now(),
      pageSize: 10
    };

    const pagedTransactions = await exchangeTranslate.getTransactions(
      "hyperliquid", 
      authRequest, 
      pageOptions
    );
    
    console.log("Filtered transactions:", pagedTransactions);
    console.log(`Found ${pagedTransactions.items.length} transactions in the last 30 days`);
    console.log(`Has next page: ${pagedTransactions.hasNextPage}`);
    
    if (pagedTransactions.nextPageUrl) {
      console.log(`Next page URL: ${pagedTransactions.nextPageUrl}`);
    }

    // 7. Pagination example - get all transactions across multiple pages
    console.log("\nDemo: Paginated retrieval of all transactions...");
    let allPaginatedTransactions = [];
    let hasMore = true;
    let currentPageKey = undefined;
    let pageCount = 0;

    while (hasMore && pageCount < 3) { // Limit to 3 pages for demo
      pageCount++;
      console.log(`Fetching page ${pageCount}...`);
      
      const response = await exchangeTranslate.getTransactions("hyperliquid", authRequest, {
        pageSize: 5, // Small page size for demo
        pageKey: currentPageKey
      });
      
      allPaginatedTransactions.push(...response.items);
      hasMore = response.hasNextPage;
      
      // Extract pageKey from nextPageUrl if present
      if (response.nextPageUrl) {
        const url = new URL(response.nextPageUrl);
        currentPageKey = url.searchParams.get('pageKey') || undefined;
      } else {
        currentPageKey = undefined;
      }
      
      console.log(`  Retrieved ${response.items.length} transactions`);
      console.log(`  Has more pages: ${hasMore}`);
    }

    console.log(`Total transactions retrieved across ${pageCount} pages: ${allPaginatedTransactions.length}`);

    // 8. Error handling example
    console.log("\nDemo: Error handling...");
    try {
      // Try with invalid exchange name
      await exchangeTranslate.getAccounts("invalid-exchange", authRequest);
    } catch (error) {
      if (error instanceof TransactionError) {
        console.log("Caught expected error for invalid exchange:");
        console.log(`  Error message: ${error.message}`);
        console.log(`  Error type: ${error.errorType}`);
        console.log(`  Status code: ${error.statusCode}`);
      }
    }

    // 9. Try with invalid authentication
    try {
      const invalidAuth: ExchangeTranslateAuthRequest = {
        auth: {
          apiKey: "invalid-key",
          walletAddress: "invalid-address",
          testnet: false
        }
      };
      
      await exchangeTranslate.getAccounts("hyperliquid", invalidAuth);
    } catch (error) {
      if (error instanceof TransactionError) {
        console.log("Caught expected error for invalid authentication:");
        console.log(`  Error message: ${error.message}`);
      }
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    
    if (error instanceof TransactionError) {
      console.error("Transaction Error Details:");
      console.error(`  Message: ${error.message}`);
      console.error(`  Error Type: ${error.errorType}`);
      console.error(`  Status Code: ${error.statusCode}`);
      
      if (error.originalResponse) {
        console.error(`  Original Response: ${JSON.stringify(error.originalResponse, null, 2)}`);
      }
    }
  }
}

/**
 * Advanced example showing real-world usage patterns
 */
async function advancedExchangeExample() {
  const exchangeTranslate = Translate.exchange("YOUR_API_KEY");
  
  // Portfolio monitoring example
  async function monitorPortfolio(exchangeName: string, authRequest: ExchangeTranslateAuthRequest) {
    console.log(`\n=== Portfolio Monitor for ${exchangeName} ===`);
    
    try {
      // Get current balances
      const balances = await exchangeTranslate.getBalances(exchangeName, authRequest);
      
      console.log("Current Portfolio:");
      let totalAssets = 0;
      balances.balances.forEach((balance) => {
        const balanceValue = parseFloat(balance.balance);
        if (balanceValue > 0) {
          console.log(`  ${balance.token.symbol}: ${balance.balance} ${balance.token.name}`);
          totalAssets++;
        }
      });
      console.log(`Total assets with balance: ${totalAssets}`);
      
      // Get recent activity (last 7 days)
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recentActivity = await exchangeTranslate.getTransactions(exchangeName, authRequest, {
        startTimestamp: weekAgo,
        pageSize: 50
      });
      
      console.log(`Recent activity (last 7 days): ${recentActivity.items.length} transactions`);
      
      // Analyze transaction types
      const transactionTypes = new Map();
      recentActivity.items.forEach((tx) => {
        const type = tx.classificationData.type;
        transactionTypes.set(type, (transactionTypes.get(type) || 0) + 1);
      });
      
      console.log("Transaction type breakdown:");
      transactionTypes.forEach((count, type) => {
        console.log(`  ${type}: ${count} transactions`);
      });
      
    } catch (error) {
      console.error(`Error monitoring portfolio for ${exchangeName}:`, error);
    }
  }
  
  // Example usage
  const authRequest: ExchangeTranslateAuthRequest = {
    auth: {
      apiKey: "YOUR_EXCHANGE_API_KEY",
      walletAddress: "0x1234567890123456789012345678901234567890",
      testnet: false
    }
  };
  
  await monitorPortfolio("hyperliquid", authRequest);
}

// Export for use in other modules
export { exchangeTranslateExample, advancedExchangeExample };

// Run the example if this file is executed directly
if (require.main === module) {
  exchangeTranslateExample()
    .then(() => {
      console.log("\nBasic example completed successfully!");
      return advancedExchangeExample();
    })
    .then(() => {
      console.log("\nAdvanced example completed successfully!");
    })
    .catch((error) => {
      console.error("Example failed:", error);
      process.exit(1);
    });
}
